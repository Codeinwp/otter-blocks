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

	console.log( x );

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
