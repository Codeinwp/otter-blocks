/**
 * External dependencies.
 */
import Fuse from 'fuse.js';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

/**
 * Smart filtering engine for the Design Library.
 *
 * Registered patterns carry no structured metadata besides categories, so
 * searchable "element" attributes are derived from each pattern's block
 * markup. Powers smart search tokens, the refine tag row and the
 * "More like this" suggestions.
 */

// Element id → markup fragments that signal its presence.
const ELEMENT_SIGNALS = {
	button: [ 'wp:button', 'wp:themeisle-blocks/button', 'wp:atomic-wind/link' ],
	form: [ 'wp:themeisle-blocks/form' ],
	image: [ 'wp:image', 'wp:cover', 'wp:gallery', 'wp:media-text', '<img' ],
	map: [ 'wp:themeisle-blocks/google-map', 'wp:themeisle-blocks/leaflet-map' ],
	carousel: [ 'wp:themeisle-blocks/slider' ],
	countdown: [ 'wp:themeisle-blocks/countdown' ],
	progress: [ 'wp:themeisle-blocks/progress-bar', 'wp:themeisle-blocks/circle-counter' ],
	quote: [ 'wp:quote', 'wp:pullquote' ],
	video: [ 'wp:video', 'wp:embed' ]
};

const ELEMENT_LABELS = {
	button: __( 'Has button', 'otter-blocks' ),
	form: __( 'Has form', 'otter-blocks' ),
	image: __( 'Photos', 'otter-blocks' ),
	map: __( 'Has map', 'otter-blocks' ),
	carousel: __( 'Carousel', 'otter-blocks' ),
	countdown: __( 'Countdown', 'otter-blocks' ),
	progress: __( 'Progress bars', 'otter-blocks' ),
	quote: __( 'Quote', 'otter-blocks' ),
	video: __( 'Video', 'otter-blocks' )
};

// Elements offered as refine toggles. "button" is excluded — nearly every
// pattern has one, so it never meaningfully narrows a result set.
const REFINE_ELEMENTS = [ 'image', 'form', 'carousel', 'countdown', 'map', 'video', 'progress', 'quote' ];

const TONE_LABELS = {
	light: __( 'Light', 'otter-blocks' ),
	dark: __( 'Dark', 'otter-blocks' )
};

// Free vs Pro (upsell) patterns.
const ACCESS_LABELS = {
	free: __( 'Free', 'otter-blocks' ),
	pro: __( 'Pro', 'otter-blocks' )
};

// Column layouts, derived from the widest CSS grid in a pattern. Offered as
// single-select refine tags ("show me the 3-column features").
const LAYOUT_ORDER = [ 'cols-2', 'cols-3', 'cols-4' ];

const LAYOUT_LABELS = {
	'cols-2': __( '2 columns', 'otter-blocks' ),
	'cols-3': __( '3 columns', 'otter-blocks' ),
	'cols-4': __( '4+ columns', 'otter-blocks' )
};

// Author-curated metadata, carried on each pattern's `keywords` as
// `group:value` tokens (e.g. `style:editorial`, `use:saas`). Unlike the
// derived facets above, these describe intent the markup can't reveal.
// Groups render in this order, ahead of the derived facets; values within a
// group fall back to a title-cased token when no explicit label exists.
const META_GROUPS = [ 'style', 'use', 'feat' ];

// Groups where a pattern carries a single value, so the refine tags are
// mutually exclusive (picking one replaces the other).
const EXCLUSIVE_META_GROUPS = [ 'style' ];

const META_GROUP_LABELS = {
	style: __( 'Style', 'otter-blocks' ),
	use: __( 'Use case', 'otter-blocks' ),
	feat: __( 'Feature', 'otter-blocks' )
};

const META_VALUE_LABELS = {
	style: {
		clean: __( 'Clean', 'otter-blocks' ),
		classic: __( 'Classic', 'otter-blocks' ),
		gradient: __( 'Gradient', 'otter-blocks' ),
		neon: __( 'Neon', 'otter-blocks' ),
		mesh: __( 'Mesh', 'otter-blocks' ),
		poster: __( 'Poster', 'otter-blocks' ),
		glass: __( 'Glass', 'otter-blocks' ),
		editorial: __( 'Editorial', 'otter-blocks' )
	}
};

