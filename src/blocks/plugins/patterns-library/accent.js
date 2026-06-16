/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

/**
 * Accent recoloring engine for the Design Library.
 *
 * Every accent — preset or custom — is a single hex. From it we derive a
 * Tailwind-like shade ramp (50–950) in OKLCH: fixed lightness per shade so
 * contrast relationships survive any hue, chroma scaled from the picked
 * color so muted picks give muted ramps.
 *
 * Two recolor paths, one ramp:
 *
 * - Previews: Atomic Wind utilities resolve through Tailwind v4 theme
 *   variables (--color-indigo-600), so a pattern recolors by overriding
 *   those variables inside its preview iframe — no markup change, no
 *   re-parse. Classic Otter patterns carry hexes in attributes, so they
 *   get a content rewrite instead (sentinel palette → ramp).
 *
 * - Insertion: everything is baked into the markup. Atomic Wind hue
 *   classes become arbitrary-value classes (bg-indigo-600 → bg-[#xxxxxx])
 *   that the runtime Tailwind generator compiles like any other class, so
 *   inserted content has no dependency on the library or the site theme.
 */

export const ACCENT_PRESETS = [
	{ color: '#2563eb', label: __( 'Blue', 'otter-blocks' ) },
	{ color: '#059669', label: __( 'Green', 'otter-blocks' ) },
	{ color: '#e11d48', label: __( 'Red', 'otter-blocks' ) }
];

const SHADES = [ 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950 ];

// Per-shade OKLCH lightness and chroma, averaged across Tailwind's
// chromatic families. Chroma is the fully-saturated curve — it gets
// scaled down toward the picked color's own chroma.
const SHADE_L = { 50: 0.975, 100: 0.94, 200: 0.89, 300: 0.81, 400: 0.71, 500: 0.62, 600: 0.55, 700: 0.48, 800: 0.42, 900: 0.37, 950: 0.27 };
const SHADE_C = { 50: 0.013, 100: 0.027, 200: 0.055, 300: 0.1, 400: 0.16, 500: 0.21, 600: 0.23, 700: 0.2, 800: 0.17, 900: 0.13, 950: 0.085 };

// OKLCH hue (around shade 600) of each chromatic Tailwind family.
// Neutrals (slate, gray, zinc, neutral, stone) are never recolored.
const FAMILY_HUES = {
	red: 27,
	orange: 50,
	amber: 76,
	yellow: 96,
	lime: 130,
	green: 148,
	emerald: 163,
	teal: 183,
	cyan: 215,
	sky: 230,
	blue: 263,
	indigo: 275,
	violet: 293,
	purple: 303,
	fuchsia: 322,
	pink: 350,
	rose: 18
};

// Classic Otter patterns opt into recoloring by using this exact palette
// (Tailwind indigo). Each hex found in their markup is swapped for the
// same shade of the derived ramp.
const SENTINELS = {
	50: '#eef2ff',
	100: '#e0e7ff',
	200: '#c7d2fe',
	300: '#a5b4fc',
	400: '#818cf8',
	500: '#6366f1',
	600: '#4f46e5',
	700: '#4338ca',
	800: '#3730a3',
	900: '#312e81',
	950: '#1e1b4b'
};

// --- Color math: sRGB hex ↔ OKLCH, with chroma-reducing gamut clamp. ---

const srgbToLinear = ( channel ) => {
	const c = channel / 255;
	return 0.04045 >= c ? c / 12.92 : Math.pow( ( c + 0.055 ) / 1.055, 2.4 );
};

const linearToSrgb = ( c ) => {
	const v = 0.0031308 >= c ? 12.92 * c : 1.055 * Math.pow( c, 1 / 2.4 ) - 0.055;
	return Math.round( 255 * Math.min( 1, Math.max( 0, v ) ) );
};

const hexToOklch = ( hex ) => {
	let value = hex.replace( '#', '' );

	if ( 3 === value.length ) {
		value = value.split( '' ).map( c => c + c ).join( '' );
	}

	const n = parseInt( value, 16 );
	const r = srgbToLinear( ( n >> 16 ) & 255 );
	const g = srgbToLinear( ( n >> 8 ) & 255 );
	const b = srgbToLinear( n & 255 );

	const l = Math.cbrt( 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b );
	const m = Math.cbrt( 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b );
	const s = Math.cbrt( 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b );

	const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
	const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
	const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

	const C = Math.sqrt( a * a + bb * bb );
	let H = ( Math.atan2( bb, a ) * 180 ) / Math.PI;

	if ( 0 > H ) {
		H += 360;
	}

	return { L, C, H };
};

// Linear sRGB for an OKLCH color; channels outside [0, 1] mean out of gamut.
const oklchToLinear = ( L, C, H ) => {
	const a = C * Math.cos( ( H * Math.PI ) / 180 );
	const bb = C * Math.sin( ( H * Math.PI ) / 180 );

	const l = Math.pow( L + 0.3963377774 * a + 0.2158037573 * bb, 3 );
	const m = Math.pow( L - 0.1055613458 * a - 0.0638541728 * bb, 3 );
	const s = Math.pow( L - 0.0894841775 * a - 1.291485548 * bb, 3 );

	return [
		4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
		-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
		-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
	];
};

