/**
 * Selector rewriting for the generated Tailwind stylesheet.
 *
 * Scope Tailwind resets and utilities to Atomic Wind blocks to prevent theme conflicts.
 */

// Must match Atomic_Wind_Blocks::ATOMIC_WIND_CSS_VERSION; bump both when the scoped output changes.
export const CSS_VERSION = '1.0.2';

const ATOMIC_ROOT = '[class*="wp-block-atomic-wind-"]';
// Zero specificity, so a theme rule aimed at the block wrapper still wins.
const ATOMIC_SELF = `:where(${ ATOMIC_ROOT })`;
const ATOMIC_MATCH = `:where(${ ATOMIC_ROOT }, ${ ATOMIC_ROOT } *)`;

// At-rules whose bodies are not selector lists and must be emitted verbatim.
const OPAQUE_AT_RULE = /^@(-[a-z]+-)?(keyframes|font-face|property|counter-style|font-feature-values|font-palette-values|page|viewport|charset|import|namespace)\b/i;

// Document-level subjects: they carry inherited defaults, not element resets.
const ROOT_SELECTOR = /^(:root|:host|html|body)$/;

// Root defaults that are safe to repeat on every block wrapper; anything else must be inherited.
const WRAPPER_PROPERTY = /^(--.+|tab-size|(-webkit-)?text-size-adjust|-webkit-tap-highlight-color)$/;

const ROOT_PREFIX = /^(:root|:host|html|body)(?=$|[\s>+~])/;

const LEGACY_PSEUDO_ELEMENT = /^:(before|after|first-line|first-letter)\b/i;

const COMBINATOR = /[\s>+~]/;

/**
 * Mark every character that sits outside brackets, parentheses and strings.
 *
 * @param {string} text Selector or prelude text.
 * @return {boolean[]} Per-character top-level flags.
 */
function topLevelMask( text ) {
	const mask = new Array( text.length ).fill( false );
	let depth = 0;
	let quote = '';
	let escaped = false;

	for ( let i = 0; i < text.length; i++ ) {
		const char = text[ i ];

		if ( escaped ) {
			escaped = false;
			continue;
		}

		if ( '\\' === char ) {
			escaped = true;
			continue;
		}

		if ( quote ) {
			if ( char === quote ) {
				quote = '';
			}
			continue;
		}

		if ( '"' === char || '\'' === char ) {
			quote = char;
			continue;
		}

		if ( '(' === char || '[' === char || '{' === char ) {
			mask[ i ] = 0 === depth;
			depth++;
			continue;
		}

		if ( ')' === char || ']' === char || '}' === char ) {
			depth = Math.max( 0, depth - 1 );
			mask[ i ] = 0 === depth;
			continue;
		}

		mask[ i ] = 0 === depth;
	}

	return mask;
}

/**
 * Split a comma-separated selector list, ignoring commas nested in `:is()` & co.
 *
 * @param {string} selectorText Selector list.
 * @return {string[]} Individual selectors.
 */
export function splitSelectorList( selectorText ) {
	const mask = topLevelMask( selectorText );
	const selectors = [];
	let start = 0;

	for ( let i = 0; i < selectorText.length; i++ ) {
		if ( ',' === selectorText[ i ] && mask[ i ] ) {
			selectors.push( selectorText.slice( start, i ).trim() );
			start = i + 1;
		}
	}

	selectors.push( selectorText.slice( start ).trim() );

	return selectors.filter( Boolean );
}

/**
 * Locate the start of the subject compound (everything after the last combinator).
 *
 * @param {string} selector Single selector.
 * @return {number} Index the subject compound starts at.
 */
function subjectStart( selector ) {
	const mask = topLevelMask( selector );
	let start = 0;

	for ( let i = 0; i < selector.length; i++ ) {
		if ( mask[ i ] && COMBINATOR.test( selector[ i ] ) ) {
			start = i + 1;
		}
	}

	return start;
}

/**
 * Find where the subject's pseudo-element suffix begins.
 *
 * @param {string} subject Subject compound.
 * @return {number} Index of the pseudo-element, or -1.
 */
function pseudoElementStart( subject ) {
	const mask = topLevelMask( subject );

	for ( let i = 0; i < subject.length; i++ ) {
		if ( ! mask[ i ] || ':' !== subject[ i ] ) {
			continue;
		}

		if ( ':' === subject[ i + 1 ] || LEGACY_PSEUDO_ELEMENT.test( subject.slice( i ) ) ) {
			return i;
		}
	}

	return -1;
}