// Search word → token. token = { kind: 'element'|'category', value }
const VOCAB = {
	button: { kind: 'element', value: 'button' },
	buttons: { kind: 'element', value: 'button' },
	image: { kind: 'element', value: 'image' },
	images: { kind: 'element', value: 'image' },
	photo: { kind: 'element', value: 'image' },
	photos: { kind: 'element', value: 'image' },
	picture: { kind: 'element', value: 'image' },
	map: { kind: 'element', value: 'map' },
	maps: { kind: 'element', value: 'map' },
	countdown: { kind: 'element', value: 'countdown' },
	timer: { kind: 'element', value: 'countdown' },
	progress: { kind: 'element', value: 'progress' },
	quote: { kind: 'element', value: 'quote' },
	quotes: { kind: 'element', value: 'quote' },
	video: { kind: 'element', value: 'video' },
	signup: { kind: 'element', value: 'form' },
	'sign-up': { kind: 'element', value: 'form' },
	subscribe: { kind: 'category', value: 'newsletter' },
	newsletter: { kind: 'category', value: 'newsletter' },
	email: { kind: 'element', value: 'form' },
	'opt-in': { kind: 'element', value: 'form' },
	optin: { kind: 'element', value: 'form' },
	hero: { kind: 'category', value: 'header' },
	heroes: { kind: 'category', value: 'header' },
	header: { kind: 'category', value: 'header' },
	headers: { kind: 'category', value: 'header' },
	cta: { kind: 'category', value: 'call-to-action' },
	feature: { kind: 'category', value: 'features' },
	features: { kind: 'category', value: 'features' },
	form: { kind: 'category', value: 'forms' },
	forms: { kind: 'category', value: 'forms' },
	gallery: { kind: 'category', value: 'gallery' },
	team: { kind: 'category', value: 'team' },
	pricing: { kind: 'category', value: 'pricing' },
	price: { kind: 'category', value: 'pricing' },
	testimonial: { kind: 'category', value: 'testimonials' },
	testimonials: { kind: 'category', value: 'testimonials' },
	review: { kind: 'category', value: 'testimonials' },
	reviews: { kind: 'category', value: 'testimonials' },
	faq: { kind: 'category', value: 'faq' },
	faqs: { kind: 'category', value: 'faq' },
	question: { kind: 'category', value: 'faq' },
	questions: { kind: 'category', value: 'faq' },
	contact: { kind: 'category', value: 'contact' },
	waitlist: { kind: 'category', value: 'waitlist' },
	stats: { kind: 'category', value: 'stats' },
	stat: { kind: 'category', value: 'stats' },
	statistic: { kind: 'category', value: 'stats' },
	statistics: { kind: 'category', value: 'stats' },
	metric: { kind: 'category', value: 'stats' },
	metrics: { kind: 'category', value: 'stats' },
	logo: { kind: 'category', value: 'clients' },
	logos: { kind: 'category', value: 'clients' },
	client: { kind: 'category', value: 'clients' },
	clients: { kind: 'category', value: 'clients' },
	partner: { kind: 'category', value: 'clients' },
	partners: { kind: 'category', value: 'clients' },
	portfolio: { kind: 'category', value: 'portfolio' },
	timeline: { kind: 'category', value: 'timeline' },
	blog: { kind: 'category', value: 'blog' },
	news: { kind: 'category', value: 'blog' },
	post: { kind: 'category', value: 'blog' },
	posts: { kind: 'category', value: 'blog' },
	article: { kind: 'category', value: 'blog' },
	articles: { kind: 'category', value: 'blog' },
	icon: { kind: 'category', value: 'icons' },
	icons: { kind: 'category', value: 'icons' },
	illustration: { kind: 'category', value: 'icons' },
	illustrations: { kind: 'category', value: 'icons' },
	rating: { kind: 'category', value: 'testimonials' },
	ratings: { kind: 'category', value: 'testimonials' },
	stars: { kind: 'category', value: 'testimonials' },
	study: { kind: 'category', value: 'case-studies' },
	studies: { kind: 'category', value: 'case-studies' },
	videos: { kind: 'element', value: 'video' },
	dark: { kind: 'tone', value: 'dark' },
	night: { kind: 'tone', value: 'dark' },
	midnight: { kind: 'tone', value: 'dark' },
	light: { kind: 'tone', value: 'light' },
	bright: { kind: 'tone', value: 'light' },
	free: { kind: 'access', value: 'free' },
	pro: { kind: 'access', value: 'pro' }
};

