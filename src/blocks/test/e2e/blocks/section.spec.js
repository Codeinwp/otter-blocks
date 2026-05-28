/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import { expectBlockByName, insertBlockBySlash } from '../helpers/editor';

test.describe( 'Section Block', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'can navigate between blocks using arrow keys', async({ editor, page }) => {
		await page.waitForFunction( () => window?.wp?.blocks && window?.wp?.data );
		await page.evaluate( () => {
			const { createBlock } = window.wp.blocks;

			const blocks = [
				createBlock( 'core/paragraph', { content: 'Before' } ),
				createBlock(
					'themeisle-blocks/advanced-columns',
					{},
					[
						createBlock(
							'themeisle-blocks/advanced-column',
							{},
							[ createBlock( 'core/paragraph', { content: 'Inside' } ) ]
						)
					]
				),
				createBlock( 'core/paragraph', { content: 'After' } )
			];

			window.wp.data.dispatch( 'core/block-editor' ).resetBlocks( blocks );
		});

		const rootBlocks = page.locator( '.block-editor-block-list__layout.is-root-container' );

		const sectionBlock = rootBlocks.locator(
			'> .block-editor-block-list__block[data-type="themeisle-blocks/advanced-columns"]'
		).first();

		const paragraphs = rootBlocks.locator(
			'> .block-editor-block-list__block[data-type="core/paragraph"]'
		);

		await expect( paragraphs ).toHaveCount( 2 );

		const firstParagraph = paragraphs.first();
		const lastParagraph = paragraphs.nth( 1 );

		const firstParagraphClientId = await firstParagraph.getAttribute( 'data-block' );
		const lastParagraphClientId = await lastParagraph.getAttribute( 'data-block' );

		expect( firstParagraphClientId ).toBeTruthy();
		expect( lastParagraphClientId ).toBeTruthy();

		await editor.selectBlocks( sectionBlock );
		await page.waitForFunction( () => {
			return 'themeisle-blocks/advanced-columns' === window.wp.data.select( 'core/block-editor' )?.getSelectedBlock?.()?.name;
		});

		await page.keyboard.press( 'ArrowDown' );
		await page.waitForFunction( ( expectedClientId ) => {
			return expectedClientId === window.wp.data.select( 'core/block-editor' )?.getSelectedBlockClientId?.();
		}, lastParagraphClientId );

		await editor.selectBlocks( sectionBlock );
		await page.waitForFunction( () => {
			return 'themeisle-blocks/advanced-columns' === window.wp.data.select( 'core/block-editor' )?.getSelectedBlock?.()?.name;
		});

		await page.keyboard.press( 'ArrowUp' );
		await page.waitForFunction( ( expectedClientId ) => {
			return expectedClientId === window.wp.data.select( 'core/block-editor' )?.getSelectedBlockClientId?.();
		}, firstParagraphClientId );
	});

	test( 'can be created by typing "/section"', async({ editor, page }) => {

		// Create a Progress Block with the slash block shortcut.
		await insertBlockBySlash({
			editor,
			page,
			shortcut: '/section',
			blockName: 'themeisle-blocks/advanced-columns'
		});
	});

	test( 'can be created by typing "/section" and choose Single Column', async({ editor, page }) => {

		// Create a Progress Block with the slash block shortcut.
		await insertBlockBySlash({
			editor,
			page,
			shortcut: '/section',
			blockName: 'themeisle-blocks/advanced-columns'
		});

		await page.getByRole( 'button', { name: 'Single column' }).click();

		const sectionBlock = await expectBlockByName( editor, 'themeisle-blocks/advanced-columns' );

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

		let sectionBlock = await expectBlockByName( editor, 'themeisle-blocks/advanced-columns' );

		const columnController = page.getByRole( 'spinbutton', { name: 'Columns' });

		await columnController.click();

		// Press the up arrow one time
		await columnController.press( 'ArrowUp' );

		sectionBlock = await expectBlockByName( editor, 'themeisle-blocks/advanced-columns' );

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

		let sectionBlock = await expectBlockByName( editor, 'themeisle-blocks/advanced-columns' );

		const columnController = page.getByRole( 'spinbutton', { name: 'Columns' });

		await columnController.click();

		// Press the up arrow one time
		await columnController.press( 'ArrowDown' );

		sectionBlock = await expectBlockByName( editor, 'themeisle-blocks/advanced-columns' );

		expect( sectionBlock.innerBlocks.length ).toBe( 1 );
	});

	test( 'check margin and padding controls', async({ editor, page }) => {

		// Create a Section Block with the slash block shortcut. Add a column and a paragraph block.
		await insertBlockBySlash({
			editor,
			page,
			shortcut: '/section',
			blockName: 'themeisle-blocks/advanced-columns'
		});
		await page.getByLabel( 'Single column' ).click();
		await page.getByLabel( 'Add block' ).click();
		await page.getByRole( 'option', { name: 'Paragraph' }).click();
		await page.getByLabel( 'Empty block; start writing or' ).fill( 'Test' );
		await page.getByLabel( 'Document Overview' ).click();
		await page.getByRole( 'link', { name: 'Section', exact: true }).click();

		// Open Setting panel
		await page.getByRole( 'link', { name: 'Section', exact: true }).click;
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

		// Check Default values for Section Column Block after reset.
		await page.getByRole( 'link', { name: 'Section', exact: true }).click();
		await page.getByRole( 'button', { name: 'Style' }).click();

		await page.getByLabel( 'Padding' ).getByRole( 'button', { name: 'Reset' }).click();
		await page.getByLabel( 'Margin' ).getByRole( 'button', { name: 'Reset' }).click();

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
