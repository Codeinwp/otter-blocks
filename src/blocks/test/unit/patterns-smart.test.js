/**
 * Internal dependencies.
 */
import {
	getSearchText,
	getSlugWords,
	getElements,
	getTone,
	getLayout,
	getAccess,
	getMeta,
	tokenLabel,
	parseQuery,
	createSearchIndex,
	fuzzyMatches,
	matchToken,
	suggestTags,
	similar
} from '../../plugins/patterns-library/smart.js';

/**
 * Build a pattern fixture. Each gets a unique name so the module-level caches
 * in smart.js never collide between tests.
 *
 * @param {Object} overrides Pattern fields to set.
 * @return {Object} Pattern.
 */
let counter = 0;
const makePattern = ( overrides = {}) => ({
	name: 'otter-blocks/fixture-' + ( counter++ ),
	title: 'Fixture',
	categories: [ 'otter-blocks' ],
	content: '',
	...overrides
});

// Markup helpers mirroring the conventions smart.js parses.
const awSection = ( className, inner = '' ) =>
	`<!-- wp:atomic-wind/box {"tagName":"section","align":"full","className":"${ className }"} --><section>${ inner }</section><!-- /wp:atomic-wind/box -->`;

describe( 'getSearchText', () => {
	it( 'strips block delimiters and HTML, leaving rendered copy', () => {
		const pattern = makePattern({
			content: awSection( 'bg-white', '<!-- wp:atomic-wind/text --><h2 class="text-2xl">Hello world</h2><!-- /wp:atomic-wind/text -->' )
		});

		const text = getSearchText( pattern );

		expect( text ).toContain( 'Hello world' );
		expect( text ).not.toContain( 'wp:atomic-wind' );
		expect( text ).not.toContain( 'class=' );
		expect( text ).not.toContain( '<' );
	});

	it( 'decodes the common entities and drops the rest', () => {
		const pattern = makePattern({
			content: '<p>Tom&#8217;s caf&eacute; &#8212; news &amp; more</p>'
		});

		const text = getSearchText( pattern );

		expect( text ).toContain( 'Tom\'s' );
		expect( text ).toContain( 'news & more' );
		expect( text ).not.toContain( '&' + '#' );
		expect( text ).not.toContain( 'eacute' );
	});

	it( 'caps the extracted text at 600 characters', () => {
		const pattern = makePattern({ content: '<p>' + 'word '.repeat( 400 ) + '</p>' });

		expect( getSearchText( pattern ).length ).toBeLessThanOrEqual( 600 );
	});

	it( 'handles a missing content field', () => {
		expect( getSearchText( makePattern({ content: undefined }) ) ).toBe( '' );
	});
});

describe( 'getSlugWords', () => {
	it( 'returns meaningful words from the slug', () => {
		expect( getSlugWords({ name: 'otter-blocks/stats-poster-figures' }) ).toBe( 'stats poster figures' );
	});

	it( 'drops short words and stopwords', () => {
		// "with" is a stopword, "a" is too short.
		expect( getSlugWords({ name: 'otter-blocks/hero-with-a-button' }) ).toBe( 'hero button' );
	});

	it( 'handles a missing name', () => {
		expect( getSlugWords({}) ).toBe( '' );
	});
});

describe( 'getElements', () => {
	it( 'detects elements from their markup signals', () => {
		const pattern = makePattern({
			content: '<!-- wp:themeisle-blocks/form --><!-- wp:image --><!-- wp:video -->'
		});

		const elements = getElements( pattern );

		expect( elements ).toEqual( expect.arrayContaining([ 'form', 'image', 'video' ]) );
		expect( elements ).not.toContain( 'map' );
	});

	it( 'returns precomputed elements for Pro upsell cards', () => {
		const pattern = makePattern({ isPro: true, elements: [ 'carousel' ], content: '<!-- wp:image -->' });

		// isPro short-circuits to the server-provided facets, ignoring content.
		expect( getElements( pattern ) ).toEqual([ 'carousel' ]);
	});

	it( 'returns an empty array for a Pro card with no elements', () => {
		expect( getElements( makePattern({ isPro: true }) ) ).toEqual([]);
	});
});

