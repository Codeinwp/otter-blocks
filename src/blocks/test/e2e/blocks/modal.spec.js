/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import { publishAndViewPost } from '../helpers/editor';
import { visibleText } from '../helpers/frontend';

/**
 * Insert a Modal block wired to a button trigger.
 *
 * @param {import('@wordpress/e2e-test-utils-playwright').Editor} editor The editor utils.
 * @return {Promise<void>}
 */
async function insertModalWithTrigger( editor ) {
	await editor.insertBlock({
		name: 'core/buttons',
		attributes: {},
		innerBlocks: [
			{
				name: 'core/button',
				attributes: {
					text: 'Open Modal',
					anchor: 'modal-trigger'
				}
			}
		]
	});

	await editor.insertBlock({
		name: 'themeisle-blocks/modal',
		attributes: {
			anchor: 'modal-trigger'
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
}

test.describe( 'Modal', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'anchor to a button', async({ editor, page }) => {
		await insertModalWithTrigger( editor );

		await publishAndViewPost({ editor, page });

		await visibleText( page, 'Open Modal' ).click();

		await expect( page.getByText( 'Popup Content Test' ) ).toBeVisible();
	});

	test( 'close on escape', async({ editor, page }) => {
		await insertModalWithTrigger( editor );

		await publishAndViewPost({ editor, page });

		await visibleText( page, 'Open Modal' ).click();

		await expect( page.getByText( 'Popup Content Test' ) ).toBeVisible();
		await page.keyboard.press( 'Escape' );
		await expect( page.getByText( 'Popup Content Test' ) ).toBeHidden();
	});

	test( 'close button exposes an accessible name to screen readers', async({ editor, page }) => {
		await insertModalWithTrigger( editor );

		await publishAndViewPost({ editor, page });

		await visibleText( page, 'Open Modal' ).click();
		await expect( page.getByText( 'Popup Content Test' ) ).toBeVisible();

		const closeButton = page.locator( '.otter-popup__modal_header .components-button' );

		// The button must carry an explicit accessible name, not rely on the icon alone.
		await expect( closeButton ).toHaveAttribute( 'aria-label', 'Close' );
		await expect( closeButton ).toHaveAttribute( 'title', 'Close' );

		// A visually-hidden label backs up the aria-label for assistive tech.
		const srText = closeButton.locator( '.screen-reader-text' );
		await expect( srText ).toHaveText( 'Close' );

		// The decorative icon must stay hidden from the accessibility tree.
		await expect( closeButton.locator( 'svg' ) ).toHaveAttribute( 'aria-hidden', 'true' );

		// It must be reachable by name through the accessibility tree.
		await expect(
			page.getByRole( 'button', { name: 'Close' })
		).toBeVisible();
	});

	test( 'close button is operable with the keyboard', async({ editor, page }) => {
		await insertModalWithTrigger( editor );

		await publishAndViewPost({ editor, page });

		await visibleText( page, 'Open Modal' ).click();
		await expect( page.getByText( 'Popup Content Test' ) ).toBeVisible();

		const closeButton = page.getByRole( 'button', { name: 'Close' });

		// A native <button> is focusable and activatable from the keyboard.
		await closeButton.focus();
		await expect( closeButton ).toBeFocused();

		await page.keyboard.press( 'Enter' );
		await expect( page.getByText( 'Popup Content Test' ) ).toBeHidden();
	});
});
