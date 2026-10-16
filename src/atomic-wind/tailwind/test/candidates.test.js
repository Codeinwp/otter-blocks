import { collectNewCandidates } from '../candidates';

/**
 * @param {string} className Class attribute value.
 * @return {HTMLElement} Element carrying it.
 */
const element = ( className ) => {
	const el = document.createElement( 'div' );
	el.className = className;
	return el;
};

describe( 'collectNewCandidates', () => {
	it( 'returns only class names not seen yet and records them', () => {
		const seen = new Set( [ 'grid' ] );

		const fresh = collectNewCandidates( [ element( 'grid md:grid-cols-3' ), element( 'md:grid-cols-3 p-4' ) ], seen );

		expect( [ ...fresh ] ).toEqual( [ 'md:grid-cols-3', 'p-4' ] );
		expect( [ ...seen ] ).toEqual( [ 'grid', 'md:grid-cols-3', 'p-4' ] );
	} );

	it( 'adds extra candidates missing from the elements', () => {
		const fresh = collectNewCandidates( [ element( 'grid' ) ], new Set(), [ 'grid', 'lg:grid-cols-4' ] );

		expect( [ ...fresh ] ).toEqual( [ 'grid', 'lg:grid-cols-4' ] );
	} );
} );
