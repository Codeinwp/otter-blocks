import {
	_cssBlock,
	_cssProp,
	findInnerBlocks,
	getObjectFromQueryString,
	getQueryStringFromObject,
	hex2rgba,
	isAppleOS,
	isEmptyBox,
	numberToBox,
	objectOrNumberAsBox,
	renderBoxOrNumWithUnit,
	setUtm
} from '../../helpers/helper-functions';

describe( 'hex2rgba', () => {
	it( 'converts hex colors to rgba', () => {
		expect( hex2rgba( '#ff0000' ) ).toBe( 'rgba(255,0,0,1)' );
		expect( hex2rgba( '#00ff00', 50 ) ).toBe( 'rgba(0,255,0,0.5)' );
	});

	it( 'passes through non-hex values', () => {
		expect( hex2rgba( 'rgb(1,2,3)' ) ).toBe( 'rgb(1,2,3)' );
	});

	it( 'uses black when color is missing', () => {
		expect( hex2rgba( undefined ) ).toBe( 'rgba(0,0,0,1)' );
	});
});

describe( 'query string helpers', () => {
	it( 'parses query strings into objects', () => {
		expect( getObjectFromQueryString( '?a=1&b=hello%20world' ) ).toEqual({
			a: '1',
			b: 'hello world'
		});
	});

	it( 'serializes objects into query strings', () => {
		expect( getQueryStringFromObject({ a: 1, b: 'two' }) ).toBe( 'a=1&b=two' );
	});
});

describe( 'setUtm', () => {
	it( 'adds campaign and optional content utm params', () => {
		expect( setUtm( 'https://example.com/path', 'dashboard', 'button' ) ).toContain( 'utm_campaign=dashboard' );
		expect( setUtm( 'https://example.com/path', 'dashboard', 'button' ) ).toContain( 'utm_content=button' );
	});

	it( 'keeps existing query params', () => {
		const result = setUtm( 'https://example.com/path?foo=bar', 'dashboard', undefined );
		expect( result ).toContain( 'foo=bar' );
		expect( result ).toContain( 'utm_campaign=dashboard' );
	});
});

describe( 'css helpers', () => {
	it( 'builds css declarations conditionally', () => {
		expect( _cssProp( 'color', 'red' ) ).toBe( 'color: red;' );
		expect( _cssProp( 'color', undefined ) ).toBeUndefined();
		expect( _cssProp( 'color', 'red', false ) ).toBeUndefined();
		expect( _cssProp( 'width', '20px', value => value.startsWith( '2' ) ) ).toBe( 'width: 20px;' );
	});

	it( 'builds css blocks and omits invalid declarations', () => {
		const block = _cssBlock([
			[ 'color', 'red' ],
			[ 'margin', undefined ],
			[ 'display', 'block', true ]
		]);

		expect( block ).toContain( 'color: red;' );
		expect( block ).toContain( 'display: block;' );
		expect( block ).not.toContain( 'margin:' );
	});
});

describe( 'box helpers', () => {
	it( 'converts numbers to boxes with units', () => {
		expect( numberToBox( 12 ) ).toEqual({
			top: '12px',
			right: '12px',
			bottom: '12px',
			left: '12px'
		});
	});

	it( 'renders number and box values to css strings', () => {
		expect( renderBoxOrNumWithUnit( 5, 'em' ) ).toBe( '5em 5em 5em 5em' );
		expect( renderBoxOrNumWithUnit({
			top: '1px',
			right: '2px',
			bottom: '3px',
			left: '4px'
		}, 'px' ) ).toBe( '1px 2px 3px 4px' );
	});

	it( 'creates box-like values from numbers and objects', () => {
		expect( objectOrNumberAsBox( 6 ) ).toEqual({
			top: '6px',
			right: '6px',
			bottom: '6px',
			left: '6px'
		});

		expect( objectOrNumberAsBox( undefined, { top: '1px', right: '1px', bottom: '1px', left: '1px' }) ).toEqual({
			top: '1px',
			right: '1px',
			bottom: '1px',
			left: '1px'
		});

		expect( objectOrNumberAsBox({ top: '1px', right: '2px', bottom: '3px', left: '4px' }) ).toEqual({
			top: '1px',
			right: '2px',
			bottom: '3px',
			left: '4px'
		});
	});

	it( 'checks if boxes are complete', () => {
		expect( isEmptyBox({ top: '1px', right: '1px', bottom: '1px', left: '1px' }) ).toBe( false );
		expect( isEmptyBox({ top: '1px', right: '1px', bottom: '1px' }) ).toBe( true );
		expect( isEmptyBox( undefined ) ).toBe( true );
	});
});

describe( 'isAppleOS', () => {
	it( 'detects Apple and non-Apple platforms using DI window', () => {
		expect( isAppleOS({ navigator: { platform: 'MacIntel' }} as Window ) ).toBe( true );
		expect( isAppleOS({ navigator: { platform: 'iPhone' }} as Window ) ).toBe( true );
		expect( isAppleOS({ navigator: { platform: 'Win32' }} as Window ) ).toBe( false );
	});
});

describe( 'findInnerBlocks', () => {
	const tree = [
		{
			name: 'root-a',
			innerBlocks: [
				{ name: 'target-1' },
				{
					name: 'nested',
					innerBlocks: [{ name: 'target-2' }]
				}
			]
		},
		{ name: 'root-b', innerBlocks: [] }
	];

	it( 'finds matching blocks recursively', () => {
		const found = findInnerBlocks( tree as never[], b => b.name.startsWith( 'target-' ) );
		expect( found.map( b => b.name ) ).toEqual([ 'target-1', 'target-2' ]);
	});

	it( 'returns empty array for invalid input', () => {
		expect( findInnerBlocks( undefined, () => true ) ).toEqual([]);
		expect( findInnerBlocks( tree as never[], undefined ) ).toEqual([]);
	});
});
