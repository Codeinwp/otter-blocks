import { boxValues, buildResponsiveGetAttributes, buildResponsiveSetAttributes, compactObject, getChoice, mergeBoxDefaultValues, removeBoxDefaultValues } from '../../helpers/helper-functions.js';

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

describe( 'Build Get Responsive Attributes Function', () => {

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

describe( 'Build Get Responsive Set Attributes', () => {

	let attributes: any = {};
	let setAttributes = ( attrs: any ) => {
		attributes = { ...attributes, ...attrs };
	};

	beforeEach( () => {
		attributes = {};
	});


	test.each([ 'Desktop', 'Tablet', 'Mobile' ])( 'should set the correct value for each view: $.', ( ( view ) => {
		const setValue = buildResponsiveSetAttributes( setAttributes, view as 'Desktop' | 'Tablet'| 'Mobile' );

		setValue( 1, [ 'value.desktop', 'value.tablet', 'value.mobile' ], {});

		expect( attributes.value ).toBeDefined();
		expect( attributes.value[view.toLowerCase()]).toEqual( 1 );
	}) );

	test.each([ 'Desktop', 'Tablet', 'Mobile' ])( 'should set and unset the correct value for each view: $.', ( ( view ) => {
		const setValue = buildResponsiveSetAttributes( setAttributes, view as 'Desktop' | 'Tablet'| 'Mobile' );

		setValue( 1, [ 'value.desktop', 'value.tablet', 'value.mobile' ], {});

		expect( attributes.value ).toBeDefined();
		expect( attributes.value[view.toLowerCase()]).toEqual( 1 );

		setValue( undefined, [ 'value.desktop', 'value.tablet', 'value.mobile' ], {});
		expect( attributes.value ).toBeUndefined();
		expect( attributes.value?.[view.toLowerCase()]).toBeUndefined();
	}) );

	test.each([ 'Desktop', 'Tablet', 'Mobile' ])( 'should set the correct value without affecting other values.', ( ( view ) => {
		setAttributes({ value: { desktop: 0, tablet: 0, mobile: 0 }});
		let a: any = { value: { desktop: 0, tablet: 0, mobile: 0 }};
		const f = ( _a: any ) => {
			a = { ...a, ..._a };
		};
		const setValue = buildResponsiveSetAttributes( f, view as 'Desktop' | 'Tablet'| 'Mobile' );

		setValue( 1, [ 'value.desktop', 'value.tablet', 'value.mobile' ], a.value );

		expect( a.value ).toBeDefined();
		expect( a.value[view.toLowerCase()]).toEqual( 1 );

		setValue( 1, [ 'value.desktop', 'value.tablet', 'value.mobile' ], a.value );

		expect( a.value ).toBeDefined();
		expect( a ).toMatchObject(
			{ value: { desktop: 0, tablet: 0, mobile: 0, [view.toLowerCase()]: 1 }}
		);
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

describe( 'Remove Default Value Function', () => {
	it( 'should remove all value from a given object and return undefined', () => {
		const box = { left: '1px', right: '1px', bottom: '1px', top: '1px' };
		const defaultBox = { left: '1px', right: '1px', bottom: '1px', top: '1px' };

		expect( removeBoxDefaultValues( box, defaultBox ) ).toEqual( undefined );
	});

	it( 'should remove only the default value and return a partial object', () => {
		const box = { left: '5px', right: '5px', bottom: '1px', top: '1px' };
		const defaultBox = { left: '1px', right: '1px', bottom: '1px', top: '1px' };

		expect( removeBoxDefaultValues( box, defaultBox ) ).toMatchObject({ left: '5px', right: '5px' });
	});

	it( 'should return undefined when the given box is empty', () => {
		const defaultBox = { left: '1px', right: '1px', bottom: '1px', top: '1px' };

		expect( removeBoxDefaultValues({}, defaultBox ) ).toEqual( undefined );
	});
});

describe( 'Get Choice Function', () => {
	it( 'should choose the first condition.', () => {
		expect( getChoice([
			[ true, 1 ],
			[ true, 2 ],
			[ true, 3 ]
		]) ).toEqual( 1 );
	});

	it( 'should choose the first true condition.', () => {
		expect( getChoice([
			[ false, 1 ],
			[ true, 2 ],
			[ true, 3 ]
		]) ).toEqual( 2 );
	});

	it( 'should choose the default value.', () => {
		expect( getChoice([
			[ false, 1 ],
			[ false, 2 ],
			[ false, 3 ],
			[ 4 ]
		]) ).toEqual( 4 );
	});
});

describe( 'Compact Object Function', () => {
	it( 'should return a object if it do not have empty objects props.', () => {
		const o = { a: { b: 1, c: { d: 2 }, bb: 3 }};
		expect( compactObject( o ) ).toEqual({ a: { b: 1, c: { d: 2 }, bb: 3 }});
	});

	it( 'should modify the copy of the objects.', () => {
		const o = { a: { b: 1, c: {  }, bb: 3 }};
		compactObject( o );
		expect( o ).toEqual({ a: { b: 1, c: {}, bb: 3 }});
	});

	it( 'should return undefined if the object is composed from undefined and empty objects.', () => {
		expect( compactObject({ a: {}, b: {}}) ).toBeUndefined();
	});
});
