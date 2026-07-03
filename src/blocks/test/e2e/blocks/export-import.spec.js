/**
 * External dependencies
 */
import fs from 'fs';

/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import { expectBlockByName } from '../helpers/editor';

const PROGRESS_BAR = 'themeisle-blocks/progress-bar';

test.describe( 'Blocks Export Import', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	// Guards the exporter menu item and the importer's FormFileUpload
	// (__next40pxDefaultSize migration): a block exported as JSON must
	// re-import as the same block with its attributes intact.
	test( 'exports a block as JSON and re-imports it', async({ editor, page }) => {
		await editor.insertBlock({
			name: PROGRESS_BAR,
			attributes: { title: 'Export Roundtrip' }
		});
		await expectBlockByName( editor, PROGRESS_BAR );

		const downloadPromise = page.waitForEvent( 'download' );
		await editor.clickBlockOptionsMenuItem( 'Export as JSON' );
		const download = await downloadPromise;
		const buffer = fs.readFileSync( await download.path() );

		await editor.insertBlock({ name: 'themeisle-blocks/importer' });
		await editor.canvas.locator( 'input[type="file"]' ).setInputFiles({
			name: 'blocks-export.json',
			mimeType: 'application/json',
			buffer
		});

		// The importer replaces itself with the parsed block.
		await expect.poll( async() => {
			const blocks = await editor.getBlocks();
			return blocks.filter( ( b ) => PROGRESS_BAR === b.name ).length;
		}).toBe( 2 );

		const blocks = await editor.getBlocks();
		expect( blocks.some( ( b ) => 'themeisle-blocks/importer' === b.name ) ).toBe( false );

		const imported = blocks.filter( ( b ) => PROGRESS_BAR === b.name ).pop();
		expect( imported.attributes.title ).toBe( 'Export Roundtrip' );
	});
});
