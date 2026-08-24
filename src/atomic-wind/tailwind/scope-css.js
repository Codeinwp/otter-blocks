/**
 * Selector rewriting for the generated Tailwind stylesheet.
 *
 * Tailwind ships preflight, whose rules target bare HTML elements (`h1`,
 * `button`, `img`, `*`). Injected as-is they reset the whole document and win
 * over the theme's own element styles, so every element-anchored rule is
 * confined to the Atomic Wind block subtree. Class-anchored rules (the
 * utilities) stay global — they only match our generated markup anyway.
 */

const ATOMIC_ROOT = '[class*="wp-block-atomic-wind-"]';
const ATOMIC_MATCH = `:where(${ ATOMIC_ROOT }, ${ ATOMIC_ROOT } *)`;
// Zero specificity, so a theme rule aimed at the block wrapper still wins.
const ATOMIC_SELF = `:where(${ ATOMIC_ROOT })`;

// At-rules whose bodies are not selector lists and must be emitted verbatim.
const OPAQUE_AT_RULE = /^@(-[a-z]+-)?(keyframes|font-face|property|counter-style|font-feature-values|font-palette-values|page|viewport|charset|import|namespace)\b/i;

// Document-level selectors: they carry inherited defaults, not element resets.
const ROOT_SELECTOR = /^(:root|:host|html|body)($|[\s:.#[(,>+~])/;

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
 * Whether the subject is already anchored to a class or id.
 *
 * Those are the generated utilities; attribute-only subjects (`[hidden]`) still
 * match theme markup, so they get scoped like bare elements do.
 *
 * @param {string} subject Subject compound.
 * @return {boolean} True when the rule cannot leak onto theme markup.
 */
function isAnchored( subject ) {
	const mask = topLevelMask( subject );

	for ( let i = 0; i < subject.length; i++ ) {
		if ( mask[ i ] && ( '.' === subject[ i ] || '#' === subject[ i ] ) ) {
			return true;
		}
	}

	return false;
}

/**
 * Confine one selector to the Atomic Wind subtree when it targets bare elements.
 *
 * @param {string} selector Single selector.
 * @return {string} Scoped selector.
 */
function scopeSelectorToBlocks( selector ) {
	if ( ROOT_SELECTOR.test( selector ) ) {
		return ATOMIC_SELF;
	}

	const start = subjectStart( selector );
	const subject = selector.slice( start );

	if ( isAnchored( subject ) ) {
		return selector;
	}

	const prefix = selector.slice( 0, start );
	const pseudo = pseudoElementStart( subject );
	const base = -1 === pseudo ? subject : subject.slice( 0, pseudo );
	const suffix = -1 === pseudo ? '' : subject.slice( pseudo );

	return `${ prefix }${ base || '*' }${ ATOMIC_MATCH }${ suffix }`;
}

/**
 * Whether a declaration block only defines custom properties.
 *
 * Those rules feed `var()` lookups instead of styling anything, so they are
 * safe to leave at their original scope.
 *
 * @param {string} body Declaration block, without the braces.
 * @return {boolean} True for custom-property-only blocks.
 */
function isCustomPropertyOnly( body ) {
	if ( body.includes( '{' ) ) {
		return false;
	}

	const declarations = body.split( ';' ).map( ( declaration ) => declaration.trim() ).filter( Boolean );

	return 0 < declarations.length && declarations.every( ( declaration ) => declaration.startsWith( '--' ) );
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
 * A falsy return from `transform` drops the rule.
 *
 * @param {string}   css       Stylesheet text.
 * @param {Function} transform Receives the selector list and the declaration block.
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
				const selector = transform( trimmed, body );
				if ( selector ) {
					out += `${ selector }{${ body }}`;
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
 * Keep Tailwind's element resets inside Atomic Wind blocks.
 *
 * @param {string} css Generated stylesheet.
 * @return {string} Scoped stylesheet.
 */
export function scopeToAtomicWind( css ) {
	if ( ! css ) {
		return css;
	}

	return transformCssSelectors( css, ( selectorText, body ) => {
		if ( isCustomPropertyOnly( body ) ) {
			return selectorText;
		}

		const scoped = splitSelectorList( selectorText ).map( scopeSelectorToBlocks );

		return Array.from( new Set( scoped ) ).join( ', ' );
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
			.map( ( selector ) => ( ROOT_SELECTOR.test( selector ) ? scopeSelector : `${ scopeSelector } ${ selector }` ) )
			.join( ', ' )
	);
}
