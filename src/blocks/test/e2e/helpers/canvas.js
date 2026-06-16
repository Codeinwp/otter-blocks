/**
 * WordPress dependencies
 */
import { expect } from '@wordpress/e2e-test-utils-playwright';

const LEAFLET_MAP_BLOCK = 'themeisle-blocks/leaflet-map';
const FORM_BLOCK = 'themeisle-blocks/form';

/**
 * Assert the editor is using the iframed canvas introduced with block API v3.
 *
 * @param {import('@playwright/test').Page} page Editor page.
 */
export async function expectIframedEditorCanvas( page ) {
	await expect( page.locator( 'iframe[name^="editor-canvas"]' ) ).toBeVisible();
}

/**
 * Assert the Otter icon gradient exists inside the editor canvas document.
 *
 * @param {import('@wordpress/e2e-test-utils-playwright').Editor} editor Editor fixture.
 */
export async function expectIconGradientInCanvas( editor ) {
	await expect( editor.canvas.locator( '#o-icon-fill' ) ).toHaveCount( 1 );
}

/**
 * Insert an empty form block and open the variation picker.
 *
 * @param {import('@wordpress/e2e-test-utils-playwright').Editor} editor Editor fixture.
 */
export async function insertEmptyFormBlock( editor ) {
	await editor.insertBlock({ name: FORM_BLOCK });
	await expectBlockVariationPicker( editor );
}

/**
 * Assert the form variation picker is visible in the canvas.
 *
 * @param {import('@wordpress/e2e-test-utils-playwright').Editor} editor Editor fixture.
 */
export async function expectBlockVariationPicker( editor ) {
	await expect(
		editor.canvas.locator( '.block-editor-block-variation-picker' )
	).toBeVisible();
}

/**
 * Assert form variation icons render with the shared Otter gradient fill.
 *
 * @param {import('@wordpress/e2e-test-utils-playwright').Editor} editor Editor fixture.
 */
export async function expectFormVariationIconsVisible( editor ) {
	await expectIconGradientInCanvas( editor );

	const icons = editor.canvas.locator(
		'.block-editor-block-variation-picker svg.o-block-icon'
	);

	await expect( icons.first() ).toBeVisible();
	expect( await icons.count() ).toBeGreaterThan( 0 );

	const gradientInSameDocument = await icons.first().evaluate( ( icon ) =>
		Boolean( icon.ownerDocument.querySelector( '#o-icon-fill' ) )
	);

	expect( gradientInSameDocument ).toBe( true );

	const fills = await icons.evaluateAll( ( nodes ) =>
		nodes.map( ( node ) => window.getComputedStyle( node ).fill )
	);

	expect(
		fills.every( ( fill ) => fill.includes( 'o-icon-fill' ) || fill.includes( 'url(' ) )
	).toBe( true );
}

/**
 * Insert multiple Leaflet map blocks and wait for them to initialise in the editor.
 *
 * @param {import('@wordpress/e2e-test-utils-playwright').Editor} editor Editor fixture.
 * @param {number}                                                count  Number of map blocks to insert.
 */
export async function insertLeafletMaps( editor, count = 2 ) {
	const locations = [
		{
			location: 'Barcelona, Spain',
			latitude: '41.4034789',
			longitude: '2.174410333009705'
		},
		{
			location: 'Paris, France',
			latitude: '48.8566',
			longitude: '2.3522'
		}
	];

	for ( let index = 0; index < count; index++ ) {
		await editor.insertBlock({
			name: LEAFLET_MAP_BLOCK,
			attributes: locations[ index ] ?? locations[ 0 ]
		});

		await expect(
			editor.canvas.locator( '.leaflet-container' )
		).toHaveCount( index + 1, { timeout: 20_000 } );
	}
}

/**
 * Assert all inserted Leaflet maps rendered interactive tiles in the editor canvas.
 *
 * @param {import('@wordpress/e2e-test-utils-playwright').Editor} editor        Editor fixture.
 * @param {number}                                                expectedCount Expected number of map instances.
 */
export async function expectLeafletMapsRendered( editor, expectedCount ) {
	const mapContainers = editor.canvas.locator( '.leaflet-container' );

	await expect( mapContainers ).toHaveCount( expectedCount, { timeout: 20_000 } );
	await expect(
		editor.canvas.getByRole( 'button', { name: 'Zoom in' } )
	).toHaveCount( expectedCount );

	for ( let index = 0; index < expectedCount; index++ ) {
		await expect(
			mapContainers.nth( index ).locator( '.leaflet-tile-pane img' ).first()
		).toBeVisible({ timeout: 20_000 });
	}
}
