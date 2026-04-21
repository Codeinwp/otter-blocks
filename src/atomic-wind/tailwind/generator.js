// eslint-disable-next-line import/no-unresolved
import * as tailwindcss from 'tailwindcss';
import indexCSS from 'tailwindcss/index.css';
import preflightCSS from 'tailwindcss/preflight.css';
import themeCSS from 'tailwindcss/theme.css';
import utilitiesCSS from 'tailwindcss/utilities.css';

const assets = {
	index: indexCSS,
	preflight: preflightCSS,
	theme: themeCSS,
	utilities: utilitiesCSS,
};

const stylesheetMap = {
	tailwindcss: { path: 'virtual:tailwindcss/index.css', content: assets.index },
	'tailwindcss/preflight': { path: 'virtual:tailwindcss/preflight.css', content: assets.preflight },
	'tailwindcss/preflight.css': { path: 'virtual:tailwindcss/preflight.css', content: assets.preflight },
	'./preflight.css': { path: 'virtual:tailwindcss/preflight.css', content: assets.preflight },
	'tailwindcss/theme': { path: 'virtual:tailwindcss/theme.css', content: assets.theme },
	'tailwindcss/theme.css': { path: 'virtual:tailwindcss/theme.css', content: assets.theme },
	'./theme.css': { path: 'virtual:tailwindcss/theme.css', content: assets.theme },
	'tailwindcss/utilities': { path: 'virtual:tailwindcss/utilities.css', content: assets.utilities },
	'tailwindcss/utilities.css': { path: 'virtual:tailwindcss/utilities.css', content: assets.utilities },
	'./utilities.css': { path: 'virtual:tailwindcss/utilities.css', content: assets.utilities },
};

let compiler;
const classes = new Set();
let buildQueue = Promise.resolve();
let sheet = createStyleTag( document );
let observer;
let contextObserver;
let activeRoot;
let activeScopeSelector = '';
let activeDocument = document;

function createStyleTag( doc ) {
	const tag = doc.createElement( 'style' );
	tag.id = 'atomic-wind-tailwind';
	return tag;
}

function ensureStyleTag( doc ) {
	if ( sheet.ownerDocument !== doc ) {
		if ( sheet.parentNode ) {
			sheet.parentNode.removeChild( sheet );
		}
		sheet = createStyleTag( doc );
	}

	if ( doc.head && ! sheet.isConnected ) {
		doc.head.append( sheet );
	}
}

function resolveEditorContext() {
	const iframe = document.querySelector( 'iframe[name^="editor-canvas"]' );
	const iframeDoc = iframe?.contentWindow?.document;

	if ( iframeDoc?.body ) {
		// In iframe mode the preview lives in an isolated document, so no selector prefixing is needed.
		return { root: iframeDoc.documentElement, scopeSelector: '', scopeDocument: iframeDoc };
	}

	const wrapper = document.querySelector( '.editor-styles-wrapper' );
	if ( wrapper ) {
		return { root: wrapper, scopeSelector: ':where(.editor-styles-wrapper)', scopeDocument: document };
	}

	const rootContainer = document.querySelector( '.is-root-container' );
	if ( rootContainer ) {
		return { root: rootContainer, scopeSelector: ':where(.is-root-container)', scopeDocument: document };
	}

	return null;
}

function splitSelectorList( selectorText ) {
	const selectors = [];
	let current = '';
	let parenDepth = 0;
	let bracketDepth = 0;
	let braceDepth = 0;
	let inSingleQuote = false;
	let inDoubleQuote = false;
	let escaped = false;

	for ( const char of selectorText ) {
		if ( escaped ) {
			current += char;
			escaped = false;
			continue;
		}

		if ( '\\' === char ) {
			current += char;
			escaped = true;
			continue;
		}

		if ( '\'' === char && ! inDoubleQuote ) {
			inSingleQuote = ! inSingleQuote;
			current += char;
			continue;
		}

		if ( '"' === char && ! inSingleQuote ) {
			inDoubleQuote = ! inDoubleQuote;
			current += char;
			continue;
		}

		if ( inSingleQuote || inDoubleQuote ) {
			current += char;
			continue;
		}

		if ( '(' === char ) {
			parenDepth++;
			current += char;
			continue;
		}
		if ( ')' === char ) {
			parenDepth = Math.max( 0, parenDepth - 1 );
			current += char;
			continue;
		}

		if ( '[' === char ) {
			bracketDepth++;
			current += char;
			continue;
		}
		if ( ']' === char ) {
			bracketDepth = Math.max( 0, bracketDepth - 1 );
			current += char;
			continue;
		}

		if ( '{' === char ) {
			braceDepth++;
			current += char;
			continue;
		}
		if ( '}' === char ) {
			braceDepth = Math.max( 0, braceDepth - 1 );
			current += char;
			continue;
		}

		if ( ',' === char && 0 === parenDepth && 0 === bracketDepth && 0 === braceDepth ) {
			selectors.push( current.trim() );
			current = '';
			continue;
		}

		current += char;
	}

	if ( current.trim() ) {
		selectors.push( current.trim() );
	}

	return selectors;
}

