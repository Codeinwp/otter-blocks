/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import { publishAndViewPost } from '../helpers/editor';
import { visibleText } from '../helpers/frontend';

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

		await publishAndViewPost({ editor, page });

		await visibleText( page, 'Open Popup' ).click();

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

		await publishAndViewPost({ editor, page });

		await expect( page.getByText( 'Popup Content Test' ) ).toBeVisible();
		await page.keyboard.press( 'Escape' );
		await expect( page.getByText( 'Popup Content Test' ) ).toBeHidden();
	});
});