const STOPWORDS = [ 'a', 'an', 'the', 'with', 'and', 'or', 'on', 'in', 'of', 'for', 'to', 'that', 'has', 'section', 'sections', 'template', 'templates', 'pattern', 'patterns', 'block', 'blocks' ];

// Categories that carry no meaning for similarity scoring.
const GENERIC_CATEGORIES = [ 'otter-blocks', 'featured', 'pages' ];

const elementsCache = new Map();
const searchTextCache = new Map();
const toneCache = new Map();
const layoutCache = new Map();
const metaCache = new Map();

// Atomic Wind dark-section backgrounds: a neutral/slate/zinc/gray/stone shade
// at 800+ (solid fill or gradient origin), or pure black.
const DARK_BG = /\b(?:bg|from)-(?:neutral|slate|zinc|gray|stone)-(?:8|9)\d0\b|\bbg-black\b/;

/**
 * Visible copy extracted from a pattern's markup, for fuzzy search.
 *
 * Block-delimiter comments are stripped first — that also removes every
 * className / attribute JSON blob, so what's left is the rendered text
 * (headings, body, button labels). Capped so a long page pattern's footer
 * boilerplate can't drown out its hero copy.
 *
 * @param {Object} pattern Block pattern.
 * @return {string} Searchable text.
 */