const oklchToHex = ( L, C, H ) => {
	let rgb = oklchToLinear( L, C, H );

	// Out of gamut: keep lightness and hue, walk chroma down until it fits.
	if ( rgb.some( channel => -0.0001 > channel || 1.0001 < channel ) ) {
		let low = 0;
		let high = C;

		for ( let i = 0; 12 > i; i++ ) {
			const mid = ( low + high ) / 2;
			rgb = oklchToLinear( L, mid, H );

			if ( rgb.some( channel => -0.0001 > channel || 1.0001 < channel ) ) {
				high = mid;
			} else {
				low = mid;
			}
		}

		rgb = oklchToLinear( L, low, H );
	}

	return '#' + rgb.map( channel => linearToSrgb( channel ).toString( 16 ).padStart( 2, '0' ) ).join( '' );
};

const ramps = new Map();

/**
 * Shade ramp for a hue, scaled by the picked color's chroma.
 *
 * @param {number}  hue    OKLCH hue.
 * @param {number}  chroma Picked color's chroma.
 * @param {?string} anchor Picked hex — placed verbatim into its
 *                         nearest-lightness slot, so a brand color shows
 *                         up exactly where the design uses that shade.
 * @return {Object} Shade → hex.
 */
const buildRamp = ( hue, chroma, anchor = null ) => {
	const key = Math.round( hue ) + ':' + chroma.toFixed( 3 ) + ':' + ( anchor || '' );

	if ( ! ramps.has( key ) ) {
		const scale = Math.min( chroma / 0.23, 1.15 );
		const ramp = {};

		// Slide the whole lightness curve so it passes exactly through the
		// anchor at its nearest slot — the ramp stays smooth and the picked
		// color appears verbatim where the design uses that shade.
		let nearest = null;
		let delta = 0;

		if ( anchor ) {
			const { L } = hexToOklch( anchor );

			// Button-weight colors anchor straight into the 600 slot —
			// "make the buttons this color" is what picking an accent
			// means. Lighter or darker picks land at their nearest slot
			// instead, so a pastel doesn't become an unreadable button.
			if ( 0.45 <= L && 0.65 >= L ) {
				nearest = 600;
			} else {
				nearest = SHADES.reduce( ( best, shade ) =>
					Math.abs( SHADE_L[ shade ] - L ) < Math.abs( SHADE_L[ best ] - L ) ? shade : best );
			}

			delta = L - SHADE_L[ nearest ];
		}

		SHADES.forEach( shade => {
			ramp[ shade ] = oklchToHex( Math.min( 0.99, Math.max( 0.05, SHADE_L[ shade ] + delta ) ), SHADE_C[ shade ] * scale, hue );
		});

		if ( anchor ) {
			ramp[ nearest ] = anchor.toLowerCase();
		}

		ramps.set( key, ramp );
	}

	return ramps.get( key );
};

const FAMILY_PATTERN = Object.keys( FAMILY_HUES ).join( '|' );
const SHADE_PATTERN = SHADES.join( '|' );

const familyRegex = new RegExp( `-(${ FAMILY_PATTERN })-(${ SHADE_PATTERN })\\b`, 'g' );

// Same match with the utility in front (bg-indigo-600 → "bg"), to weigh
// structural color usage against incidental text color.
const utilityRegex = new RegExp( `([a-z]+)-(${ FAMILY_PATTERN })-(${ SHADE_PATTERN })\\b`, 'g' );

const GRADIENT_UTILITIES = [ 'from', 'via', 'to' ];

const familiesCache = new Map();

/**
 * Chromatic families to recolor, primary first.
 *
 * The primary is the family carrying the pattern's structural color —
 * backgrounds, gradients, borders; text-only usage is a weak signal so
 * star ratings and the like never win. Beyond the primary, only gradient
 * stops recolor: they have to move with the accent or gradients tear,
 * while other secondary colors (gold stars, multi-color tiles) are
 * authorial choices that should survive an accent change.
 *
 * @param {Object} pattern Block pattern.
 * @return {Array} Family names.
 */
const getFamilies = ( pattern ) => {
	if ( ! familiesCache.has( pattern.name ) ) {
		const counts = {};
		const structural = {};
		const inGradient = [];

		for ( const match of ( pattern.content || '' ).matchAll( utilityRegex ) ) {
			const [ , utility, family ] = match;

			counts[ family ] = ( counts[ family ] || 0 ) + 1;

			if ( 'text' !== utility ) {
				structural[ family ] = ( structural[ family ] || 0 ) + 1;
			}

			if ( GRADIENT_UTILITIES.includes( utility ) && ! inGradient.includes( family ) ) {
				inGradient.push( family );
			}
		}

		const families = Object.keys( counts );

		// Families that usually mean star ratings, not accent — they may
		// only claim primary through structural use (e.g. amber buttons),
		// never on text color alone.
		const SEMANTIC = [ 'amber', 'yellow' ];

		let candidates = families.filter( family => 0 < ( structural[ family ] || 0 ) );

		if ( ! candidates.length ) {
			candidates = families.filter( family => ! SEMANTIC.includes( family ) );
		}

		if ( ! candidates.length ) {
			familiesCache.set( pattern.name, []);
		} else {
			const primary = candidates.sort( ( a, b ) =>
				( structural[ b ] || 0 ) - ( structural[ a ] || 0 ) || counts[ b ] - counts[ a ] )[ 0 ];

			familiesCache.set( pattern.name, [ primary, ...inGradient.filter( family => family !== primary ) ]);
		}
	}

	return familiesCache.get( pattern.name );
};