function prefixSelectorList( selectorText, scopeSelector ) {
	return splitSelectorList( selectorText )
		.map( ( selector ) => {
			if ( /^(:root|:host|html|body)(\b|$|:|\.|#|\[)/.test( selector ) ) {
				return scopeSelector;
			}

			return `${scopeSelector} ${selector}`;
		} )
		.join( ', ' );
}

function scopeRuleCss( rule, scopeSelector ) {
	if ( CSSRule.STYLE_RULE === rule.type ) {
		const open = rule.cssText.indexOf( '{' );
		if ( -1 === open ) {
			return rule.cssText;
		}

		const prefixedSelector = prefixSelectorList( rule.selectorText, scopeSelector );
		const body = rule.cssText.slice( open );
		return `${prefixedSelector}${body}`;
	}

	if (
		CSSRule.FONT_FACE_RULE === rule.type ||
		CSSRule.KEYFRAMES_RULE === rule.type ||
		( 'PROPERTY_RULE' in CSSRule && CSSRule.PROPERTY_RULE === rule.type )
	) {
		return rule.cssText;
	}

	if ( rule.cssRules && rule.cssRules.length > 0 ) {
		const open = rule.cssText.indexOf( '{' );
		const close = rule.cssText.lastIndexOf( '}' );
		if ( -1 !== open && -1 !== close ) {
			return `${rule.cssText.slice( 0, open + 1 )}${scopeCssRules( rule.cssRules, scopeSelector )}}`;
		}
	}

	return rule.cssText;
}

function scopeCssRules( rules, scopeSelector ) {
	return Array.from( rules ).map( ( rule ) => scopeRuleCss( rule, scopeSelector ) ).join( '' );
}

function scopeGeneratedCss( css, scopeSelector ) {
	if ( ! css || ! scopeSelector ) {
		return css;
	}

	try {
		const parsed = new CSSStyleSheet();
		parsed.replaceSync( css );
		return scopeCssRules( parsed.cssRules, scopeSelector );
	} catch ( error ) {
		console.error( error );
		return css;
	}
}

function attachObserver( root ) {
	if ( observer ) {
		observer.disconnect();
	}

	observer = new MutationObserver( ( records ) => {
		const full = 0;
		let incremental = 0;

		for ( const record of records ) {
			for ( const node of record.addedNodes ) {
				if ( node.nodeType !== Node.ELEMENT_NODE ) {
					continue;
				}
				incremental++;
			}

			if ( record.type === 'attributes' ) {
				incremental++;
			}
		}

		if ( full > 0 ) {
			rebuild( 'full' );
		} else if ( incremental > 0 ) {
			rebuild( 'incremental' );
		}
	} );

	observer.observe( root, {
		attributes: true,
		attributeFilter: [ 'class' ],
		childList: true,
		subtree: true,
	} );
}

function syncContext() {
	const context = resolveEditorContext();
	if ( ! context ) {
		return false;
	}

	const contextChanged =
		activeRoot !== context.root ||
		activeScopeSelector !== context.scopeSelector ||
		activeDocument !== context.scopeDocument;

	activeRoot = context.root;
	activeScopeSelector = context.scopeSelector;
	activeDocument = context.scopeDocument;

	if ( contextChanged ) {
		classes.clear();
		attachObserver( activeRoot );
	}

	return true;
}

function watchContextChanges() {
	if ( contextObserver ) {
		contextObserver.disconnect();
	}

	contextObserver = new MutationObserver( () => {
		const context = resolveEditorContext();
		if ( ! context ) {
			return;
		}

		const contextChanged =
			activeRoot !== context.root ||
			activeScopeSelector !== context.scopeSelector ||
			activeDocument !== context.scopeDocument;

		if ( contextChanged ) {
			rebuild( 'full' );
		}
	} );

	contextObserver.observe( document.documentElement, {
		childList: true,
		subtree: true,
	} );
}

async function loadStylesheet( id, base ) {
	const entry = stylesheetMap[ id ];
	if ( ! entry ) {
		throw new Error( `Unsupported @import "${ id }"` );
	}
	return { path: entry.path, base, content: entry.content };
}

async function loadModule() {
	throw new Error( 'Plugins and config files are not supported in the browser build.' );
}

async function createCompiler() {
	compiler = await tailwindcss.compile(
		'@import "tailwindcss" important;\n',
		{ base: '/', loadStylesheet, loadModule }
	);
	classes.clear();
}

async function build( kind ) {
	if ( ! compiler ) {
		return;
	}

	if ( ! syncContext() ) {
		return;
	}

	const newClasses = new Set();

	for ( const el of activeRoot.querySelectorAll( '[class]' ) ) {
		for ( const c of el.classList ) {
			if ( ! classes.has( c ) ) {
				classes.add( c );
				newClasses.add( c );
			}
		}
	}

	if ( newClasses.size === 0 && kind === 'incremental' ) {
		return;
	}

	const generated = compiler.build( Array.from( newClasses ) );
	const scopedCss = activeScopeSelector ? scopeGeneratedCss( generated, activeScopeSelector ) : generated;
	ensureStyleTag( activeDocument );
	sheet.textContent = scopedCss;
}

function rebuild( kind ) {
	buildQueue = buildQueue
		.then( async () => {
			if ( kind === 'full' ) {
				await createCompiler();
			}
			await build( kind );
		} )
		.catch( console.error );
}

document.addEventListener( 'DOMContentLoaded', () => {
	let retries = 0;
	const maxRetries = 20;

	const startBuild = () => {
		buildQueue = buildQueue
			.then( async () => {
				await createCompiler();
				await build( 'full' );
				document.dispatchEvent( new CustomEvent( 'atomic-wind:css-ready' ) );
			} )
			.catch( console.error );
	};

	const waitForEditorContext = () => {
		if ( syncContext() ) {
			startBuild();
			watchContextChanges();
			return;
		}

		retries++;
		if ( retries <= maxRetries ) {
			setTimeout( waitForEditorContext, 150 );
		}
	};

	waitForEditorContext();
} );