describe( 'getTone', () => {
	it( 'reads dark from an Atomic Wind section background', () => {
		expect( getTone( makePattern({ content: awSection( 'bg-neutral-900 px-6 py-24' ) }) ) ).toBe( 'dark' );
	});

	it( 'reads dark from a gradient origin', () => {
		expect( getTone( makePattern({ content: awSection( 'bg-gradient-to-br from-slate-900 to-black' ) }) ) ).toBe( 'dark' );
	});

	it( 'treats a light Atomic Wind section as light', () => {
		expect( getTone( makePattern({ content: awSection( 'bg-neutral-50 px-6' ) }) ) ).toBe( 'light' );
	});

	it( 'falls back to the first backgroundColor hex luminance for classic patterns', () => {
		expect( getTone( makePattern({ content: '<!-- wp:group {"backgroundColor":"#111111"} -->' }) ) ).toBe( 'dark' );
		expect( getTone( makePattern({ content: '<!-- wp:group {"backgroundColor":"#ffffff"} -->' }) ) ).toBe( 'light' );
	});

	it( 'defaults to light when no background is detectable', () => {
		expect( getTone( makePattern({ content: '<p>plain</p>' }) ) ).toBe( 'light' );
	});

	it( 'honours the precomputed tone of a Pro card', () => {
		expect( getTone( makePattern({ isPro: true, tone: 'dark', content: awSection( 'bg-white' ) }) ) ).toBe( 'dark' );
		expect( getTone( makePattern({ isPro: true }) ) ).toBe( 'light' );
	});
});

describe( 'getLayout', () => {
	it( 'picks the widest grid column count', () => {
		expect( getLayout( makePattern({ content: 'grid-cols-2 ... md:grid-cols-3' }) ) ).toBe( 'cols-3' );
	});

	it( 'clamps 4 or more columns to cols-4', () => {
		expect( getLayout( makePattern({ content: 'grid-cols-6' }) ) ).toBe( 'cols-4' );
	});

	it( 'returns null when there is no multi-column grid', () => {
		expect( getLayout( makePattern({ content: 'flex flex-col' }) ) ).toBeNull();
	});

	it( 'honours the precomputed layout of a Pro card', () => {
		expect( getLayout( makePattern({ isPro: true, layout: 'cols-2', content: 'grid-cols-4' }) ) ).toBe( 'cols-2' );
		expect( getLayout( makePattern({ isPro: true }) ) ).toBeNull();
	});
});

describe( 'getAccess', () => {
	it( 'marks upsell cards as pro', () => {
		expect( getAccess({ isPro: true, name: 'otter-blocks/x' }) ).toBe( 'pro' );
	});

	it( 'marks otter-pro namespaced patterns as pro', () => {
		expect( getAccess({ name: 'otter-pro/some-pattern' }) ).toBe( 'pro' );
	});

	it( 'marks everything else as free', () => {
		expect( getAccess({ name: 'otter-blocks/some-pattern' }) ).toBe( 'free' );
		expect( getAccess({}) ).toBe( 'free' );
	});
});

describe( 'getMeta', () => {
	it( 'parses group:value keywords into a map', () => {
		const meta = getMeta( makePattern({ keywords: [ 'style:editorial', 'use:saas', 'feat:dark', 'plain-keyword' ] }) );

		expect( meta ).toEqual({
			style: [ 'editorial' ],
			use: [ 'saas' ],
			feat: [ 'dark' ]
		});
	});

	it( 'collects multiple values for the same group', () => {
		expect( getMeta( makePattern({ keywords: [ 'use:saas', 'use:agency' ] }) ).use ).toEqual([ 'saas', 'agency' ]);
	});

	it( 'returns an empty map when there are no keywords', () => {
		expect( getMeta( makePattern({}) ) ).toEqual({});
	});
});

describe( 'parseQuery', () => {
	it( 'maps known words to element and category tokens', () => {
		const { tokens } = parseQuery( 'pricing with image' );

		expect( tokens ).toEqual( expect.arrayContaining([
			expect.objectContaining({ kind: 'category', value: 'pricing' }),
			expect.objectContaining({ kind: 'element', value: 'image' })
		]) );
	});

	it( 'keeps unknown, non-stopword words as free text', () => {
		const { tokens, text } = parseQuery( 'minimalist hero' );

		expect( text ).toContain( 'minimalist' );
		expect( tokens ).toContainEqual( expect.objectContaining({ kind: 'category', value: 'header' }) );
	});

	it( 'drops stopwords from the text terms', () => {
		const { text } = parseQuery( 'the section with a thing' );

		expect( text ).toEqual([ 'thing' ]);
	});

	it( 'deduplicates synonym tokens that resolve to the same value', () => {
		const { tokens } = parseQuery( 'photo photos picture' );

		expect( tokens.filter( token => 'image' === token.value ) ).toHaveLength( 1 );
	});

	it( 'records the source word so the UI can strip it', () => {
		const { tokens } = parseQuery( 'CTA' );

		expect( tokens[ 0 ] ).toMatchObject({ kind: 'category', value: 'call-to-action', word: 'cta' });
	});
});

