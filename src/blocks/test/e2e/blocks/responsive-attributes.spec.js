/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import { expectBlockByName } from '../helpers/editor';

const BLOCK_NAME = 'themeisle-blocks/advanced-heading';

async function openSettingsSidebar( page ) {
	const settings = page.getByRole( 'button', { name: 'Settings', exact: true }).first();
	const className = await settings.getAttribute( 'class' );

	if ( ! className?.includes( 'is-pressed' ) ) {
		await settings.click();
	}
}

async function switchEditorView( page, view ) {
	await page.getByRole( 'button', { name: 'View', exact: true }).click();
	await page.getByRole( 'menuitemradio', { name: view }).click();
}

test.describe( 'Responsive attributes hook', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'stores per-device align without unstable useSelect warnings', async({ editor, page }) => {
		const unstableSelectWarnings = [];

		page.on( 'console', ( message ) => {
			const text = message.text();

			if (
				text.includes( 'useSelect' )
				&& text.includes( 'responsiveSetAttributes' )
			) {
				unstableSelectWarnings.push( text );
			}
		} );

		await editor.insertBlock({ name: BLOCK_NAME });

		await editor.canvas.getByRole( 'document', { name: 'Block: Advanced Heading' }).click();
		await openSettingsSidebar( page );

		await page.getByRole( 'button', { name: 'Right' }).click();

		let block = await expectBlockByName( editor, BLOCK_NAME );
		expect( block.attributes.align ).toBe( 'right' );
		expect( block.attributes.alignTablet ).toBeUndefined();
		expect( block.attributes.alignMobile ).toBeUndefined();

		await switchEditorView( page, 'Tablet' );
		await page.getByRole( 'button', { name: 'Center' }).click();

		block = await expectBlockByName( editor, BLOCK_NAME );
		expect( block.attributes.align ).toBe( 'right' );
		expect( block.attributes.alignTablet ).toBe( 'center' );
		expect( block.attributes.alignMobile ).toBeUndefined();

		await switchEditorView( page, 'Mobile' );
		await page.getByRole( 'button', { name: 'Left' }).click();

		block = await expectBlockByName( editor, BLOCK_NAME );
		expect( block.attributes.align ).toBe( 'right' );
		expect( block.attributes.alignTablet ).toBe( 'center' );
		expect( block.attributes.alignMobile ).toBe( 'left' );

		expect( unstableSelectWarnings ).toEqual([]);
	});
});