/**
 * Whether a selector targets only the document root.
 *
 * @param {string} selector Single selector.
 * @return {boolean} True for a bare `:root`, `:host`, `html` or `body`.
 */
function isRootOnly( selector ) {
	return 0 === subjectStart( selector ) && ROOT_SELECTOR.test( selector );
}

/**
 * Confine one selector to the Atomic Wind subtree.
 *
 * @param {string} selector Single selector.
 * @return {string} Scoped selector.
 */
function scopeSelectorToBlocks( selector ) {
	if ( isRootOnly( selector ) ) {
		return ATOMIC_SELF;
	}

	const start = subjectStart( selector );
	const subject = selector.slice( start );

	const prefix = selector.slice( 0, start );
	const pseudo = pseudoElementStart( subject );
	const base = -1 === pseudo ? subject : subject.slice( 0, pseudo );
	const suffix = -1 === pseudo ? '' : subject.slice( pseudo );

	return `${ prefix }${ base || '*' }${ ATOMIC_MATCH }${ suffix }`;
}

/**
 * Index of the `}` closing the block opened at `open`.
 *
 * @param {string} css  Stylesheet text.
 * @param {number} open Index of the opening brace.
 * @return {number} Index of the matching brace, or -1 when unterminated.
 */
function blockEnd( css, open ) {
	let depth = 0;
	let quote = '';
	let escaped = false;

	for ( let i = open; i < css.length; i++ ) {
		const char = css[ i ];

		if ( escaped ) {
			escaped = false;
			continue;
		}

		if ( '\\' === char ) {
			escaped = true;
			continue;
		}

		if ( quote ) {
			if ( char === quote ) {
				quote = '';
			}
			continue;
		}

		if ( '/' === char && '*' === css[ i + 1 ] ) {
			const end = css.indexOf( '*/', i + 2 );
			i = -1 === end ? css.length : end + 1;
			continue;
		}

		if ( '"' === char || '\'' === char ) {
			quote = char;
			continue;
		}

		if ( '{' === char ) {
			depth++;
			continue;
		}

		if ( '}' === char ) {
			depth--;
			if ( 0 === depth ) {
				return i;
			}
		}
	}

	return -1;
}

/**
 * Rewrite every style-rule selector in a stylesheet.
 *
 * `transform` returns the selector list, a falsy value to drop the rule, or `[ selector, body ]` pairs to emit in its place.
 *
 * @param {string}                                                                                                  css       Stylesheet text.
 * @param {( selector: string, body: string ) => ( string | false | null | undefined | Array<[ string, string ]> )} transform Receives the selector list and the declaration block.
 * @return {string} Rewritten stylesheet.
 */
export function transformCssSelectors( css, transform ) {
	let out = '';
	let prelude = '';
	let i = 0;

	while ( i < css.length ) {
		const char = css[ i ];

		if ( '/' === char && '*' === css[ i + 1 ] ) {
			const end = css.indexOf( '*/', i + 2 );
			i = -1 === end ? css.length : end + 2;
			continue;
		}

		if ( '\\' === char ) {
			prelude += css.slice( i, i + 2 );
			i += 2;
			continue;
		}

		if ( '"' === char || '\'' === char ) {
			let end = i + 1;
			while ( end < css.length ) {
				if ( '\\' === css[ end ] ) {
					end += 2;
					continue;
				}
				if ( css[ end ] === char ) {
					end++;
					break;
				}
				end++;
			}
			prelude += css.slice( i, end );
			i = end;
			continue;
		}

		if ( '{' === char ) {
			const end = blockEnd( css, i );
			const close = -1 === end ? css.length : end;
			const body = css.slice( i + 1, close );
			const trimmed = prelude.trim();

			if ( trimmed.startsWith( '@' ) ) {
				const inner = OPAQUE_AT_RULE.test( trimmed ) ? body : transformCssSelectors( body, transform );
				out += `${ trimmed }{${ inner }}`;
			} else {
				const result = transform( trimmed, body );
				const rules = Array.isArray( result ) ? result : [[ result, body ]];

				for ( const [ selector, ruleBody ] of rules ) {
					if ( selector ) {
						out += `${ selector }{${ ruleBody }}`;
					}
				}
			}

			prelude = '';
			i = close + 1;
			continue;
		}

		if ( ';' === char ) {
			out += `${ prelude.trim() };`;
			prelude = '';
			i++;
			continue;
		}

		if ( '}' === char ) {
			i++;
			continue;
		}

		prelude += char;
		i++;
	}

	return out + prelude.trim();
}

