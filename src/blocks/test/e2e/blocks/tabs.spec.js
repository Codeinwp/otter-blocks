/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'Tabs Block', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'can be created by typing "/tabs"', async({ editor, page }) => {

		// Create a Progress Block with the slash block shortcut.
		await page.click( 'role=button[name="Add default block"i]' );
		await page.keyboard.type( '/tabs' );
		await page.keyboard.press( 'Enter' );

		const blocks = await editor.getBlocks();
		const hasTabs = blocks.some( ( block ) => 'themeisle-blocks/tabs' === block.name );

		expect( hasTabs ).toBeTruthy();
	});


	test( 'check if it has content by default', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/tabs'
		});

		const tabBlock = ( await editor.getBlocks() ).find( ( block ) => 'themeisle-blocks/tabs' === block.name );

		expect( tabBlock.innerBlocks.length ).toBeGreaterThan( 0 );
	});

	test( 'add new item via button', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/tabs'
		});

		let tabBlock = ( await editor.getBlocks() ).find( ( block ) => 'themeisle-blocks/tabs' === block.name );

		const { clientId } = tabBlock;
		const currentTabsItems = tabBlock.innerBlocks.length;

		await page.getByRole( 'document', { name: 'Block: Tabs' }).getByRole( 'button', { name: 'Add Tab' }).click();

		tabBlock = ( await editor.getBlocks() ).find( ( block ) => 'themeisle-blocks/tabs' === block.name );

		expect( tabBlock.innerBlocks.length ).toBeGreaterThan( currentTabsItems );
	});

	test( 'change tab with the default content', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/tabs'
		});

		const tabBlock = ( await editor.getBlocks() ).find( ( block ) => 'themeisle-blocks/tabs' === block.name );

		expect( tabBlock.innerBlocks.length ).toBeGreaterThan( 0 );

		const postId = await editor.publishPost();

		await page.goto( `/?p=${postId}` );

		await page.getByRole( 'tab', { name: 'Tab 2' }).click();

		await expect( page.locator( '.wp-block-themeisle-blocks-tabs__header_item' ).filter({ hasText: /^Tab 2$/ }).first() ).toHaveClass( /active/ );

		expect( await page.getByRole( 'paragraph' ).filter({ hasText: 'This is just a placeholder to help you visualize how the content is displayed in' }).isVisible() ).toBeTruthy();
	});

	test( 'change tab header content', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/tabs'
		});

		await page.getByRole( 'textbox', { name: 'Add title…' }).first().fill( 'Tab 1000' );

		await expect( page.locator( 'div' ).filter({ hasText: /^Tab 1000$/ }).first() ).toBeVisible();
	});
});
