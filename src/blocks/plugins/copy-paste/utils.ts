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


type ThemeSettings = {
	colors?: ({ slug: string, color: string, name: string})[],
	gradients?: ({ slug: string, gradient: string, name: string})[],
	styles?: ({ css: string, baseURL?: string, isGlobalStyles?: boolean, __unstableType: string})[]
}

export const extractThemeCSSVar = ( settings: ThemeSettings ) => {

	if ( 'undefined' === typeof window ) {
		return;
	}

	window.oThemeStyles = {
		colors: settings?.colors?.map( ({ slug, color }) => ({ label: slug, value: color }) ) ?? [],
		gradients: settings?.gradients?.map( ({ slug, gradient }) => ({ label: slug, value: gradient }) ) ?? [],
		cssVars: []
	};

	const sources: string[] = settings?.styles?.map( ({ css }: {css: string}) => css )?.filter( ( x: string | undefined ) => x?.includes( '--wp--preset--' ) ) ?? [];

	for ( const source of sources ) {
		const raw = source.split( ':' ).flatMap( x => x.split( ';' ) ).filter(
			x => (
				x !== undefined &&
				! x.includes( 'var(' ) &&
				! x.includes( 'linear-gradient(' ) &&
				! x.includes( 'important' )
			)
		);

		window?.oThemeStyles?.cssVars?.push(
			...(
				raw
					.map( s => extractCSSColorVar( s, '--wp--preset--' ) )
					.filter( x => x !== undefined ) as string[]
			)
		);
	}
};

export const getColorFromThemeStyles = ( type: 'color' | 'gradient' | 'duotone' | 'any', colorName: string ) => {
	if ( 'undefined' === typeof window  ) {
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

		const varNameColor = window.oThemeStyles.cssVars?.filter( x => x.includes( 'color' ) ).find( varName => varName.includes( varName ) );

		return varNameColor;

	case 'gradient':
		const simpleGradient = window.oThemeStyles.gradients?.find( ({ label }) => label.includes( colorName ) );
		if ( simpleGradient !== undefined ) {
			return simpleGradient.value;
		}

		const varNameGradient = window.oThemeStyles.cssVars?.filter( x => x.includes( 'gradient' ) ).find( varName => varName.includes( varName ) );

		return varNameGradient;

	case 'duotone':
		const varNameDuotone = window.oThemeStyles.cssVars?.filter( x => x.includes( 'duotone' ) ).find( varName => varName.includes( varName ) );

		return varNameDuotone;

	case 'any':
		const simple = [ ...window.oThemeStyles.colors ?? [], ...window.oThemeStyles.gradients ?? [] ]?.find( ({ label }) => label.includes( colorName ) );
		if ( simple !== undefined ) {
			return simple.value;
		}

		const varName = window.oThemeStyles.cssVars?.find( varName => varName.includes( varName ) );
		return varName;

	default:
		return undefined;
	}
};
