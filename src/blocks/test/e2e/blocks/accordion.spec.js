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

		const accordionBlock = ( await editor.getBlocks() ).find( ( block ) => 'themeisle-blocks/accordion' === block.name );

		expect( accordionBlock.innerBlocks.length ).toBeGreaterThan( 0 );
	});

	test( 'add new item via button', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/accordion'
		});

		let accordionBlock = ( await editor.getBlocks() ).find( ( block ) => 'themeisle-blocks/accordion' === block.name );

		const { clientId } = accordionBlock;
		const currentAccordionItems = accordionBlock.innerBlocks.length;

		await page.getByRole( 'button', { name: 'Add Accordion Item' }).click();

		accordionBlock = ( await editor.getBlocks() ).find( ( block ) => 'themeisle-blocks/accordion' === block.name );

		expect( accordionBlock.innerBlocks.length ).toBeGreaterThan( currentAccordionItems );
	});

	test( 'show/hide with default content', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/accordion'
		});

		const accordionBlock = ( await editor.getBlocks() ).find( ( block ) => 'themeisle-blocks/accordion' === block.name );

		expect( accordionBlock.innerBlocks.length ).toBeGreaterThan( 0 );

		const postId = await editor.publishPost();

		await page.goto( `/?p=${postId}` );

		// No tabs should be opened by default
		expect( await page.getByRole( 'paragraph' ).filter({ hasText: 'This is a placeholder tab content. It is important to have the necessary informa' }).isVisible() ).toBeFalsy();

		// Open the first tab
		await page.locator( 'summary' ).filter({ hasText: 'Accordion title 1' }).click();

		expect( await page.getByRole( 'paragraph' ).filter({ hasText: 'This is a placeholder tab content. It is important to have the necessary informa' }).isVisible() ).toBeTruthy();

		// Close the first tab
		await page.locator( 'summary' ).filter({ hasText: 'Accordion title 1' }).click();

		expect( await page.getByRole( 'paragraph' ).filter({ hasText: 'This is a placeholder tab content. It is important to have the necessary informa' }).isVisible() ).toBeFalsy();
	});
});
