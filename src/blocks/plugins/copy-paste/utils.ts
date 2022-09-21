import { BoxType } from '../../helpers/blocks';

export const addUnit = ( x?: number, unit?: string ): string | undefined => x !== undefined ? `${x}${unit}` : undefined;

export const getInt = ( s?: string, defaultValue?: number ): number => {

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

export const makeBox = ( x: any ): BoxType => {
	return {
		top: x,
		left: x,
		right: x,
		bottom: x
	};
};
