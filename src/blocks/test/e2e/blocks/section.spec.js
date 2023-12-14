/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'Section Block', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'can be created by typing "/section"', async({ editor, page }) => {

		// Create a Progress Block with the slash block shortcut.
		await page.click( 'role=button[name="Add default block"i]' );
		await page.keyboard.type( '/section' );
		await page.keyboard.press( 'Enter' );

		const blocks = await editor.getBlocks();
		const hasSection = blocks.some( ( block ) => 'themeisle-blocks/advanced-columns' === block.name );

		expect( hasSection ).toBeTruthy();
	});

	test( 'can be created by typing "/section" and choose Single Column', async({ editor, page }) => {

		// Create a Progress Block with the slash block shortcut.
		await page.click( 'role=button[name="Add default block"i]' );
		await page.keyboard.type( '/section' );
		await page.keyboard.press( 'Enter' );

		const hasSection = ( await editor.getBlocks() ).some( ( block ) => 'themeisle-blocks/advanced-columns' === block.name );

		expect( hasSection ).toBeTruthy();

		await page.getByRole( 'button', { name: 'Single column' }).click();

		const blocks = await editor.getBlocks();

		const sectionBlock = blocks.find( ( block ) => 'themeisle-blocks/advanced-columns' === block.name );

		// Check if w have a column in innerBlocks
		expect( sectionBlock.innerBlocks.length ).toBe( 1 );
	});

	test( 'add new column', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/advanced-columns',
			innerBlocks: [
				{
					name: 'themeisle-blocks/advanced-column'
				}
			]
		});

		let sectionBlock = ( await editor.getBlocks() ).find( ( block ) => 'themeisle-blocks/advanced-columns' === block.name );

		const columnController = page.getByRole( 'spinbutton', { name: 'Columns' });

		await columnController.click();

		// Press the up arrow one time
		await columnController.press( 'ArrowUp' );

		sectionBlock = ( await editor.getBlocks() ).find( ( block ) => 'themeisle-blocks/advanced-columns' === block.name );

		expect( sectionBlock.innerBlocks.length ).toBe( 2 );
	});

	test( 'delete one column', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/advanced-columns',
			innerBlocks: [
				{
					name: 'themeisle-blocks/advanced-column'
				},
				{
					name: 'themeisle-blocks/advanced-column'
				}
			]
		});

		let sectionBlock = ( await editor.getBlocks() ).find( ( block ) => 'themeisle-blocks/advanced-columns' === block.name );

		const columnController = page.getByRole( 'spinbutton', { name: 'Columns' });

		await columnController.click();

		// Press the up arrow one time
		await columnController.press( 'ArrowDown' );

		sectionBlock = ( await editor.getBlocks() ).find( ( block ) => 'themeisle-blocks/advanced-columns' === block.name );

		expect( sectionBlock.innerBlocks.length ).toBe( 1 );
	});
});
