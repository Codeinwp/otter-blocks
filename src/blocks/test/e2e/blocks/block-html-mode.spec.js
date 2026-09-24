/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Blocks whose visible content is stored in comment attributes: the edited
 * markup is read back into them, so the block stays valid.
 */
const EDITABLE = [
	{
		target: 'themeisle-blocks/countdown',
		block: { name: 'themeisle-blocks/countdown', attributes: { date: '2026-10-01T10:00:00' }},
		edits: [[ 'data-date="2026-10-01T10:00:00"', 'data-date="2026-12-25T10:00:00"' ]],
		expected: { date: '2026-12-25T10:00:00' }
	},
	{
		target: 'themeisle-blocks/progress-bar',
		block: { name: 'themeisle-blocks/progress-bar' },
		edits: [[ 'data-percent="50"', 'data-percent="80"' ], [ '>50%<', '>80%<' ], [ '<span>Skill</span>', '<span>Design</span>' ]],
		expected: { percentage: 80, title: 'Design' }
	},
	{
		target: 'themeisle-blocks/circle-counter',
		block: { name: 'themeisle-blocks/circle-counter' },
		edits: [[ 'data-percentage="50"', 'data-percentage="65"' ], [ '>Skill<', '>Speed<' ]],
		expected: { percentage: 65, title: 'Speed' }
	},
	{
		target: 'themeisle-blocks/icon-list-item',
		block: {
			name: 'themeisle-blocks/icon-list',
			innerBlocks: [{ name: 'themeisle-blocks/icon-list-item', attributes: { content: 'Entry' }}]
		},
		edits: [[ '>Entry<', '>Entry <strong>two</strong><' ]],
		expected: { content: 'Entry <strong>two</strong>' }
	},
	{
		target: 'themeisle-blocks/form-input',
		block: {
			name: 'themeisle-blocks/form',
			innerBlocks: [{ name: 'themeisle-blocks/form-input', attributes: { label: 'Name', placeholder: 'Jane' }}]
		},
		edits: [[ '>Name<', '>Full name<' ], [ 'placeholder="Jane"', 'placeholder="John"' ]],
		expected: { label: 'Full name', placeholder: 'John' }
	},
	{
		target: 'themeisle-blocks/form-textarea',
		block: {
			name: 'themeisle-blocks/form',
			innerBlocks: [{ name: 'themeisle-blocks/form-textarea', attributes: { label: 'Message', placeholder: 'Type' }}]
		},
		edits: [[ '>Message<', '>Comment<' ], [ 'placeholder="Type"', 'placeholder="Write"' ]],
		expected: { label: 'Comment', placeholder: 'Write' }
	}
];

// Gutenberg validates the HTML mode without inner blocks, so these cannot offer it.
const WITHOUT_HTML_MODE = [
	{ target: 'themeisle-blocks/flip', block: { name: 'themeisle-blocks/flip' }},
	{
		target: 'themeisle-blocks/accordion-item',
		block: {
			name: 'themeisle-blocks/accordion',
			innerBlocks: [{ name: 'themeisle-blocks/accordion-item', attributes: { title: 'Question' }}]
		}
	},
	{
		target: 'themeisle-blocks/tabs-item',
		block: {
			name: 'themeisle-blocks/tabs',
			innerBlocks: [{ name: 'themeisle-blocks/tabs-item', attributes: { title: 'Tab' }}]
		}
	}
];

// Content is sourced from the markup, so HTML edits round-trip.
const WITH_HTML_MODE = [
	{ target: 'themeisle-blocks/advanced-heading', block: { name: 'themeisle-blocks/advanced-heading', attributes: { content: 'Heading' }}},
	{
		target: 'themeisle-blocks/button',
		block: {
			name: 'themeisle-blocks/button-group',
			innerBlocks: [{ name: 'themeisle-blocks/button', attributes: { text: 'Click' }}]
		}
	}
];

/**
 * Select the first block with the given name.
 *
 * @param {Object} page      The page fixture.
 * @param {string} blockName The block to select.
 */
const selectBlockByName = async( page, blockName ) => {
	await page.evaluate( ( name ) => {
		const { select, dispatch } = window.wp.data;
		const find = ( blocks ) => {
			for ( const block of blocks ) {
				if ( name === block.name ) {
					return block;
				}

				const inner = find( block.innerBlocks );

				if ( inner ) {
					return inner;
				}
			}
		};

		dispatch( 'core/block-editor' ).selectBlock( find( select( 'core/block-editor' ).getBlocks() ).clientId );
	}, blockName );
};

/**
 * Select the first block with the given name and report whether its Options menu offers "Edit as HTML".
 *
 * @param {Object} editor    The editor fixture.
 * @param {Object} page      The page fixture.
 * @param {string} blockName The block to select.
 * @return {Promise<boolean>} Whether the menu item is present.
 */
const hasEditAsHTML = async( editor, page, blockName ) => {
	await selectBlockByName( page, blockName );
	await editor.clickBlockToolbarButton( 'Options' );

	const menu = page.getByRole( 'menu', { name: 'Options' });
	await expect( menu.getByRole( 'menuitem' ).first() ).toBeVisible();

	return 0 < await menu.getByRole( 'menuitem', { name: 'Edit as HTML' }).count();
};

test.describe( 'Edit as HTML mode', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	for ( const { target, block, edits, expected } of EDITABLE ) {
		test( `${ target } keeps an Edit as HTML change`, async({ editor, page }) => {
			await editor.insertBlock( block );
			await selectBlockByName( page, target );
			await editor.clickBlockOptionsMenuItem( 'Edit as HTML' );

			const textarea = editor.canvas.locator( '.block-editor-block-list__block-html-textarea' );
			let html = await textarea.inputValue();

			for ( const [ from, to ] of edits ) {
				expect( html ).toContain( from );
				html = html.replace( from, to );
			}

			await textarea.fill( html );
			await textarea.blur();

			const result = await page.evaluate( () => {
				const { isValid, attributes } = window.wp.data.select( 'core/block-editor' ).getSelectedBlock();

				return { isValid, attributes };
			});

			expect( result.isValid ).toBe( true );
			expect( result.attributes ).toMatchObject( expected );

			// Stored in the block comment, where the server reads it.
			const commentAttributes = await page.evaluate( ( name ) => {
				const content = window.wp.data.select( 'core/editor' ).getEditedPostContent();
				const match = content.match( new RegExp( `<!-- wp:${ name } (\\{.*?\\}) -->` ) );

				return match ? JSON.parse( match[1]) : null;
			}, target );

			expect( commentAttributes ).toMatchObject( expected );
		});
	}

	for ( const { target, block } of WITHOUT_HTML_MODE ) {
		test( `${ target } does not offer Edit as HTML`, async({ editor, page }) => {
			await editor.insertBlock( block );

			expect( await hasEditAsHTML( editor, page, target ) ).toBe( false );
		});
	}

	for ( const { target, block } of WITH_HTML_MODE ) {
		test( `${ target } still offers Edit as HTML`, async({ editor, page }) => {
			await editor.insertBlock( block );

			expect( await hasEditAsHTML( editor, page, target ) ).toBe( true );
		});
	}
});
