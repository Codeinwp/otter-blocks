/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import { expectBlockByName } from '../helpers/editor';

const ITEM = 'themeisle-blocks/icon-list-item';

test.describe( 'Icon List', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	// Guards the migration from RichText `onSplit` to block.json `supports.splitting`:
	// pressing Enter mid-text must split the item into two items OF THE SAME TYPE,
	// with the content divided at the caret. Converting the tail to core/paragraph,
	// or not splitting at all, must fail this test.
	test( 'splits an item into two icon-list items on Enter', async({ editor, page }) => {
		await editor.insertBlock({ name: 'themeisle-blocks/icon-list' });
		await expectBlockByName( editor, 'themeisle-blocks/icon-list' );

		const blocks = await editor.getBlocks();
		const before = blocks.find( ( b ) => 'themeisle-blocks/icon-list' === b.name )?.innerBlocks ?? [];
		expect( before.length ).toBe( 3 );

		// Place the caret inside the first item's editable text, then replace it with
		// a known value. Clicking the text (not the block container) enters edit mode.
		await editor.canvas.getByText( 'List item 1' ).click();
		await page.keyboard.press( 'ControlOrMeta+a' );
		await page.keyboard.type( 'AAABBB' );

		// Move the caret between "AAA" and "BBB", then split.
		await page.keyboard.press( 'ArrowLeft' );
		await page.keyboard.press( 'ArrowLeft' );
		await page.keyboard.press( 'ArrowLeft' );
		await page.keyboard.press( 'Enter' );

		const afterBlocks = await editor.getBlocks();
		const after = afterBlocks.find( ( b ) => 'themeisle-blocks/icon-list' === b.name )?.innerBlocks ?? [];
		expect( after.length ).toBe( 4 );

		// Every child must remain an icon-list item (not converted to a paragraph).
		expect( after.every( ( b ) => ITEM === b.name ) ).toBe( true );

		// The split divided the content at the caret.
		expect( after[ 0 ].attributes.content ).toBe( 'AAA' );
		expect( after[ 1 ].attributes.content ).toBe( 'BBB' );
	});
});
