import { boxValues, buildResponsiveGetAttributes, mergeBoxDefaultValues } from '../../helpers/helper-functions.js';

describe( 'Box Values Function', () => {

	it( 'should render the values from a Box type (padding, margin)', () => {
		const box = { top: '10px', left: '10px', right: '10px', bottom: '10px' };

		expect( boxValues( box, { top: '8px', left: '8px', right: '8px', bottom: '8px' }) ).toEqual( '10px 10px 10px 10px' );
	});

	it( 'should render the default values when the given box is empty', () => {
		expect( boxValues({}, { top: '8px', left: '8px', right: '8px', bottom: '8px' }) ).toEqual( '8px 8px 8px 8px' );
	});

	it( 'should render the default values when given box is undefined', () => {
		expect( boxValues( undefined, { top: '8px', left: '8px', right: '8px', bottom: '8px' }) ).toEqual( '8px 8px 8px 8px' );
	});

	it( 'should render the build-in default values when given default values is a undefined box', () => {
		expect( boxValues( undefined, undefined ) ).toEqual( '0px 0px 0px 0px' );
	});
});

describe( 'Get Responsive Attributes Function', () => {

	test.each([ 'Desktop', 'Tablet', 'Mobile' ])( 'should give the correct value for each view: $.', ( ( view ) => {
		const getValue = buildResponsiveGetAttributes( view as 'Desktop' | 'Tablet'| 'Mobile' );

		expect( getValue([ 'Desktop', 'Tablet', 'Mobile' ]) ).toEqual( view );
	}) );

	test.each([ 'Tablet', 'Mobile' ])( 'should give the desktop value when view: $. is undefined', ( ( view ) => {
		const getValue = buildResponsiveGetAttributes( view as 'Desktop' | 'Tablet'| 'Mobile' );

		expect( getValue([ 'Desktop', undefined, undefined ]) ).toEqual( 'Desktop' );
	}) );

	test.each([ 'Mobile' ])( 'should give the tablet value when view: $. is undefined', ( ( view ) => {
		const getValue = buildResponsiveGetAttributes( view as 'Desktop' | 'Tablet'| 'Mobile' );

		expect( getValue([ 'Desktop', 'Tablet', undefined ]) ).toEqual( 'Tablet' );
	}) );

	test.each([ 'Tablet', 'Mobile' ])( 'should give the undefined value when view: $. is undefined and cascade is false', ( ( view ) => {
		const getValue = buildResponsiveGetAttributes( view as 'Desktop' | 'Tablet'| 'Mobile', view as 'Desktop' | 'Tablet'| 'Mobile', false );

		expect( getValue([ 'Desktop', undefined, undefined ]) ).toEqual( undefined );
	}) );

	test.each([ 'Tablet', 'Mobile' ])( 'should give the undefined value when view: $. is undefined and cascade is false', ( ( view ) => {
		const getValue = buildResponsiveGetAttributes( view as 'Desktop' | 'Tablet'| 'Mobile', 'Desktop', false );

		expect( getValue([ 'Desktop', undefined, undefined ]) ).toEqual( 'Desktop' );
	}) );
});

describe( 'Merge Box Default Function', () => {
	it( 'should keep the value intact if it is complete.', () => {
		const box = { left: '5px', right: '5px', bottom: '5px', top: '5px' };
		const defaultBox = { left: '1px', right: '1px', bottom: '1px', top: '1px' };

		expect( mergeBoxDefaultValues( box, defaultBox ) ).toMatchObject( box );
	});

	it( 'should apply the missing values from default value.', () => {
		const box = { left: '5px', right: '5px' };
		const defaultBox = { left: '1px', right: '1px', bottom: '1px', top: '1px' };

		expect( mergeBoxDefaultValues( box, defaultBox ) ).toMatchObject({ left: '5px', right: '5px', bottom: '1px', top: '1px' });
	});

	it( 'should return the given default value when box in empty.', () => {
		const defaultBox = { left: '1px', right: '1px', bottom: '1px', top: '1px' };

		expect( mergeBoxDefaultValues({}, defaultBox ) ).toMatchObject( defaultBox );
	});

	it( 'should return the value filled with inner box value when default value or the given value is not complete.', () => {
		const box = { left: '5px', right: '5px' };
		const defaultBox = { bottom: '1px' };

		expect( mergeBoxDefaultValues( box, defaultBox ) ).toMatchObject({ left: '5px', right: '5px', bottom: '1px', top: '0px' });
	});
});
