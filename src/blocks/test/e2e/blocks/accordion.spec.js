/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import { expectBlockByName, insertBlockBySlash, publishAndViewPost } from '../helpers/editor';

test.describe( 'Accordion Block', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'can be created by typing "/faq"', async({ editor, page }) => {

		// WP 7.0 introduced core/accordion, which collides with themeisle-blocks/accordion
		// when typing "/accordion". The Otter accordion uniquely matches the "faq" keyword.
		await insertBlockBySlash({
			editor,
			page,
			shortcut: '/faq',
			blockName: 'themeisle-blocks/accordion'
		});
	});


	test( 'check if it has content by default', async({ editor }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/accordion'
		});

		const accordionBlock = await expectBlockByName( editor, 'themeisle-blocks/accordion' );

		expect( accordionBlock.innerBlocks.length ).toBeGreaterThan( 0 );
	});

	test( 'add new item via button', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/accordion'
		});

		let accordionBlock = await expectBlockByName( editor, 'themeisle-blocks/accordion' );

		const currentAccordionItems = accordionBlock.innerBlocks.length;

		await page.getByRole( 'button', { name: 'Add Accordion Item' }).click();

		accordionBlock = await expectBlockByName( editor, 'themeisle-blocks/accordion' );

		expect( accordionBlock.innerBlocks.length ).toBeGreaterThan( currentAccordionItems );
	});

	test( 'show/hide with default content', async({ editor, page }) => {
		await editor.insertBlock({
			name: 'themeisle-blocks/accordion'
		});

		const accordionBlock = await expectBlockByName( editor, 'themeisle-blocks/accordion' );

		expect( accordionBlock.innerBlocks.length ).toBeGreaterThan( 0 );

		await publishAndViewPost({ editor, page });

		// No tabs should be opened by default
		await expect( page.getByRole( 'paragraph' ).filter({ hasText: 'This is a placeholder tab content. It is important to have the necessary informa' }) ).toBeHidden();

		// Open the first tab
		await page.locator( 'summary' ).filter({ hasText: 'Accordion title 1' }).click();

		await expect( page.getByRole( 'paragraph' ).filter({ hasText: 'This is a placeholder tab content. It is important to have the necessary informa' }) ).toBeVisible();

		// Close the first tab
		await page.locator( 'summary' ).filter({ hasText: 'Accordion title 1' }).click();

		await expect( page.getByRole( 'paragraph' ).filter({ hasText: 'This is a placeholder tab content. It is important to have the necessary informa' }) ).toBeHidden();
	});
});
