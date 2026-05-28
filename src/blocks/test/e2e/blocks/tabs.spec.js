/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import { expectBlockByName, insertBlockBySlash, publishAndViewPost } from '../helpers/editor';

test.describe( 'Tabs Block', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'can be created by typing "/tabs"', async({ editor, page }) => {

		// Create a Progress Block with the slash block shortcut.
		await insertBlockBySlash({
			editor,
			page,
			shortcut: '/tabs',
			blockName: 'themeisle-blocks/tabs'
		});
	});


	test( 'check if it has content by default', async({ editor }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/tabs'
		});

		const tabBlock = await expectBlockByName( editor, 'themeisle-blocks/tabs' );

		expect( tabBlock.innerBlocks.length ).toBeGreaterThan( 0 );
	});

	test( 'add new item via button', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/tabs'
		});

		let tabBlock = await expectBlockByName( editor, 'themeisle-blocks/tabs' );

		const currentTabsItems = tabBlock.innerBlocks.length;

		// themeisle-blocks/tabs opts out of the iframed canvas, so the block renders at page level.
		await page.getByRole( 'document', { name: 'Block: Tabs' }).getByRole( 'button', { name: 'Add Tab' }).click();

		tabBlock = await expectBlockByName( editor, 'themeisle-blocks/tabs' );

		expect( tabBlock.innerBlocks.length ).toBeGreaterThan( currentTabsItems );
	});

	test( 'change tab with the default content', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/tabs'
		});

		const tabBlock = await expectBlockByName( editor, 'themeisle-blocks/tabs' );

		expect( tabBlock.innerBlocks.length ).toBeGreaterThan( 0 );

		await publishAndViewPost({ editor, page });

		await page.getByRole( 'tab', { name: 'Tab 2' }).click();

		await expect( page.locator( '.wp-block-themeisle-blocks-tabs__header_item' ).filter({ hasText: /^Tab 2$/ }).first() ).toHaveClass( /active/ );

		await expect( page.getByRole( 'paragraph' ).filter({ hasText: 'This is just a placeholder to help you visualize how the content is displayed in' }) ).toBeVisible();
	});

	test( 'change tab header content', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/tabs'
		});

		await page.getByRole( 'textbox', { name: 'Add title…' }).first().fill( 'Tab 1000' );

		await expect( page.locator( 'div' ).filter({ hasText: /^Tab 1000$/ }).first() ).toBeVisible();
	});
});
