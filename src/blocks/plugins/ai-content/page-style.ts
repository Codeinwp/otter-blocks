/**
 * Builds a compact, deterministic "style digest" of the current page so a newly
 * generated section can match what is already there. No LLM call — we just tally
 * the recurring Atomic Wind utility-class conventions (spacing, typography,
 * color, shape) plus a light content-tone cue, and fall back to nothing when the
 * page has too little Atomic Wind signal to be worth matching.
 */

import type { BlockProps } from '../../helpers/blocks';

// Below this many Atomic Wind blocks the page has no real convention to match —
// one stray block is noise that would just over-anchor the model. Skip the
// digest entirely and let the built-in defaults drive the look.
export const PAGE_STYLE_MIN_BLOCKS = 2;

const ATOMIC_WIND_PREFIX = 'atomic-wind/';
const HEADING_TAGS = new Set( [ 'h1', 'h2', 'h3' ] );
const MAX_PER_CATEGORY = 8;
const MAX_TONE_SAMPLES = 2;
const TONE_SAMPLE_MAX_LEN = 80;

type Category = 'spacing' | 'typography' | 'color' | 'shape';

const CATEGORY_LABELS: Record<Category, string> = {
	spacing: 'Spacing & layout',
	typography: 'Typography',
	color: 'Color & surface',
	shape: 'Radius & effects'
};

const CATEGORY_ORDER: Category[] = [ 'spacing', 'typography', 'color', 'shape' ];

const TYPOGRAPHY_TEXT = /^text-(xs|sm|base|lg|[0-9]?xl|left|center|right|justify)$/;
const TYPOGRAPHY_WORDS = new Set( [ 'uppercase', 'lowercase', 'capitalize', 'italic', 'antialiased' ] );

/**
 * Bucket a single (variant-stripped) utility token into a style category, or
 * return null for tokens that carry no styling signal worth surfacing.
 *
 * @param token Tailwind class with any responsive/state variant already removed.
 */
const categorize = ( token: string ): Category | null => {
	if ( /^-?(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|space-x|space-y|max-w|w|min-h|h)-/.test( token ) ) {
		return 'spacing';
	}

	if ( /^(font|leading|tracking)-/.test( token ) || TYPOGRAPHY_TEXT.test( token ) || TYPOGRAPHY_WORDS.has( token ) ) {
		return 'typography';
	}

	if ( /^(bg|text|border|from|via|to|ring|fill|stroke)-/.test( token ) ) {
		return 'color';
	}

	if ( /^(rounded|shadow|opacity-|backdrop-|blur)/.test( token ) ) {
		return 'shape';
	}

	return null;
};

/**
 * Strip responsive/state variants (md:, hover:, focus:, …) so `md:text-7xl` and
 * `text-7xl` tally together while the original token is kept for display.
 *
 * @param token Raw class token.
 */
const baseToken = ( token: string ): string => {
	const colon = token.lastIndexOf( ':' );
	return colon === -1 ? token : token.slice( colon + 1 );
};

const isAtomicWind = ( block: BlockProps<unknown> ): boolean => {
	return 'string' === typeof block.name && block.name.startsWith( ATOMIC_WIND_PREFIX );
};

type Collected = {
	atomicCount: number;
	tallies: Record<Category, Map<string, number>>;
	blockTypes: Set<string>;
	headings: string[];
};

const collect = (
	blocks: BlockProps<unknown>[],
	excluded: Set<string>,
	acc: Collected
): void => {
	for ( const block of blocks || [] ) {
		if ( ! block || excluded.has( block.clientId ) ) {
			continue;
		}

		if ( isAtomicWind( block ) ) {
			acc.atomicCount += 1;
			acc.blockTypes.add( block.name as string );

			const className = block.attributes?.className;

			if ( 'string' === typeof className ) {
				for ( const raw of className.split( /\s+/ ).filter( Boolean ) ) {
					const category = categorize( baseToken( raw ) );

					if ( category ) {
						const tally = acc.tallies[ category ];
						tally.set( raw, ( tally.get( raw ) ?? 0 ) + 1 );
					}
				}
			}

			const tagName = block.attributes?.tagName;
			const content = block.attributes?.content;

			if ( 'string' === typeof tagName && HEADING_TAGS.has( tagName ) && 'string' === typeof content ) {
				const text = content.replace( /<[^>]+>/g, '' ).trim();

				if ( text && acc.headings.length < MAX_TONE_SAMPLES * 4 ) {
					acc.headings.push( text.length > TONE_SAMPLE_MAX_LEN ? `${ text.slice( 0, TONE_SAMPLE_MAX_LEN ) }…` : text );
				}
			}
		}

		if ( block.innerBlocks?.length ) {
			collect( block.innerBlocks as BlockProps<unknown>[], excluded, acc );
		}
	}
};

/**
 * Rank a tally by frequency (then alphabetically for stable output) and return
 * the top tokens.
 *
 * @param tally Token → occurrence count.
 */
const topTokens = ( tally: Map<string, number> ): string[] => {
	return [ ...tally.entries() ]
		.sort( ( a, b ) => ( b[1] - a[1] ) || a[0].localeCompare( b[0] ) )
		.slice( 0, MAX_PER_CATEGORY )
		.map( ( [ token ] ) => token );
};

/**
 * Build the page-style digest for inclusion in a generation prompt.
 *
 * @param blocks  Top-level blocks of the current page.
 * @param options Optional `excludeClientIds` (e.g. the in-place generator block)
 *                whose subtree should not contribute to the digest.
 * @return The digest string, or null when the page lacks enough Atomic Wind
 *         signal (see {@link PAGE_STYLE_MIN_BLOCKS}) to be worth matching.
 */
export const buildPageStyleDigest = (
	blocks: BlockProps<unknown>[],
	options: { excludeClientIds?: string[] } = {}
): string | null => {
	const acc: Collected = {
		atomicCount: 0,
		tallies: { spacing: new Map(), typography: new Map(), color: new Map(), shape: new Map() },
		blockTypes: new Set(),
		headings: []
	};

	collect( blocks, new Set( options.excludeClientIds ?? [] ), acc );

	if ( acc.atomicCount < PAGE_STYLE_MIN_BLOCKS ) {
		return null;
	}

	const lines: string[] = [
		'This section is being added to an existing page. Match its visual style — reuse these recurring Atomic Wind conventions instead of inventing new ones:'
	];

	for ( const category of CATEGORY_ORDER ) {
		const tokens = topTokens( acc.tallies[ category ] );

		if ( tokens.length ) {
			lines.push( `- ${ CATEGORY_LABELS[ category ] }: ${ tokens.join( ', ' ) }` );
		}
	}

	// Only the class conventions carry real weight; bail if nothing meaningful
	// was tallied (e.g. Atomic Wind blocks that happen to carry no styling).
	if ( 1 === lines.length ) {
		return null;
	}

	if ( acc.blockTypes.size ) {
		lines.push( `Composition vocabulary: ${ [ ...acc.blockTypes ].sort().join( ', ' ) }.` );
	}

	const toneSamples = [ ...new Set( acc.headings ) ].slice( 0, MAX_TONE_SAMPLES );

	if ( toneSamples.length ) {
		lines.push(
			`Tone reference (match this voice — do NOT copy the wording): ${ toneSamples.map( ( h ) => `"${ h }"` ).join( ', ' ) }.`
		);
	}

	return lines.join( '\n' );
};
