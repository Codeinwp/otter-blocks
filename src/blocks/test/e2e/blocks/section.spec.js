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

	test( 'check margin and padding controls', async({ editor, page }) => {

		// Create a Section Block with the slash block shortcut. Add a column and a paragraph block.
		await page.click( 'role=button[name="Add default block"i]' );
		await page.keyboard.type( '/section' );
		await page.keyboard.press( 'Enter' );
		await page.getByLabel( 'Single column' ).click();
		await page.getByLabel( 'Add block' ).click();
		await page.getByRole( 'option', { name: 'Paragraph' }).click();
		await page.getByLabel( 'Empty block; start writing or' ).fill( 'Test' );
		await page.getByLabel( 'Document Overview' ).click();
		await page.getByLabel( 'Section', { exact: true }).click();

		// Open Setting panel
		await page.getByLabel( 'Settings', { exact: true }).click();
		await page.getByRole( 'button', { name: 'Style' }).click();

		// Check Default values for Section Block
		await expect( page.getByLabel( 'Padding' ).getByRole( 'textbox', { name: 'All sides' }) ).toBeVisible();
		await expect( page.getByLabel( 'Margin' ).getByRole( 'textbox', { name: 'All sides' }) ).toBeVisible();
		await expect( page.getByLabel( 'Padding' ).getByRole( 'textbox', { name: 'All sides' }) ).toHaveValue( '0' );
		await expect( page.getByLabel( 'Margin' ).getByRole( 'textbox', { name: 'All sides' }) ).toHaveValue( '0' );

		// Set Padding and Margin values and check if they are set for the Section Block
		await page.getByLabel( 'Padding' ).getByRole( 'slider', { name: 'All sides' }).fill( '30' );
		await page.getByLabel( 'Margin' ).getByRole( 'slider', { name: 'All sides' }).fill( '15' );
		await expect( page.getByLabel( 'Padding' ).getByRole( 'textbox', { name: 'All sides' }) ).toHaveValue( '30' );
		await expect( page.getByLabel( 'Margin' ).getByRole( 'textbox', { name: 'All sides' }) ).toHaveValue( '15' );

		// Check Default values for Section Column Block
		await page.getByLabel( 'Section Column', { exact: true }).click();
		await page.getByRole( 'button', { name: 'Style' }).click();
		await expect( page.getByLabel( 'Padding' ).getByRole( 'textbox', { name: 'All sides' }) ).toHaveValue( '0' );
		await expect( page.getByLabel( 'Margin' ).getByRole( 'textbox', { name: 'All sides' }) ).toHaveValue( '0' );

		// Set Padding and Margin values and check if they are set for the Section Column Block
		await page.getByLabel( 'Padding' ).getByRole( 'slider', { name: 'All sides' }).fill( '20' );
		await page.getByLabel( 'Margin' ).getByRole( 'slider', { name: 'All sides' }).fill( '10' );
		await expect( page.getByLabel( 'Padding' ).getByRole( 'textbox', { name: 'All sides' }) ).toHaveValue( '20' );
		await expect( page.getByLabel( 'Margin' ).getByRole( 'textbox', { name: 'All sides' }) ).toHaveValue( '10' );

		// Close Setting panel to preserve the original state
		await page.getByLabel( 'Settings', { exact: true }).click();
	});
});
