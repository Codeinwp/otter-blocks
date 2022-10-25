import { color } from '@wordpress/icons/build-types';
import { BoxType } from '../../helpers/blocks';

/**
 * Add unit to the given value if it is defined.
 * @param x The value.
 * @param unit The unit.
 * @returns
 */
export const addUnit = ( x?: number, unit?: string ): string | undefined => x !== undefined ? `${x}${unit}` : undefined;

/**
 * Extract the number from a given string.
 * @param s The number in string.
 * @param defaultValue Default value.
 * @returns
 */
export const getInt = ( s?: string, defaultValue?: number ): number | undefined => {

	defaultValue ??= undefined;

	if ( s === undefined ) {
		return defaultValue;
	}

	const x = parseInt( s );

	if ( Number.isNaN( x ) ) {
		return defaultValue;
	}

	return x;
};

/**
 * Wrapt the given value in a box type.
 * @param x The value.
 * @returns
 */
export const makeBox = ( x?: string ): BoxType => {
	return {
		top: x,
		left: x,
		right: x,
		bottom: x
	};
};

/**
 * Extract a single value from the box. Non-zero values have priority.
 * @param box The box.
 * @returns
 */
export const getSingleValueFromBox = ( box?: BoxType ) => {
	if ( box === undefined ) {
		return undefined;
	}
	const nonZero = Object.values( box ).find( v => v !== undefined && ! v.startsWith( '0' ) );
	return nonZero ??  Object.values( box ).pop();
};

/**
 * Extract the CSS var name from the given string source.
 * @param source The text source with the CSS styles.
 * @param colorName The string that is contained in the desired CSS var.
 * @returns
 */
const extractCSSColorVar = ( source: string, colorName: string ) => {
	const initPosition = source.indexOf( colorName );

	if ( -1 === initPosition ) {
		return undefined;
	}

	let left = initPosition;
	let right = initPosition;

	while ( ( '{' !== source[left - 1] && '}' !== source[left - 1] && ';' !== source[left - 1]) && ( 0 < left - 1 ) ) {
		left -= 1;
	}

	while ( ( ':' !== source[right + 1] && '{' !== source[right + 1] && '}' !== source[right + 1] && ';' !== source[right + 1]) && ( right + 1 < source.length ) ) {
		right += 1;
	}

	const s = source.slice( left, right + 1 ).trim();
	return s?.includes( '--wp--preset--' ) ? s : undefined;
};


type ThemeSettings = {
	colors?: ({ slug: string, color: string, name: string})[],
	gradients?: ({ slug: string, gradient: string, name: string})[],
	styles?: ({ css: string, baseURL?: string, isGlobalStyles?: boolean, __unstableType: string})[]
}

/**
 * Extract the styles from Settings and saved it to global value `window.oThemeStyles`
 * @param settings The WP settings.
 * @returns
 */
export const extractThemeCSSVar = ( settings: ThemeSettings ) => {

	if ( 'undefined' === typeof window ) {
		return;
	}

	window.oThemeStyles = {
		colors: settings?.colors?.map( ({ slug, color }) => ({ label: slug, value: color }) ) ?? [],
		gradients: settings?.gradients?.map( ({ slug, gradient }) => ({ label: slug, value: gradient }) ) ?? [],
		cssVars: []
	};

	const styleSources: string[] = settings?.styles
		?.map( ({ css }: {css: string}) => css )
		?.filter( ( x: string | undefined ) => x?.includes( '--wp--preset--' ) ) ?? [];

	const excludeTags = [ 'var(', 'linear-gradient(', 'important' ];

	window.oThemeStyles.cssVars = styleSources
		.flatMap( source => source.split( ':' ) )
		.flatMap( s => s.split( ';' ) )
		.filter( s => s !== undefined && excludeTags.every( t => ! s.includes( t ) ) )
		.map( s => extractCSSColorVar( s, '--wp--preset--' ) )
		.flatMap( s => s ? [ s ] : []); // this a little trick to simulate a filter which gives us the correct type of string[]
};

/**
 * Retrieve the desired color from the global object `window.oThemeStyles` that containts the CSS color values and vars for the current theme.
 * @param type The type of the color.
 * @param colorName The string that is contained in the desired CSS var.
 * @returns
 */
const selectColorFromThemeStyles = ( type: 'color' | 'gradient' | 'duotone' | 'any', colorName: string ) => {
	if ( 'undefined' === typeof window ) {
		return undefined;
	}

	if ( window.oThemeStyles === undefined  ) {
		return undefined;
	}

	switch ( type ) {
	case 'color':
		const simpleColor = window.oThemeStyles.colors?.find( ({ label }) => label.includes( colorName ) );
		if ( simpleColor !== undefined ) {
			return simpleColor.value;
		}

		return window.oThemeStyles.cssVars?.filter( x => x.includes( 'color' ) ).find( varName => varName.includes( colorName ) );

	case 'gradient':
		const simpleGradient = window.oThemeStyles.gradients?.find( ({ label }) => label.includes( colorName ) );
		if ( simpleGradient !== undefined ) {
			return simpleGradient.value;
		}

		return window.oThemeStyles.cssVars?.filter( x => x.includes( 'gradient' ) ).find( varName => varName.includes( colorName ) );

	case 'duotone':
		return window.oThemeStyles.cssVars?.filter( x => x.includes( 'duotone' ) ).find( varName => varName.includes( colorName ) );

	case 'any':
		const simple = [ ...window.oThemeStyles.colors ?? [], ...window.oThemeStyles.gradients ?? [] ]?.find( ({ label }) => label.includes( colorName ) );
		if ( simple !== undefined ) {
			return simple.value;
		}

		return window.oThemeStyles.cssVars?.find( varName => varName.includes( colorName ) );

	default:
		return undefined;
	}
};

/**
 * Get the value of the given color name from current theme. This is a wrapper around `selectColorFromThemeStyles`.
 * @param type The type of the color.
 * @param colorName The string that is contained in the desired CSS var.
 * @returns
 */
export const getColorFromThemeStyles = ( type: 'color' | 'gradient' | 'duotone' | 'any', colorName: string ) => {
	const color = selectColorFromThemeStyles( type, colorName );
	const isCSSVar = Boolean( color?.includes( '--wp--preset--' ) );
	return isCSSVar ? `var(${color})` : color;
};
