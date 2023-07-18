/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'Accordion Block', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'can be created by typing "/accordion"', async({ editor, page }) => {

		// Create a Progress Block with the slash block shortcut.
		await page.click( 'role=button[name="Add default block"i]' );
		await page.keyboard.type( '/accordion' );
		await page.keyboard.press( 'Enter' );

		const blocks = await editor.getBlocks();
		const hasAccordion = blocks.some( ( block ) => 'themeisle-blocks/accordion' === block.name );

		expect( hasAccordion ).toBeTruthy();
	});


	test( 'check if it has content by default', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/accordion'
		});

		let accordionBlock = ( await editor.getBlocks() ).find( ( block ) => 'themeisle-blocks/accordion' === block.name );

		expect( accordionBlock.innerBlocks.length ).toBeGreaterThan( 0 );
	});

	test( 'add new item via button', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/accordion'
		});

		let accordionBlock = ( await editor.getBlocks() ).find( ( block ) => 'themeisle-blocks/accordion' === block.name );

		const { clientId } = accordionBlock;
		const currentAccordionItems = accordionBlock.innerBlocks.length;

		await page.click( `#block-${clientId}` );
		await page.getByRole( 'button', { name: 'Select Accordion' }).click();

		await page.getByRole( 'button', { name: 'Add Accordion Item' }).click();

		accordionBlock = ( await editor.getBlocks() ).find( ( block ) => 'themeisle-blocks/accordion' === block.name );

		expect( accordionBlock.innerBlocks.length ).toBeGreaterThan( currentAccordionItems );
	});
});
