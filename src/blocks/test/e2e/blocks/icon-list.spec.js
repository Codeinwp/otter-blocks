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

	// Issue #3132: a sub-list inserted in an item must be a real Icon List that
	// inherits the icon defaults of the list it sits in, so nesting keeps the
	// look of the parent without extra configuration.
	test( 'adds a sub-list to an item, inheriting the parent list defaults', async({ editor }) => {
		await editor.insertBlock({ name: 'themeisle-blocks/icon-list', attributes: { defaultIcon: 'star' }});

		await editor.canvas.getByText( 'List item 1' ).click();
		await editor.canvas.getByRole( 'button', { name: 'Add Sub-list' } ).click();

		const blocks = await editor.getBlocks();
		const list = blocks.find( ( b ) => 'themeisle-blocks/icon-list' === b.name );
		const item = list.innerBlocks[ 0 ];

		expect( item.innerBlocks.length ).toBe( 1 );

		const subList = item.innerBlocks[ 0 ];
		expect( subList.name ).toBe( 'themeisle-blocks/icon-list' );
		expect( subList.attributes.defaultIcon ).toBe( 'star' );

		// The sub-list behaves like any Icon List: its InnerBlocks template fills in.
		expect( subList.innerBlocks.length ).toBe( 3 );
	});

	// The indent reaches nested lists through CSS inheritance from the parent
	// list, so it updates live and is not a copy frozen at creation time.
	test( 'applies the parent sub-list indent to nested lists', async({ editor, page }) => {
		await editor.insertBlock({ name: 'themeisle-blocks/icon-list', attributes: { sublistIndent: 64 }});

		await editor.canvas.getByText( 'List item 1' ).click();
		await editor.canvas.getByRole( 'button', { name: 'Add Sub-list' } ).click();

		const nestedList = editor.canvas.locator( '.wp-block-themeisle-blocks-icon-list .wp-block-themeisle-blocks-icon-list-item .wp-block-themeisle-blocks-icon-list' ).first();
		await expect( nestedList ).toHaveCSS( 'padding-inline-start', '64px' );

		// Moving the parent's control must move the existing sub-list.
		await page.evaluate( () => {
			const { getBlocks } = window.wp.data.select( 'core/block-editor' );
			const { updateBlockAttributes } = window.wp.data.dispatch( 'core/block-editor' );
			const list = getBlocks().find( ( block ) => 'themeisle-blocks/icon-list' === block.name );
			updateBlockAttributes( list.clientId, { sublistIndent: 80 } );
		});

		await expect( nestedList ).toHaveCSS( 'padding-inline-start', '80px' );
	});

	test( 'keeps the default sub-list indent when unset', async({ editor }) => {
		await editor.insertBlock({ name: 'themeisle-blocks/icon-list' });

		await editor.canvas.getByText( 'List item 1' ).click();
		await editor.canvas.getByRole( 'button', { name: 'Add Sub-list' } ).click();

		const nestedList = editor.canvas.locator( '.wp-block-themeisle-blocks-icon-list .wp-block-themeisle-blocks-icon-list-item .wp-block-themeisle-blocks-icon-list' ).first();
		await expect( nestedList ).toHaveCSS( 'padding-inline-start', '32px' );
	});

	test( 'serializes sub-lists inside items with list roles', async({ editor }) => {
		await editor.insertBlock({ name: 'themeisle-blocks/icon-list' });

		await editor.canvas.getByText( 'List item 2' ).click();
		await editor.canvas.getByRole( 'button', { name: 'Add Sub-list' } ).click();

		const content = await editor.getEditedPostContent();

		expect( content ).toContain( 'has-sublist' );
		expect( content ).toMatch( /<div[^>]+role="list"/ );
		expect( content ).toMatch( /<div[^>]+role="listitem"/ );

		// The nested block delimiter belongs to the sub-list. The trailing space
		// keeps item delimiters out of the count.
		expect( content.split( '<!-- wp:themeisle-blocks/icon-list ' ).length - 1 ).toBe( 2 );
	});

	// Markup saved before sub-list support must stay valid: items without a
	// sub-list serialize the same and the older saves ride along as deprecations.
	// The image item covers the empty alt attribute of the previous release.
	test( 'renders pre-nesting content without invalid block warnings', async({ editor, page }) => {
		const markup = [
			'<!-- wp:themeisle-blocks/icon-list {"id":"wp-block-themeisle-blocks-icon-list-nestingbc"} -->',
			'<div class="wp-block-themeisle-blocks-icon-list" id="wp-block-themeisle-blocks-icon-list-nestingbc"><!-- wp:themeisle-blocks/icon-list-item {"id":"wp-block-themeisle-blocks-icon-list-item-nestingbcitem","library":"fontawesome","iconPrefix":"fas","icon":"check","content":"Flat item"} -->',
			'<div class="wp-block-themeisle-blocks-icon-list-item" id="wp-block-themeisle-blocks-icon-list-item-nestingbcitem"><i class="fas fa-check wp-block-themeisle-blocks-icon-list-item-icon"></i><p class="wp-block-themeisle-blocks-icon-list-item-content">Flat item</p></div>',
			'<!-- /wp:themeisle-blocks/icon-list-item -->',
			'<!-- wp:themeisle-blocks/icon-list-item {"id":"wp-block-themeisle-blocks-icon-list-item-nestingbcimg","library":"image","icon":"https://example.com/icon.png","content":"Image item"} -->',
			'<div class="wp-block-themeisle-blocks-icon-list-item" id="wp-block-themeisle-blocks-icon-list-item-nestingbcimg"><img src="https://example.com/icon.png" alt="" /><p class="wp-block-themeisle-blocks-icon-list-item-content">Image item</p></div>',
			'<!-- /wp:themeisle-blocks/icon-list-item --></div>',
			'<!-- /wp:themeisle-blocks/icon-list -->'
		].join( '\n' );

		await page.evaluate( content => window.wp.data.dispatch( 'core/editor' ).editPost( { content } ), markup );

		const blocks = await editor.getBlocks();
		expect( blocks.map( ( b ) => b.name ) ).toContain( 'themeisle-blocks/icon-list' );

		await expect( editor.canvas.locator( '.block-editor-warning' ) ).toHaveCount( 0);
		await expect( editor.canvas.getByText( 'Flat item' ) ).toBeVisible();
		await expect( editor.canvas.getByText( 'Image item' ) ).toBeVisible();
	});
});
