/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'Popup', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'close on escape', async({ editor, page }) => {

		await editor.insertBlock({
			name: 'themeisle-blocks/popup',
			attributes: {

			},
			innerBlocks: [
				{
					name: 'core/paragraph',
					attributes: {
						content: 'Popup Content Test'
					}
				}
			]
		});

		const postId = await editor.publishPost();
		await page.goto( `/?p=${postId}` );

		await expect( page.getByText( 'Popup Content Test' ) ).toBeVisible();
		await page.keyboard.press( 'Escape' );
		await expect( page.getByText( 'Popup Content Test' ) ).toBeHidden();
	});
});