/**
 * Split a declaration block on top-level semicolons, dropping comments.
 *
 * @param {string} body Declaration block.
 * @return {string[]} The declarations, without comments.
 */
function splitDeclarations( body ) {
	const parts = [];
	let part = '';
	let depth = 0;
	let quote = '';

	for ( let i = 0; i < body.length; i++ ) {
		const char = body[ i ];

		if ( '\\' === char ) {
			part += body.slice( i, i + 2 );
			i++;
			continue;
		}

		if ( quote ) {
			if ( char === quote ) {
				quote = '';
			}
			part += char;
			continue;
		}

		if ( 0 === depth && '/' === char && '*' === body[ i + 1 ] ) {
			const end = body.indexOf( '*/', i + 2 );
			i = -1 === end ? body.length : end + 1;
			continue;
		}

		if ( ';' === char && 0 === depth ) {
			parts.push( part );
			part = '';
			continue;
		}

		if ( '"' === char || '\'' === char ) {
			quote = char;
		} else if ( '(' === char || '[' === char || '{' === char ) {
			depth++;
		} else if ( ')' === char || ']' === char || '}' === char ) {
			depth = Math.max( 0, depth - 1 );
		}

		part += char;
	}

	parts.push( part );

	return parts;
}

/**
 * Reduce a declaration block to the declarations a block wrapper may carry.
 *
 * @param {string} body Declaration block.
 * @return {string} The original body when nothing is removed, else the kept declarations ('' when none).
 */
function wrapperDeclarations( body ) {
	const parts = splitDeclarations( body );

	const kept = parts.filter( ( part ) => {
		const declaration = part.trim();

		if ( ! declaration ) {
			return true;
		}

		const colon = declaration.indexOf( ':' );

		return -1 !== colon && WRAPPER_PROPERTY.test( declaration.slice( 0, colon ).trim().toLowerCase() );
	} );

	if ( kept.length === parts.length ) {
		return body;
	}

	return kept.some( ( part ) => part.trim() ) ? kept.join( ';' ) : '';
}

/**
 * Keep Tailwind's element resets and variables inside Atomic Wind blocks, leaving inherited typography to the theme.
 *
 * @param {string} css Generated stylesheet.
 * @return {string} Scoped stylesheet.
 */
export function scopeToAtomicWind( css ) {
	if ( ! css ) {
		return css;
	}

	return transformCssSelectors( css, ( selectorText, body ) => {
		const selectors = splitSelectorList( selectorText );
		const scope = ( list ) => Array.from( new Set( list.map( scopeSelectorToBlocks ) ) ).join( ', ' );

		if ( ! selectors.some( isRootOnly ) ) {
			return scope( selectors );
		}

		// Set on the wrapper, inherited defaults would beat what the block inherits from the theme.
		const kept = wrapperDeclarations( body );

		if ( kept === body ) {
			return scope( selectors );
		}

		const rules = [];

		if ( kept ) {
			rules.push( [ ATOMIC_SELF, kept ] );
		}

		const others = selectors.filter( ( selector ) => ! isRootOnly( selector ) );

		if ( others.length ) {
			rules.push( [ scope( others ), body ] );
		}

		return rules;
	} );
}

/**
 * Prefix every selector with a container scope (used for the editor canvas).
 *
 * @param {string} css           Generated stylesheet.
 * @param {string} scopeSelector Container selector.
 * @return {string} Prefixed stylesheet.
 */
export function prefixCss( css, scopeSelector ) {
	if ( ! css || ! scopeSelector ) {
		return css;
	}

	return transformCssSelectors( css, ( selectorText ) =>
		splitSelectorList( selectorText )
			.map( ( selector ) => {
				// The container stands in for the document root, so substitute it
				// for a leading root compound rather than prepending.
				const rooted = selector.match( ROOT_PREFIX );

				if ( rooted ) {
					return `${ scopeSelector }${ selector.slice( rooted[ 0 ].length ) }`;
				}

				return `${ scopeSelector } ${ selector }`;
			} )
			.join( ', ' )
	);
}
