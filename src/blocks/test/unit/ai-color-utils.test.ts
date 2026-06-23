import {
	contrastRatio,
	hexToRgb,
	MIN_CONTRAST_AA,
	relativeLuminance
} from '../../plugins/ai-content/color-utils';

describe( 'AI color utils', () => {
	it( 'parses #rrggbb and shorthand #rgb hex', () => {
		expect( hexToRgb( '#ffffff' ) ).toEqual({ r: 255, g: 255, b: 255 });
		expect( hexToRgb( '#000' ) ).toEqual({ r: 0, g: 0, b: 0 });
		expect( hexToRgb( 'aabbcc' ) ).toEqual({ r: 170, g: 187, b: 204 });
	});

	it( 'returns null for non-hex values (slugs, vars, gradients)', () => {
		expect( hexToRgb( 'vivid-red' ) ).toBeNull();
		expect( hexToRgb( 'var(--wp--preset--color--primary)' ) ).toBeNull();
		expect( hexToRgb( '' ) ).toBeNull();
	});

	it( 'computes the WCAG contrast extremes', () => {
		// Black on white is the maximum 21:1; identical colors are 1:1.
		expect( Math.round( contrastRatio( '#000000', '#ffffff' ) as number ) ).toBe( 21 );
		expect( contrastRatio( '#777777', '#777777' ) ).toBeCloseTo( 1, 5 );
	});

	it( 'flags a low-contrast pair against the AA threshold', () => {
		const ratio = contrastRatio( '#888888', '#777777' ) as number;
		expect( ratio ).toBeLessThan( MIN_CONTRAST_AA );
	});

	it( 'returns null contrast when either color is not hex', () => {
		expect( contrastRatio( 'primary', '#ffffff' ) ).toBeNull();
	});

	it( 'orders luminance white > black', () => {
		expect( relativeLuminance({ r: 255, g: 255, b: 255 }) ).toBeGreaterThan(
			relativeLuminance({ r: 0, g: 0, b: 0 })
		);
	});
});
