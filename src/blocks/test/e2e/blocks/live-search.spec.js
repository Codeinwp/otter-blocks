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

	test( 'post-only search query without a category renders cleanly', async({ editor, page }) => {
		const errors = [];
		page.on( 'pageerror', error => errors.push( error.message ) );
		page.on( 'console', message => {
			if ( 'error' === message.type() ) {
				errors.push( message.text() );
			}
		});

		// Regression: a post-only query with no 'cat' key used to raise an
		// undefined-array-key PHP warning while rendering the block.
		await editor.insertBlock({
			name: 'core/search',
			attributes: {
				otterIsLive: true,
				otterSearchQuery: {
					'post_type': [ 'post' ]
				}
			}
		});

		await publishAndViewPost({ editor, page });

		await expect( page.locator( 'body' ) ).not.toContainText( 'Undefined array key' );

		const input = page.locator( '.o-live-search input[type="search"]' );
		await expect( input ).toBeVisible();

		await input.fill( 'u' );
		await expect( page.locator( '.o-live-search .container-wrap' ) ).toBeVisible();

		expect( errors ).toEqual([]);
	});
});
