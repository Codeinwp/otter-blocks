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
 * Wrapt the given value in a box.
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
 * @param source
 * @param colorName
 * @returns
 */
const extractCSSColorVar = ( source: string, colorName: string ) => {
	const initPosition = source.indexOf( colorName );

	if ( -1 === initPosition ) {
		return undefined;
	}

	let left = initPosition;
	let right = initPosition;

	while ( ( '{' !== source[left - 1] && '}' !== source[left - 1] && ';' !== source[left - 1]) && 0 < left - 1 ) {
		left -= 1;
	}

	while ( ( ':' !== source[right + 1] && '{' !== source[right + 1] && '}' !== source[right + 1] && ';' !== source[right + 1]) && right + 1 < source.length ) {
		right += 1;
	}

	const s = source.slice( left, right + 1 ).trim();
	return s?.includes( '--wp--preset--' ) ? s : undefined;
};

/**
 * Find and extract the CSS var from WP Theme based on the given color name class.
 * @param colorName The color name.
 * @returns
 */
export const extractVarNameCoreCSS = ( colorName: string | undefined  ) => {

	let settings: Record<string, any> = {};

	if ( sessionStorage?.getItem( 'o-copyPaste-theme-colors' ) ) {
		settings = JSON.parse( sessionStorage.getItem( 'o-copyPaste-theme-colors' ) ?? '{}' );
	}

	const defaultColors = [ ...( settings?.colors ?? []), ...( settings?.gradients ?? []) ];
	const sources: string[] = settings?.styles?.map( ({ css }: {css: string}) => css )?.filter( ( x: string | undefined ) => x?.includes( '--wp--preset--' ) ) ?? [];

	if ( colorName === undefined ) {
		return undefined;
	}

	const normalColor =  defaultColors?.find( ({ slug } : {slug: string}) => slug === colorName );
	if ( normalColor ) {
		return normalColor?.gradient ?? normalColor?.color;
	}

	for ( const source of sources ) {
		let varName = extractCSSColorVar( source, colorName );
		if ( varName !== undefined ) {
			if ( ! varName.includes( 'var(' ) ) {
				varName = `var(${varName})`;
			}
			return varName;
		}
	}

	return undefined;
};
