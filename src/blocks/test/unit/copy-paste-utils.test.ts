import {
	addUnit,
	createBoxFrom,
	extractThemeCSSVar,
	getColorFromThemeStyles,
	getInt,
	getSingleValueFromBox,
	makeBox
} from '../../plugins/copy-paste/utils';

describe( 'copy-paste utils', () => {
	beforeEach( () => {
		delete ( window as any ).oThemeStyles;
	});

	describe( 'addUnit', () => {
		it( 'adds unit to provided numbers', () => {
			expect( addUnit( 12, 'px' ) ).toBe( '12px' );
		});

		it( 'returns undefined for undefined value', () => {
			expect( addUnit( undefined, 'px' ) ).toBeUndefined();
		});
	});

	describe( 'getInt', () => {
		it( 'extracts integers from strings', () => {
			expect( getInt( '123px' ) ).toBe( 123 );
			expect( getInt( '08' ) ).toBe( 8 );
		});

		it( 'returns default values for invalid inputs', () => {
			expect( getInt( undefined, 99 ) ).toBe( 99 );
			expect( getInt( 'abc', 7 ) ).toBe( 7 );
			expect( getInt( 'abc' ) ).toBeUndefined();
		});
	});

	describe( 'makeBox', () => {
		it( 'creates a full box with all sides', () => {
			expect( makeBox( '10px' ) ).toEqual({
				top: '10px',
				left: '10px',
				right: '10px',
				bottom: '10px'
			});
		});
	});

	describe( 'getSingleValueFromBox', () => {
		it( 'returns undefined when box is undefined', () => {
			expect( getSingleValueFromBox( undefined ) ).toBeUndefined();
		});

		it( 'prefers non-zero values', () => {
			expect( getSingleValueFromBox({
				top: '0px',
				right: '0px',
				bottom: '12px',
				left: '0px'
			}) ).toBe( '12px' );
		});

		it( 'falls back to last value when all values are zero-like', () => {
			expect( getSingleValueFromBox({
				top: '0px',
				right: '0px',
				bottom: '0px',
				left: '0px'
			}) ).toBe( '0px' );
		});
	});

	describe( 'createBoxFrom', () => {
		it( 'creates px boxes from numbers', () => {
			expect( createBoxFrom( 10 ) ).toEqual({
				top: '10px',
				left: '10px',
				right: '10px',
				bottom: '10px'
			});
		});

		it( 'creates boxes from strings', () => {
			expect( createBoxFrom( '2em' ) ).toEqual({
				top: '2em',
				left: '2em',
				right: '2em',
				bottom: '2em'
			});
		});

		it( 'returns input object and undefined as-is', () => {
			const box = { top: '1px', right: '2px', bottom: '3px', left: '4px' };
			expect( createBoxFrom( box ) ).toEqual( box );
			expect( createBoxFrom( undefined ) ).toBeUndefined();
		});
	});

	describe( 'theme style helpers', () => {
		it( 'extracts colors, gradients and css vars into window state', () => {
			extractThemeCSSVar({
				colors: [{ slug: 'primary', color: '#111111', name: 'Primary' }],
				gradients: [{ slug: 'sunset', gradient: 'linear-gradient(red, blue)', name: 'Sunset' }],
				styles: [{
					css: ':root{--wp--preset--color--base:#fff;--wp--preset--gradient--brand:linear-gradient(red,blue);--wp--preset--duotone--soft:unset;}',
					__unstableType: 'global'
				}]
			});

			expect( ( window as any ).oThemeStyles.colors ).toEqual([{ label: 'primary', value: '#111111' }]);
			expect( ( window as any ).oThemeStyles.gradients ).toEqual([{ label: 'sunset', value: 'linear-gradient(red, blue)' }]);
			expect( ( window as any ).oThemeStyles.cssVars ).toEqual(
				expect.arrayContaining([ '--wp--preset--color--base', '--wp--preset--gradient--brand', '--wp--preset--duotone--soft' ])
			);
		});

		it( 'resolves colors from theme style state', () => {
			extractThemeCSSVar({
				colors: [{ slug: 'primary', color: '#123456', name: 'Primary' }],
				gradients: [{ slug: 'sunset', gradient: 'linear-gradient(red, blue)', name: 'Sunset' }],
				styles: [{
					css: ':root{--wp--preset--color--base:#fff;--wp--preset--gradient--brand:linear-gradient(red,blue);--wp--preset--duotone--soft:unset;}',
					__unstableType: 'global'
				}]
			});

			expect( getColorFromThemeStyles( 'color', 'primary' ) ).toBe( '#123456' );
			expect( getColorFromThemeStyles( 'gradient', 'sunset' ) ).toBe( 'linear-gradient(red, blue)' );
			expect( getColorFromThemeStyles( 'duotone', 'soft' ) ).toBe( 'var(--wp--preset--duotone--soft)' );
			expect( getColorFromThemeStyles( 'any', 'missing' ) ).toBeUndefined();
		});
	});
});