describe( 'tokenLabel', () => {
	it( 'resolves a category label from the provided map', () => {
		expect( tokenLabel({ kind: 'category', value: 'header' }, { header: 'Hero' }) ).toBe( 'Hero' );
	});

	it( 'falls back to the raw value when the category has no label', () => {
		expect( tokenLabel({ kind: 'category', value: 'mystery' }) ).toBe( 'mystery' );
	});

	it( 'labels tone, access and layout tokens', () => {
		expect( tokenLabel({ kind: 'tone', value: 'dark' }) ).toBe( 'Dark' );
		expect( tokenLabel({ kind: 'access', value: 'pro' }) ).toBe( 'Pro' );
		expect( tokenLabel({ kind: 'layout', value: 'cols-3' }) ).toBe( '3 columns' );
	});

	it( 'labels element tokens', () => {
		expect( tokenLabel({ kind: 'element', value: 'form' }) ).toBe( 'Has form' );
	});

	it( 'labels meta tokens, title-casing unknown values', () => {
		expect( tokenLabel({ kind: 'meta', group: 'style', value: 'editorial' }) ).toBe( 'Editorial' );
		expect( tokenLabel({ kind: 'meta', group: 'use', value: 'real-estate' }) ).toBe( 'Real estate' );
	});
});

describe( 'matchToken', () => {
	const pattern = makePattern({
		categories: [ 'otter-blocks', 'pricing' ],
		content: awSection( 'bg-neutral-900 grid-cols-3', '<!-- wp:image -->' ),
		keywords: [ 'style:editorial' ]
	});

	it( 'matches by category', () => {
		expect( matchToken( pattern, { kind: 'category', value: 'pricing' }) ).toBe( true );
		expect( matchToken( pattern, { kind: 'category', value: 'team' }) ).toBe( false );
	});

	it( 'matches by tone, layout, element and meta', () => {
		expect( matchToken( pattern, { kind: 'tone', value: 'dark' }) ).toBe( true );
		expect( matchToken( pattern, { kind: 'layout', value: 'cols-3' }) ).toBe( true );
		expect( matchToken( pattern, { kind: 'element', value: 'image' }) ).toBe( true );
		expect( matchToken( pattern, { kind: 'meta', group: 'style', value: 'editorial' }) ).toBe( true );
	});

	it( 'matches by access', () => {
		expect( matchToken( makePattern({ isPro: true }), { kind: 'access', value: 'pro' }) ).toBe( true );
		expect( matchToken( pattern, { kind: 'access', value: 'free' }) ).toBe( true );
	});
});

describe( 'createSearchIndex + fuzzyMatches', () => {
	const labels = { features: 'Features', pricing: 'Pricing' };
	const patterns = [
		makePattern({ name: 'otter-blocks/p-hero', title: 'Hero Banner', categories: [ 'header' ], content: '<p>Launch your product today</p>' }),
		makePattern({ name: 'otter-blocks/p-price', title: 'Pricing Tiers', categories: [ 'pricing' ], description: 'Compare subscription plans', content: '<p>Monthly and yearly billing</p>' })
	];

	it( 'returns null when there are no text terms', () => {
		expect( fuzzyMatches( createSearchIndex( patterns, labels ), [] ) ).toBeNull();
	});

	it( 'matches a pattern title fuzzily', () => {
		const scores = fuzzyMatches( createSearchIndex( patterns, labels ), [ 'pricing' ] );

		expect( scores.has( 'otter-blocks/p-price' ) ).toBe( true );
	});

	it( 'matches against the indexed description (commit: searchable description)', () => {
		const scores = fuzzyMatches( createSearchIndex( patterns, labels ), [ 'subscription' ] );

		expect( scores.has( 'otter-blocks/p-price' ) ).toBe( true );
		expect( scores.has( 'otter-blocks/p-hero' ) ).toBe( false );
	});

	it( 'intersects multiple terms — every term must match', () => {
		const index = createSearchIndex( patterns, labels );
		// "pricing" hits p-price; "hero" does not, so the intersection is empty.
		const scores = fuzzyMatches( index, [ 'pricing', 'hero' ] );

		expect( scores.size ).toBe( 0 );
	});
});

