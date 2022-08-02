import { boxValues } from '../../helpers/helper-functions.js';

describe( 'Helper Functions', () => {

	it( 'should render the values from a Box type (padding, margin)', () => {
		const box = { top: '10px', left: '10px', right: '10px', bottom: '10px' };

		expect( boxValues( box, { top: '8px', left: '8px', right: '8px', bottom: '8px' }) ).toEqual( '10px 10px 10px 10px' );
	});

	it( 'should render the default values when the given box is empty', () => {
		expect( boxValues({}, { top: '8px', left: '8px', right: '8px', bottom: '8px' }) ).toEqual( '8px 8px 8px 8px' );
	});

	it( 'should render the default values when given box is null', () => {
		expect( boxValues( null, { top: '8px', left: '8px', right: '8px', bottom: '8px' }) ).toEqual( '8px 8px 8px 8px' );
	});

	it( 'should render the build-in default values when given default values is a null box', () => {
		expect( boxValues( null, null ) ).toEqual( '0px 0px 0px 0px' );
	});


});
