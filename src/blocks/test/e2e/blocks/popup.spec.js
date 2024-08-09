/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'Popup', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'anchor to a button', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'core/buttons',
			attributes: {},
			innerBlocks: [
				{
					name: 'core/button',
					attributes: {
						text: 'Open Popup',
						anchor: 'popup-trigger'
					}
				}
			]
		});

		await editor.insertBlock({
			name: 'themeisle-blocks/popup',
			attributes: {
				anchor: 'popup-trigger',
				trigger: 'onClick'
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

		await page.locator( 'div' ).filter({ hasText: /^Open Popup$/ }).click();

		await expect( page.getByText( 'Popup Content Test' ) ).toBeVisible();
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
