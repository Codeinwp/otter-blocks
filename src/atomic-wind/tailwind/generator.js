 
import * as tailwindcss from 'tailwindcss';
import indexCSS from 'tailwindcss/index.css';
import preflightCSS from 'tailwindcss/preflight.css';
import themeCSS from 'tailwindcss/theme.css';
import utilitiesCSS from 'tailwindcss/utilities.css';
import { prefixCss, scopeToAtomicWind } from './scope-css';
import { observePreviewBody } from './preview-observer';

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

// One compiler per frame would exhaust the renderer (the editor injects this
// script into the canvas and every preview iframe). Run the full pipeline only
// in the top frame; it already styles the canvas via resolveEditorContext().
function isTopFrame() {
	try {
		return window.self === window.top;
	} catch ( error ) {
		return false;
	}
}

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

	const generated = scopeToAtomicWind( compiler.build( Array.from( newClasses ) ) );
	const scopedCss = activeScopeSelector ? prefixCss( generated, activeScopeSelector ) : generated;
	ensureStyleTag( activeDocument );
	sheet.textContent = scopedCss;
}

// Lets other editor features (the Design Library pattern previews) generate
// Tailwind CSS for an arbitrary class list. Kept separate from the
// canvas compiler: it must not pollute the canvas sheet, and canvas full
// rebuilds reset that compiler, which would drop classes fed in here. The
// compiler is cumulative — each call returns the full stylesheet for every
// class passed so far, so callers can use the result as-is.
let apiCompiler;

window.atomicWindGenerateCss = async ( classNames ) => {
	if ( ! apiCompiler ) {
		apiCompiler = tailwindcss.compile(
			'@import "tailwindcss" important;\n',
			{ base: '/', loadStylesheet, loadModule }
		);
	}

	const instance = await apiCompiler;
	return scopeToAtomicWind( instance.build( Array.from( new Set( classNames ) ) ) );
};

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

function bootstrap() {
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
}

// Style a preview iframe by borrowing the top frame's shared compiler instead
// of building a local one. The canvas iframe is excluded (top frame styles it).
function bootstrapPreviewFrame() {
	if ( ( window.name || '' ).startsWith( 'editor-canvas' ) ) {
		return;
	}

	let queue = Promise.resolve();
	let pending = false;

	const apply = () => {
		pending = false;

		let generate;
		try {
			generate = window.top && window.top.atomicWindGenerateCss;
		} catch ( error ) {
			// Cross-origin parent.
			return;
		}

		if ( 'function' !== typeof generate ) {
			return;
		}

		const found = new Set();
		for ( const el of document.querySelectorAll( '[class]' ) ) {
			for ( const c of el.classList ) {
				found.add( c );
			}
		}

		if ( 0 === found.size ) {
			return;
		}

		queue = queue
			.then( () => generate( Array.from( found ) ) )
			.then( ( css ) => {
				ensureStyleTag( document );
				sheet.textContent = css;
			} )
			.catch( () => {} );
	};

	const schedule = () => {
		if ( pending ) {
			return;
		}
		pending = true;
		( window.requestAnimationFrame || window.setTimeout )( apply );
	};

	// Parent injects markup after load; regenerate when it arrives. Body only,
	// so our own <head> style writes can't retrigger this.
	const observer = new MutationObserver( schedule );
	observePreviewBody( observer, schedule );
}

function start() {
	if ( isTopFrame() ) {
		bootstrap();
	} else {
		bootstrapPreviewFrame();
	}
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', start );
} else {
	start();
}
