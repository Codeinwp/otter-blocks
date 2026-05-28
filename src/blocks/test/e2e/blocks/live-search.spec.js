/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import { insertBlockBySlash, publishAndViewPost } from '../helpers/editor';

test.describe( 'Live Search Block', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'can be created by typing "/live-search"', async({ editor, page }) => {

		// Create a Progress Block with the slash block shortcut.
		// Since Live Search is a variation of the Search block, we check for the Search block instead.
		await insertBlockBySlash({
			editor,
			page,
			shortcut: '/live-search',
			blockName: 'core/search'
		});
	});

	test( 'add a live search block inside a Popup and check results rendering', async({ editor, page }) => {
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

		await publishAndViewPost({ editor, page });

		const input = page.locator( '.otter-popup__modal_body .o-live-search input' );

		await expect( input ).toBeVisible();

		await input.fill( 'u' );

		// If the width is 0, it means the results are not rendered properly.
		const container = page.locator( '.o-live-search .container-wrap' );
		const width = await container.evaluate( node => node.offsetWidth );
		expect( width ).toBeGreaterThan( 0 );
	});
});
