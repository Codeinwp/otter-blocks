/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import {
	getNestedBlockByName,
	insertBlockBySlash,
	openSettingsSidebar,
	switchEditorView
} from '../helpers/editor';

const COLUMN_BLOCK = 'themeisle-blocks/advanced-column';

test.describe( 'Section column responsive attributes', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'stores per-device padding using core/editor device type', async({ editor, page }) => {
		await insertBlockBySlash({
			editor,
			page,
			shortcut: '/section',
			blockName: 'themeisle-blocks/advanced-columns'
		});

		await editor.canvas.getByRole( 'button', { name: 'Single column' }).click();
		await page.getByRole( 'button', { name: 'Document Overview' }).click();
		await page.getByRole( 'link', { name: 'Section Column', exact: true }).click();
		await openSettingsSidebar( page );
		await page.locator( '.o-inspector-header' ).getByRole( 'button', { name: 'Style' }).click();

		const setPadding = async( value ) => {
			const padding = page.getByLabel( 'Padding' ).getByRole( 'textbox', { name: 'All sides' });
			await page.getByLabel( 'Padding' ).getByRole( 'slider', { name: 'All sides' }).fill( String( value ) );
			await expect( padding ).toHaveValue( String( value ) );
		};

		await setPadding( 20 );

		let column = await getNestedBlockByName( editor, COLUMN_BLOCK );
		expect( column.attributes.padding?.top ).toMatch( /20/ );
		expect( column.attributes.paddingTablet ).toBeUndefined();

		await switchEditorView( page, 'Tablet' );
		await setPadding( 30 );

		column = await getNestedBlockByName( editor, COLUMN_BLOCK );
		expect( column.attributes.padding?.top ).toMatch( /20/ );
		expect( column.attributes.paddingTablet?.top ).toMatch( /30/ );
		expect( column.attributes.paddingMobile ).toBeUndefined();

		await switchEditorView( page, 'Mobile' );
		await setPadding( 10 );

		column = await getNestedBlockByName( editor, COLUMN_BLOCK );
		expect( column.attributes.padding?.top ).toMatch( /20/ );
		expect( column.attributes.paddingTablet?.top ).toMatch( /30/ );
		expect( column.attributes.paddingMobile?.top ).toMatch( /10/ );
	});
});
