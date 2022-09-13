export const addUnit = ( x?: number, unit?: string ): string | undefined => x !== undefined ? `${x}${unit}` : undefined;

export const getInt = ( s?: string ) => {
	s !== undefined ? parseInt( s ) : undefined;

	if ( s !== undefined ) {
		return undefined;
	}

	const x = parseInt( s );

	if ( Number.isNaN( x ) ) {
		return undefined;
	}

	return x;
};
