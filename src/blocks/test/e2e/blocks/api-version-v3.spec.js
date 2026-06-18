/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import {
	expectFormVariationIconsVisible,
	expectIframedEditorCanvas,
	expectLeafletMapsRendered,
	insertEmptyFormBlock,
	insertLeafletMaps
} from '../helpers/canvas';
import { insertContactForm } from '../helpers/forms';
import { expectBlockByName } from '../helpers/editor';

test.describe( 'Block API v3 editor canvas', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	test( 'uses the iframed editor canvas', async({ page }) => {
		await expectIframedEditorCanvas( page );
	});

	test( 'renders form variation icons inside the canvas iframe', async({ editor }) => {
		await insertEmptyFormBlock( editor );
		await expectFormVariationIconsVisible( editor );

		await expect(
			editor.canvas.getByRole( 'button', { name: 'Contact form for clients' } )
		).toBeVisible();
		await expect(
			editor.canvas.getByRole( 'button', { name: 'Add the clients to your subscription list' } )
		).toBeVisible();
	});

	test( 'can select a form variation after icons render', async({ editor, page }) => {
		await insertContactForm({ editor, page });

		const formBlock = await expectBlockByName( editor, 'themeisle-blocks/form' );

		expect( formBlock.innerBlocks.length ).toBeGreaterThan( 0 );
	});

	test( 'renders every Leaflet map block inserted on the same post', async({ editor }) => {
		await insertLeafletMaps( editor, 2 );
		await expectLeafletMapsRendered( editor, 2 );
	});
});