/**
 * Ramps for every chromatic family in a pattern: the dominant family takes
 * the picked hue, companions (e.g. the other stops of a gradient) shift by
 * the same hue delta so multi-hue designs keep their character.
 *
 * @param {Object} pattern Block pattern.
 * @param {string} accent  Picked hex.
 * @return {?Object} Family → ramp, or null when there is nothing to recolor.
 */
const getFamilyRamps = ( pattern, accent ) => {
	const families = getFamilies( pattern );

	if ( ! families.length ) {
		return null;
	}

	const { C, H } = hexToOklch( accent );
	const primaryHue = FAMILY_HUES[ families[ 0 ] ];

	const result = {};

	families.forEach( ( family, index ) => {
		const delta = FAMILY_HUES[ family ] - primaryHue;
		let hue = ( ( ( H + delta ) % 360 ) + 360 ) % 360;

		// Companions keep their hue distance from the accent, but a shifted
		// stop landing in the olive band looks muddy next to any accent —
		// mirror it to the same distance on the accent's other side, unless
		// the accent itself lives there or the mirror is just as muddy.
		const muddy = ( value ) => 62 < value && 140 > value;

		if ( 0 !== index && muddy( hue ) && ! muddy( H ) ) {
			const mirrored = ( ( ( H - delta ) % 360 ) + 360 ) % 360;

			if ( ! muddy( mirrored ) ) {
				hue = mirrored;
			}
		}

		result[ family ] = buildRamp( hue, C, 0 === index ? accent : null );
	});

	return result;
};

const sentinelRegexes = {};

SHADES.forEach( shade => {
	sentinelRegexes[ shade ] = new RegExp( SENTINELS[ shade ], 'gi' );
});

const hasSentinels = ( content ) => SHADES.some( shade => {
	sentinelRegexes[ shade ].lastIndex = 0;
	return sentinelRegexes[ shade ].test( content );
});

const replaceSentinels = ( content, ramp ) => {
	let result = content;

	SHADES.forEach( shade => {
		sentinelRegexes[ shade ].lastIndex = 0;
		result = result.replace( sentinelRegexes[ shade ], ramp[ shade ]);
	});

	return result;
};

const previewCache = new Map();

/**
 * Recolored rendering of a pattern for previews.
 *
 * Atomic Wind patterns keep their markup and get a CSS-variable override
 * stylesheet for the preview iframe; classic patterns with sentinel hexes
 * get a derived pattern (new name, so downstream parse caches stay
 * correct). Patterns with nothing to recolor pass through untouched.
 *
 * @param {Object}  pattern Block pattern.
 * @param {?string} accent  Picked hex, or null for the original colors.
 * @return {Object} { pattern, css }
 */
export const previewAccent = ( pattern, accent ) => {
	if ( ! accent ) {
		return { pattern, css: '' };
	}

	const key = pattern.name + '|' + accent;

	if ( ! previewCache.has( key ) ) {
		const familyRamps = getFamilyRamps( pattern, accent );
		let css = '';

		if ( familyRamps ) {
			const declarations = Object.keys( familyRamps )
				.flatMap( family => SHADES.map( shade => `--color-${ family }-${ shade }: ${ familyRamps[ family ][ shade ] } !important;` ) )
				.join( ' ' );

			css = `:root, body { ${ declarations } }`;
		}

		let result = { pattern, css };

		if ( hasSentinels( pattern.content || '' ) ) {
			const { C, H } = hexToOklch( accent );
			const ramp = buildRamp( H, C, accent );

			result = {
				pattern: {
					...pattern,
					name: pattern.name + '@' + accent,
					baseName: pattern.name,
					content: replaceSentinels( pattern.content, ramp )
				},
				css
			};
		}

		previewCache.set( key, result );
	}

	return previewCache.get( key );
};

/**
 * Pattern content with the accent baked into the markup, for insertion.
 *
 * @param {Object}  pattern Block pattern.
 * @param {?string} accent  Picked hex, or null for the original colors.
 * @return {string} Content.
 */
export const accentContent = ( pattern, accent ) => {
	if ( ! accent ) {
		return pattern.content;
	}

	let { content } = pattern;
	const familyRamps = getFamilyRamps( pattern, accent );

	if ( familyRamps ) {
		content = content.replace( familyRegex, ( match, family, shade ) =>
			familyRamps[ family ] ? `-[${ familyRamps[ family ][ shade ] }]` : match );
	}

	if ( hasSentinels( content ) ) {
		const { C, H } = hexToOklch( accent );
		content = replaceSentinels( content, buildRamp( H, C, accent ) );
	}

	return content;
};