export const getSearchText = ( pattern ) => {
	if ( ! searchTextCache.has( pattern.name ) ) {
		const text = ( pattern.content || '' )
			.replace( /<!--[\s\S]*?-->/g, ' ' ) // block delimiters (+ class/attr JSON)
			.replace( /<[^>]+>/g, ' ' )         // remaining HTML tags
			.replace( /&#8217;|&#8216;/g, '\'' )
			.replace( /&#8211;|&#8212;/g, '-' )
			.replace( /&amp;/g, '&' )
			.replace( /&#?\w+;/g, ' ' )         // drop any other entities
			.replace( /\s+/g, ' ' )
			.trim()
			.slice( 0, 600 );

		searchTextCache.set( pattern.name, text );
	}

	return searchTextCache.get( pattern.name );
};

/**
 * Meaningful words from a pattern's slug (e.g. "stats-poster-figures" →
 * "stats poster figures"). Slugs carry style/intent the title often drops.
 *
 * @param {Object} pattern Block pattern.
 * @return {string} Space-joined slug words.
 */
export const getSlugWords = ( pattern ) =>
	( pattern.name || '' )
		.split( '/' )
		.pop()
		.split( '-' )
		.filter( word => 2 < word.length && ! STOPWORDS.includes( word ) )
		.join( ' ' );

/**
 * Elements detected in a pattern's markup.
 *
 * @param {Object} pattern Block pattern.
 * @return {Array} Element ids.
 */
export const getElements = ( pattern ) => {
	// Pro upsell cards ship no content; their facets are precomputed server-side.
	if ( pattern.isPro ) {
		return pattern.elements || [];
	}

	if ( ! elementsCache.has( pattern.name ) ) {
		const content = pattern.content || '';
		elementsCache.set( pattern.name, Object.keys( ELEMENT_SIGNALS ).filter( element => ELEMENT_SIGNALS[ element ].some( signal => content.includes( signal ) ) ) );
	}

	return elementsCache.get( pattern.name );
};

/**
 * Relative luminance of a #hex color (0 = black, 1 = white).
 *
 * @param {string} hex Hex color, with or without leading #.
 * @return {number} Luminance.
 */
const luminance = ( hex ) => {
	let value = hex.replace( '#', '' );

	if ( 3 === value.length ) {
		value = value.split( '' ).map( char => char + char ).join( '' );
	}

	const channel = ( pair ) => {
		const linear = parseInt( pair, 16 ) / 255;
		return linear <= 0.03928 ? linear / 12.92 : Math.pow( ( linear + 0.055 ) / 1.055, 2.4 );
	};

	return 0.2126 * channel( value.slice( 0, 2 ) ) +
		0.7152 * channel( value.slice( 2, 4 ) ) +
		0.0722 * channel( value.slice( 4, 6 ) );
};

/**
 * The visual tone of a pattern, from its outermost section background.
 *
 * Atomic Wind patterns open with a `section` box whose className carries the
 * background; classic patterns set a `backgroundColor` hex on the first
 * wrapper. Anything else (or an undetectable background) is treated as light.
 *
 * @param {Object} pattern Block pattern.
 * @return {string} 'dark' or 'light'.
 */
export const getTone = ( pattern ) => {
	if ( pattern.isPro ) {
		return pattern.tone || 'light';
	}

	if ( ! toneCache.has( pattern.name ) ) {
		const content = pattern.content || '';
		let tone = 'light';

		const section = content.match( /wp:atomic-wind\/box \{"tagName":"section"[^}]*"className":"([^"]*)"/ );

		if ( section ) {
			tone = DARK_BG.test( section[ 1 ]) ? 'dark' : 'light';
		} else {
			const background = content.match( /"backgroundColor":"(#[0-9a-fA-F]{3,8})"/ );

			if ( background && luminance( background[ 1 ]) < 0.4 ) {
				tone = 'dark';
			}
		}

		toneCache.set( pattern.name, tone );
	}

	return toneCache.get( pattern.name );
};

/**
 * The dominant column layout of a pattern, from the widest CSS grid in its
 * markup (`grid-cols-N`). Patterns with no multi-column grid (single-column,
 * flex stacks) return null and carry no layout facet.
 *
 * @param {Object} pattern Block pattern.
 * @return {?string} 'cols-2', 'cols-3', 'cols-4', or null.
 */
export const getLayout = ( pattern ) => {
	if ( pattern.isPro ) {
		return pattern.layout || null;
	}

	if ( ! layoutCache.has( pattern.name ) ) {
		const columns = [ ...( pattern.content || '' ).matchAll( /grid-cols-(\d)/g ) ].map( match => Number( match[ 1 ]) );
		const widest = columns.length ? Math.max( ...columns ) : 0;

		layoutCache.set(
			pattern.name,
			4 <= widest ? 'cols-4' : 3 === widest ? 'cols-3' : 2 === widest ? 'cols-2' : null
		);
	}

	return layoutCache.get( pattern.name );
};

/**
 * Author-curated metadata for a pattern, parsed from its `keywords`.
 *
 * Keywords of the form `group:value` (e.g. `style:editorial`) become a
 * group → values map; bare keywords are ignored here (they still feed the
 * native inserter's keyword search).
 *
 * @param {Object} pattern Block pattern.
 * @return {Object} group → array of values.
 */
/**
 * Whether a pattern belongs to the free or the Pro tier.
 *
 * A pattern is Pro either when it's an upsell card (`isPro`, unlicensed sites)
 * or when it's a real Pro pattern fetched by Otter Pro and registered under the
 * `otter-pro/` namespace (licensed sites). Keying off only `isPro` would drop
 * the Free/Pro facet once a licensed library is populated, because the live
 * patterns that replace the upsells carry no `isPro` flag.
 *
 * @param {Object} pattern Block pattern.
 * @return {string} 'free' or 'pro'.
 */
export const getAccess = ( pattern ) =>
	pattern.isPro || pattern?.name?.startsWith( 'otter-pro/' ) ? 'pro' : 'free';

export const getMeta = ( pattern ) => {
	if ( ! metaCache.has( pattern.name ) ) {
		const map = {};

		( pattern.keywords || [] ).forEach( keyword => {
			const separator = keyword.indexOf( ':' );

			if ( 0 < separator ) {
				const group = keyword.slice( 0, separator );
				const value = keyword.slice( separator + 1 );

				if ( ! map[ group ] ) {
					map[ group ] = [];
				}

				map[ group ].push( value );
			}
		});

		metaCache.set( pattern.name, map );
	}

	return metaCache.get( pattern.name );
};

/**
 * Display label for a metadata value, falling back to a title-cased token.
 *
 * @param {string} group Group name.
 * @param {string} value Value token.
 * @return {string} Label.
 */
const metaValueLabel = ( group, value ) =>
	( META_VALUE_LABELS[ group ] && META_VALUE_LABELS[ group ][ value ]) ||
	value.charAt( 0 ).toUpperCase() + value.slice( 1 ).replace( /-/g, ' ' );

/**
 * Human label for a token.
 *
 * @param {Object} token          Token.
 * @param {Object} categoryLabels Category name → label map.
 * @return {string} Label.
 */
export const tokenLabel = ( token, categoryLabels = {}) => {
	if ( 'category' === token.kind ) {
		return categoryLabels[ token.value ] || token.value;
	}

	if ( 'tone' === token.kind ) {
		return TONE_LABELS[ token.value ] || token.value;
	}

	if ( 'access' === token.kind ) {
		return ACCESS_LABELS[ token.value ] || token.value;
	}

	if ( 'layout' === token.kind ) {
		return LAYOUT_LABELS[ token.value ] || token.value;
	}

	if ( 'meta' === token.kind ) {
		return metaValueLabel( token.group, token.value );
	}

	return ELEMENT_LABELS[ token.value ] || token.value;
};

/**
 * Parse a search query into structured tokens and leftover text terms.
 *
 * Each token remembers its source word so the UI can strip it from the
 * query string when dismissed.
 *
 * @param {string} query Search query.
 * @return {Object} { tokens, text }
 */
export const parseQuery = ( query ) => {
	const words = query.toLowerCase().split( /\s+/ ).filter( Boolean );
	const tokens = [];
	const text = [];
	const seen = [];

	words.forEach( word => {
		const clean = word.replace( /[^\w-]/g, '' );
		const token = VOCAB[ clean ];

		if ( token ) {
			const key = token.kind + ':' + token.value;

			if ( ! seen.includes( key ) ) {
				seen.push( key );
				tokens.push({ ...token, word });
			}
		} else if ( clean && ! STOPWORDS.includes( clean ) ) {
			text.push( clean );
		}
	});

	return { tokens, text };
};

/**
 * Fuzzy search index over pattern titles and category labels.
 *
 * @param {Array}  patterns       Patterns to index.
 * @param {Object} categoryLabels Category name → label map.
 * @return {Fuse} Search index.
 */
export const createSearchIndex = ( patterns, categoryLabels ) => new Fuse(
	patterns.map( pattern => ({
		name: pattern.name,
		title: pattern.title,
		slug: getSlugWords( pattern ),
		categories: ( pattern.categories || [] ).map( category => categoryLabels[ category ] || '' ).filter( Boolean ),
		description: pattern.description || '',
		text: getSearchText( pattern )
	}) ),
	{
		keys: [
			{ name: 'title', weight: 3 },
			{ name: 'description', weight: 2 },
			{ name: 'slug', weight: 1.5 },
			{ name: 'categories', weight: 1.5 },
			{ name: 'text', weight: 0.5 }
		],
		includeScore: true,
		ignoreLocation: true,
		minMatchCharLength: 2,
		threshold: 0.35
	}
);

/**
 * Score patterns against free-text search terms.
 *
 * Terms are searched one at a time and intersected — every term has to
 * match somewhere, but each gets typo tolerance on its own. Scores
 * accumulate across terms so callers can rank by relevance (Fuse scores
 * are 0 = perfect, so lower is better).
 *
 * @param {Fuse}  index Search index from createSearchIndex.
 * @param {Array} terms Free-text terms from parseQuery.
 * @return {?Map} Pattern name → score, or null when there is nothing to match.
 */
export const fuzzyMatches = ( index, terms ) => {
	if ( ! terms.length ) {
		return null;
	}

	let scores = null;

	terms.forEach( term => {
		const termScores = new Map();

		index.search( term ).forEach( ({ item, score }) => {
			if ( ! scores || scores.has( item.name ) ) {
				termScores.set( item.name, ( scores?.get( item.name ) || 0 ) + score );
			}
		});

		scores = termScores;
	});

	return scores;
};

/**
 * Whether a pattern matches a token.
 *
 * @param {Object} pattern Block pattern.
 * @param {Object} token   Token.
 * @return {boolean} Whether it matches.
 */
export const matchToken = ( pattern, token ) => {
	if ( 'category' === token.kind ) {
		return pattern.categories.includes( token.value );
	}

	if ( 'tone' === token.kind ) {
		return getTone( pattern ) === token.value;
	}

	if ( 'access' === token.kind ) {
		return getAccess( pattern ) === token.value;
	}

	if ( 'layout' === token.kind ) {
		return getLayout( pattern ) === token.value;
	}

	if ( 'meta' === token.kind ) {
		return ( getMeta( pattern )[ token.group ] || [] ).includes( token.value );
	}

	return getElements( pattern ).includes( token.value );
};

/**
 * Suggested refinement tags for the patterns currently in scope.
 *
 * Tone (light / dark) leads — it's the most-scanned distinction and only two
 * chips, so it always stays in view — followed by author-curated metadata
 * (style, use case, …), then column layout and element facets. A facet only
 * appears when it actually splits the scope (matched by at least two
 * patterns, but not all of them); elements are then ordered so the most
 * evenly-balanced ones come first.
 *
 * @param {Array}  scope Patterns in the current mode + category.
 * @param {number} max   Maximum number of tags.
 * @return {Array} [{ key, kind, value, label, count, group?, tone? }]
 */
export const suggestTags = ( scope, max = 12 ) => {
	const total = scope.length;
	const splits = ( count ) => 2 <= count && count < total;

	// Free vs Pro facet — leads the row so it's always the first refinement.
	const accessCounts = { free: 0, pro: 0 };
	scope.forEach( pattern => {
		accessCounts[ getAccess( pattern ) ] += 1;
	});

	const accessTags = [ 'free', 'pro' ]
		.filter( value => splits( accessCounts[ value ]) )
		.map( value => ({
			key: 'access:' + value,
			kind: 'access',
			value,
			label: ACCESS_LABELS[ value ],
			count: accessCounts[ value ]
		}) );

	// Curated metadata facets.
	const metaTags = [];

	META_GROUPS.forEach( group => {
		const counts = {};

		scope.forEach( pattern => {
			( getMeta( pattern )[ group ] || [] ).forEach( value => {
				counts[ value ] = ( counts[ value ] || 0 ) + 1;
			});
		});

		Object.keys( counts )
			.filter( value => splits( counts[ value ]) )
			.sort( ( a, b ) => counts[ b ] - counts[ a ] )
			.forEach( value => {
				metaTags.push({
					key: 'meta:' + group + ':' + value,
					kind: 'meta',
					group,
					value,
					label: metaValueLabel( group, value ),
					count: counts[ value ]
				});
			});
	});

	// Tone facet.
	const toneCounts = { dark: 0, light: 0 };
	scope.forEach( pattern => {
		toneCounts[ getTone( pattern ) ] += 1;
	});

	const toneTags = [ 'dark', 'light' ]
		.filter( tone => splits( toneCounts[ tone ]) )
		.map( tone => ({
			key: 'tone:' + tone,
			kind: 'tone',
			value: tone,
			label: TONE_LABELS[ tone ],
			count: toneCounts[ tone ],
			tone
		}) );

	// Column-layout facet.
	const layoutCounts = {};
	scope.forEach( pattern => {
		const layout = getLayout( pattern );

		if ( layout ) {
			layoutCounts[ layout ] = ( layoutCounts[ layout ] || 0 ) + 1;
		}
	});

	const layoutTags = LAYOUT_ORDER
		.filter( layout => splits( layoutCounts[ layout ] || 0 ) )
		.map( layout => ({
			key: 'layout:' + layout,
			kind: 'layout',
			value: layout,
			label: LAYOUT_LABELS[ layout ],
			count: layoutCounts[ layout ]
		}) );

	// Element facets.
	const elementCounts = {};
	scope.forEach( pattern => {
		getElements( pattern ).forEach( element => {
			if ( REFINE_ELEMENTS.includes( element ) ) {
				elementCounts[ element ] = ( elementCounts[ element ] || 0 ) + 1;
			}
		});
	});

	const elementTags = Object.keys( elementCounts )
		.map( element => ({
			key: 'element:' + element,
			kind: 'element',
			value: element,
			label: ELEMENT_LABELS[ element ],
			count: elementCounts[ element ]
		}) )
		.filter( tag => splits( tag.count ) )
		.sort( ( a, b ) => Math.abs( ( a.count / total ) - 0.45 ) - Math.abs( ( b.count / total ) - 0.45 ) );

	return [ ...accessTags, ...toneTags, ...metaTags, ...layoutTags, ...elementTags ].slice( 0, max );
};

/**
 * Patterns most similar to the given one, by shared categories and elements.
 *
 * @param {Object} pattern    Reference pattern.
 * @param {Array}  candidates Patterns of the same type to score.
 * @param {number} k          Maximum results.
 * @return {Array} Top-k similar patterns.
 */
export const similar = ( pattern, candidates, k = 4 ) => {
	const elements = getElements( pattern );
	const categories = pattern.categories.filter( category => ! GENERIC_CATEGORIES.includes( category ) );

	return candidates
		.filter( candidate => candidate.name !== pattern.name )
		.map( candidate => {
			let score = 0;

			candidate.categories.forEach( category => {
				if ( categories.includes( category ) ) {
					score += 3;
				}
			});

			getElements( candidate ).forEach( element => {
				if ( elements.includes( element ) ) {
					score += 1;
				}
			});

			return { candidate, score };
		})
		.sort( ( a, b ) => b.score - a.score )
		.slice( 0, k )
		.map( item => item.candidate );
};
