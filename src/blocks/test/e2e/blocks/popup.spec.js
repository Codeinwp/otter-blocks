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

	test( 'close button exposes an accessible name to screen readers', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/popup',
			attributes: {},
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

		const closeButton = page.locator( '.otter-popup__modal_header .components-button' );

		// The button must carry an explicit accessible name, not rely on the icon alone.
		await expect( closeButton ).toHaveAttribute( 'aria-label', 'Close' );
		await expect( closeButton ).toHaveAttribute( 'title', 'Close' );

		// A visually-hidden label backs up the aria-label for assistive tech.
		await expect( closeButton.locator( '.screen-reader-text' ) ).toHaveText( 'Close' );

		// The decorative icon must stay hidden from the accessibility tree.
		await expect( closeButton.locator( 'svg' ) ).toHaveAttribute( 'aria-hidden', 'true' );

		// It must be reachable by name through the accessibility tree, and close on Enter.
		const closeByRole = page.getByRole( 'button', { name: 'Close' });
		await expect( closeByRole ).toBeVisible();

		await closeByRole.focus();
		await expect( closeByRole ).toBeFocused();
		await page.keyboard.press( 'Enter' );
		await expect( page.getByText( 'Popup Content Test' ) ).toBeHidden();
	});

	test( 'inside close button receives clicks when content has positioned columns', async({ editor, page }) => {

		// Section columns are position:relative on desktop; without a z-index on
		// the header they paint over the close button and swallow its clicks.
		// See https://github.com/Codeinwp/otter-blocks/issues/2863
		await page.setViewportSize({ width: 1280, height: 800 });

		await editor.insertBlock({
			name: 'themeisle-blocks/popup',
			attributes: {},
			innerBlocks: [
				{
					name: 'themeisle-blocks/advanced-columns',
					attributes: {
						columns: 2,
						layout: 'equal'
					},
					innerBlocks: [
						{
							name: 'themeisle-blocks/advanced-column',
							innerBlocks: [
								{
									name: 'core/paragraph',
									attributes: {
										content: 'Popup Content Test'
									}
								}
							]
						},
						{
							name: 'themeisle-blocks/advanced-column',
							innerBlocks: [
								{
									name: 'core/paragraph',
									attributes: {
										content: 'Second Column'
									}
								}
							]
						}
					]
				}
			]
		});

		await publishAndViewPost({ editor, page });

		await expect( page.getByText( 'Popup Content Test' ) ).toBeVisible();

		// Playwright refuses to click covered elements, so this fails if the
		// columns overlay the button.
		await page.getByRole( 'button', { name: 'Close' }).click();

		await expect( page.getByText( 'Popup Content Test' ) ).toBeHidden();
	});
});
