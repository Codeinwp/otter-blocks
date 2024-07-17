/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'Button Group', () => {
	test.beforeEach( async({ admin, page }) => {
		await admin.createNewPost();
	});

	test( 'check font settings', async({ editor, page }) => {
		const attributes = {
			fontSize: '28px',
			fontFamily: 'Abel',
			textTransform: 'lowercase',
			fontStyle: 'italic',
			lineHeight: '2.5'
		};

		await editor.insertBlock({
			name: 'themeisle-blocks/button-group',
			attributes,
			innerBlocks: [
				{
					name: 'themeisle-blocks/button',
					attributes: {
						text: 'Button 1'
					}
				}
			]
		});

		const postId = await editor.publishPost();
		await page.goto( `/?p=${postId}` );

		// Check CSS font properties
		const btn = page.locator( 'a' ).filter({ hasText: 'Button 1' });
		await expect( btn ).toHaveCSS( 'font-size', attributes.fontSize );
		await expect( btn ).toHaveCSS( 'font-family', attributes.fontFamily );
		await expect( btn ).toHaveCSS( 'text-transform', attributes.textTransform );
		await expect( btn ).toHaveCSS( 'font-style', attributes.fontStyle );
		await expect( btn ).toHaveCSS( 'line-height', `${parseInt( attributes.fontSize ) * parseFloat( attributes.lineHeight )}px` ); // Playwright use computed line-height based on font-size.
	});
});
