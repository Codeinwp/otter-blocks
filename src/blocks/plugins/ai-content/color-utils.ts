/**
 * Pure color math for the deterministic quality checks. No WordPress or DOM
 * dependencies — given hex colors, compute WCAG contrast so unreadable text can
 * be flagged without a model or vision.
 */

export type Rgb = { r: number; g: number; b: number };

/**
 * Parse a #rgb or #rrggbb string into 0–255 channels. Returns null for anything
 * that is not a plain hex color (named slugs, gradients, CSS vars, …).
 *
 * @param value The color string.
 */
export const hexToRgb = ( value: string ): Rgb | null => {
	if ( 'string' !== typeof value ) {
		return null;
	}

	const hex = value.trim().replace( /^#/, '' );

	const expanded = 3 === hex.length
		? hex.split( '' ).map( char => char + char ).join( '' )
		: hex;

	if ( ! /^[0-9a-fA-F]{6}$/.test( expanded ) ) {
		return null;
	}

	return {
		r: parseInt( expanded.slice( 0, 2 ), 16 ),
		g: parseInt( expanded.slice( 2, 4 ), 16 ),
		b: parseInt( expanded.slice( 4, 6 ), 16 )
	};
};

const channelLuminance = ( channel: number ): number => {
	const c = channel / 255;
	return c <= 0.03928 ? c / 12.92 : Math.pow( ( c + 0.055 ) / 1.055, 2.4 );
};

/**
 * WCAG relative luminance of an RGB color.
 *
 * @param rgb The color channels.
 */
export const relativeLuminance = ( rgb: Rgb ): number => {
	return 0.2126 * channelLuminance( rgb.r ) +
		0.7152 * channelLuminance( rgb.g ) +
		0.0722 * channelLuminance( rgb.b );
};

/**
 * WCAG contrast ratio (1–21) between two hex colors. Returns null when either
 * color cannot be parsed as hex, so callers skip the check rather than guess.
 *
 * @param foreground The text color.
 * @param background The background color.
 */
export const contrastRatio = ( foreground: string, background: string ): number | null => {
	const fg = hexToRgb( foreground );
	const bg = hexToRgb( background );

	if ( ! fg || ! bg ) {
		return null;
	}

	const lighter = Math.max( relativeLuminance( fg ), relativeLuminance( bg ) );
	const darker = Math.min( relativeLuminance( fg ), relativeLuminance( bg ) );

	return ( lighter + 0.05 ) / ( darker + 0.05 );
};

// WCAG AA threshold for normal body text.
export const MIN_CONTRAST_AA = 4.5;
