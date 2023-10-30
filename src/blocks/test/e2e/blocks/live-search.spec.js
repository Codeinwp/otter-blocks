/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'Live Search Block', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'can be created by typing "/live-search"', async({ editor, page }) => {

		// Create a Progress Block with the slash block shortcut.
		await page.click( 'role=button[name="Add default block"i]' );
		await page.keyboard.type( '/live-search' );
		await page.keyboard.press( 'Enter' );

		const blocks = await editor.getBlocks();

		// Since Live Search is a variation of the Search block, we check for the Search block instead.
		const hasSearch = blocks.some( ( block ) => 'core/search' === block.name );

		expect( hasSearch ).toBeTruthy();
	});

	test( 'add a live search block inside a Popup and check results rendering', async({ admin, editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/popup',
			innerBlocks: [
				{
					name: 'core/search',
					attributes: {
						otterIsLive: true
					}
				}
			]
		});

		const postId = await editor.publishPost();

		await page.goto( `/?p=${postId}` );

		expect ( page.locator( '#wp-block-search__input-1' ) ).toBeVisible();

		await page.fill( '#wp-block-search__input-1', 'u' );

		// If the width is 0, it means the results are not rendered properly.
		const container = page.locator( '.o-live-search .container-wrap' );
		let width = await container.evaluate( node => node.offsetWidth );
		expect( width ).toBeGreaterThan( 0 );
	});
});