describe( 'suggestTags', () => {
	it( 'only surfaces facets that split the scope (>=2 and < all)', () => {
		const scope = [
			makePattern({ content: awSection( 'bg-neutral-900' ) }), // dark
			makePattern({ content: awSection( 'bg-neutral-900' ) }), // dark
			makePattern({ content: awSection( 'bg-white' ) }),       // light
			makePattern({ content: awSection( 'bg-white' ) })        // light
		];

		const keys = suggestTags( scope ).map( tag => tag.key );

		expect( keys ).toContain( 'tone:dark' );
		expect( keys ).toContain( 'tone:light' );
	});

	it( 'omits a facet shared by every pattern', () => {
		const scope = [
			makePattern({ content: awSection( 'bg-neutral-900' ) }),
			makePattern({ content: awSection( 'bg-neutral-900' ) })
		];

		// All dark → tone no longer distinguishes anything.
		expect( suggestTags( scope ).some( tag => 'tone' === tag.kind ) ).toBe( false );
	});

	it( 'leads with the free/pro access facet', () => {
		const scope = [
			makePattern({ isPro: true }),
			makePattern({ isPro: true }),
			makePattern({}),
			makePattern({})
		];

		const tags = suggestTags( scope );

		expect( tags[ 0 ].kind ).toBe( 'access' );
		expect( tags.map( tag => tag.key ) ).toEqual( expect.arrayContaining([ 'access:free', 'access:pro' ]) );
	});

	it( 'respects the max cap', () => {
		const scope = Array.from({ length: 8 }, ( _, index ) =>
			makePattern({
				content: awSection( 0 === index % 2 ? 'bg-neutral-900 grid-cols-3' : 'bg-white grid-cols-2', '<!-- wp:image --><!-- wp:themeisle-blocks/form -->' ),
				keywords: [ 'style:editorial', 'use:saas' ]
			})
		);

		expect( suggestTags( scope, 3 ).length ).toBeLessThanOrEqual( 3 );
	});
});

describe( 'similar', () => {
	it( 'ranks shared category higher than shared element', () => {
		const reference = makePattern({ name: 'otter-blocks/ref', categories: [ 'otter-blocks', 'pricing' ], content: '<!-- wp:image -->' });

		const sameCategory = makePattern({ name: 'otter-blocks/same-cat', categories: [ 'otter-blocks', 'pricing' ], content: '<p>no image</p>' });
		const sameElement = makePattern({ name: 'otter-blocks/same-el', categories: [ 'otter-blocks', 'team' ], content: '<!-- wp:image -->' });

		const ranked = similar( reference, [ sameCategory, sameElement ], 4 );

		expect( ranked[ 0 ].name ).toBe( 'otter-blocks/same-cat' );
	});

	it( 'ignores generic categories when scoring', () => {
		const reference = makePattern({ name: 'otter-blocks/ref2', categories: [ 'otter-blocks', 'pages' ], content: '<p>x</p>' });
		// Candidate shares only generic categories → score 0, still returned but unranked.
		const candidate = makePattern({ name: 'otter-blocks/cand2', categories: [ 'otter-blocks', 'pages' ], content: '<p>y</p>' });

		expect( similar( reference, [ candidate ] ) ).toHaveLength( 1 );
	});

	it( 'excludes the reference pattern itself and caps at k', () => {
		const reference = makePattern({ name: 'otter-blocks/ref3', categories: [ 'pricing' ] });
		const candidates = Array.from({ length: 6 }, ( _, index ) =>
			makePattern({ name: 'otter-blocks/c-' + index, categories: [ 'pricing' ] })
		);

		const ranked = similar( reference, [ reference, ...candidates ], 4 );

		expect( ranked ).toHaveLength( 4 );
		expect( ranked.some( pattern => pattern.name === reference.name ) ).toBe( false );
	});
});
