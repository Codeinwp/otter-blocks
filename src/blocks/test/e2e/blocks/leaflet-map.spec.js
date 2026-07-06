/**
 * Internal dependencies
 */
import { test, expect } from '../fixtures';
import { publishAndViewPost, waitForEditorReady } from '../helpers/editor';

const LEAFLET_MAP_BLOCK = 'themeisle-blocks/leaflet-map';

// Path fragment of the bundled default marker icon. The original bug shipped a
// broken/duplicated marker because this asset was never resolved; asserting the
// `src` resolves here is the regression guard.
const MARKER_ICON = /\/leaflet\/images\/marker-icon\.png/;

// 1x1 transparent PNG used to fulfil OpenStreetMap tile requests so map
// initialisation never depends on the network.
const TILE_PNG = Buffer.from(
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQAYIqfQAAAAAElFTkSuQmCC',
	'base64'
);

const marker = ( overrides = {}) => ({
	id: 'marker-1',
	latitude: 41.4034789,
	longitude: 2.174410333009705,
	title: 'Sagrada Familia',
	description: 'A famous basilica',
	location: 'Barcelona, Spain',
	...overrides
});

const insertMap = async( editor, attributes ) =>
	editor.insertBlock({ name: LEAFLET_MAP_BLOCK, attributes });

const getMapAttributes = async( editor ) => {
	const blocks = await editor.getBlocks();
	return blocks.find( ( block ) => LEAFLET_MAP_BLOCK === block.name ).attributes;
};

test.describe( 'Maps (Leaflet) block', () => {
	test.beforeEach( async({ page, admin }) => {
		await page.route( '**/*.tile.openstreetmap.org/**', ( route ) =>
			route.fulfill({ contentType: 'image/png', body: TILE_PNG })
		);

		await admin.createNewPost();
		await waitForEditorReady( page );
	});

	test( 'renders a marker with the bundled icon and no duplicates', async({ editor }) => {
		await insertMap( editor, { markers: [ marker() ] });

		const icons = editor.canvas.locator( '.leaflet-marker-icon' );
		await expect( icons ).toHaveCount( 1, { timeout: 20_000 });
		await expect( icons.first() ).toHaveAttribute( 'src', MARKER_ICON );
		await expect( editor.canvas.locator( '.block-editor-warning' ) ).toHaveCount( 0 );
	});

	test( 'add-marker control drops a marker where the map is clicked', async({ editor, page }) => {
		await insertMap( editor, { markers: [] });

		const container = editor.canvas.locator( '.leaflet-container' );
		await expect( container ).toBeVisible({ timeout: 20_000 });
		await expect( editor.canvas.locator( '.leaflet-marker-icon' ) ).toHaveCount( 0 );

		await editor.canvas.locator( '.wp-block-themeisle-blocks-leaflet-map-marker-button' ).click();

		// Click the centre of the map, clear of the zoom and add-marker controls.
		const box = await container.boundingBox();
		await page.mouse.click( box.x + box.width / 2, box.y + box.height / 2 );

		await expect( editor.canvas.locator( '.leaflet-marker-icon' ) ).toHaveCount( 1, { timeout: 10_000 });
		await expect
			.poll( async() => ( await getMapAttributes( editor ) ).markers.length )
			.toBe( 1 );
	});

	test( 'markers are draggable in the editor', async({ editor }) => {
		await insertMap( editor, { markers: [ marker() ] });

		// Leaflet adds this class only when the marker is created with draggable:true.
		// Paired with the persistence test below, this guards both halves of
		// drag-to-refine (the gesture itself can't be simulated headlessly).
		const icon = editor.canvas.locator( '.leaflet-marker-icon' ).first();
		await expect( icon ).toBeVisible({ timeout: 20_000 });
		await expect( icon ).toHaveClass( /leaflet-marker-draggable/ );
	});

	test( 'the map initialises promptly after Leaflet loads', async({ editor, page }) => {
		await insertMap( editor, { markers: [] });
		await editor.canvas.locator( '.leaflet-container' ).waitFor({ timeout: 20_000 });

		// Delay Leaflet so it becomes available well after DOMReady; the init poll
		// interval then dominates the gap between "Leaflet ready" and "map created".
		// The old 2s poll blows past the threshold here; the 100ms poll stays under it.
		await page.route( '**/assets/leaflet/leaflet.js', async( route ) => {
			await new Promise( ( resolve ) => setTimeout( resolve, 300 ) );
			await route.continue();
		});

		// Stamp, before any page script runs, when window.L appears and when the
		// placeholder becomes a Leaflet container.
		await page.addInitScript( () => {
			window.__mapTiming = {};
			const iv = setInterval( () => {
				if ( window.L && undefined === window.__mapTiming.leaflet ) {
					window.__mapTiming.leaflet = performance.now();
				}
				const el = document.querySelector( '.wp-block-themeisle-blocks-leaflet-map.leaflet-container' );
				if ( el && undefined === window.__mapTiming.map ) {
					window.__mapTiming.map = performance.now();
					clearInterval( iv );
				}
			}, 10 );
		});

		await publishAndViewPost({ editor, page });

		const gap = await page
			.waitForFunction( () => {
				const t = window.__mapTiming;
				return t && undefined !== t.leaflet && undefined !== t.map ? t.map - t.leaflet : false;
			}, { timeout: 20_000 })
			.then( ( handle ) => handle.jsonValue() );

		expect( gap ).toBeLessThan( 1000 );
	});

	// Editing a marker's coordinates persists. This exercises the same UPDATE →
	// reducer → setAttributes path a drag-to-refine uses; before the fix it only
	// persisted on marker count changes, so edits (and drags) were silently lost.
	// The literal drag gesture is verified manually — a headless Leaflet marker
	// drag inside the iframed editor does not fire `moveend` reliably.
	test( 'editing a marker position in the inspector persists the change', async({ editor, page }) => {
		await insertMap( editor, { markers: [ marker() ] });

		// The persistence effect only runs once the map owns the markers store.
		await editor.canvas.locator( '.leaflet-container' ).waitFor({ timeout: 20_000 });

		await page.getByRole( 'button', { name: 'Markers' }).click();
		await page.locator( '.wp-block-themeisle-blocks-leaflet-map-marker-title' ).first().click();

		const markerArea = page.locator( '.wp-block-themeisle-blocks-leaflet-map-marker-control-area' );
		await markerArea.getByLabel( 'Latitude' ).fill( '41.5' );

		await expect
			.poll( async() => ( await getMapAttributes( editor ) ).markers[ 0 ].latitude, { timeout: 10_000 })
			.toBe( '41.5' );
	});

	test( 'published map renders every marker with the bundled icon', async({ editor, page }) => {
		await insertMap( editor, {
			markers: [
				marker({ id: 'm1' }),
				marker({ id: 'm2', latitude: 41.4045, longitude: 2.176, title: 'Second' })
			]
		});
		await editor.canvas.locator( '.leaflet-marker-icon' ).first().waitFor({ timeout: 20_000 });

		await publishAndViewPost({ editor, page });

		const icons = page.locator( '.leaflet-marker-icon' );
		await expect( icons ).toHaveCount( 2, { timeout: 20_000 });
		await expect( icons.first() ).toHaveAttribute( 'src', MARKER_ICON );

		// naturalWidth > 0 proves the icon loaded rather than showing a broken-image placeholder.
		await expect
			.poll( () => icons.first().evaluate( ( img ) => img.naturalWidth ) )
			.toBeGreaterThan( 0 );
	});

	test( 'published marker with content opens a single popup on click', async({ editor, page }) => {
		await insertMap( editor, { markers: [ marker() ] });
		await editor.canvas.locator( '.leaflet-marker-icon' ).first().waitFor({ timeout: 20_000 });

		await publishAndViewPost({ editor, page });

		await page.locator( '.leaflet-marker-icon' ).first().click();
		await expect(
			page.locator( '.leaflet-popup .wp-block-themeisle-blocks-leaflet-map-overview-title' )
		).toHaveText( 'Sagrada Familia' );
	});

	test( 'published marker without title or description shows no popup', async({ editor, page }) => {
		await insertMap( editor, { markers: [ marker({ title: '', description: '' }) ] });
		await editor.canvas.locator( '.leaflet-marker-icon' ).first().waitFor({ timeout: 20_000 });

		await publishAndViewPost({ editor, page });

		await page.locator( '.leaflet-marker-icon' ).first().click();

		// Give Leaflet a beat to open a popup, were one (incorrectly) bound.
		await page.waitForTimeout( 500 );
		await expect( page.locator( '.leaflet-popup' ) ).toHaveCount( 0 );
	});

	test( 'scroll-to-zoom off disables gesture handling on the published map', async({ editor, page }) => {
		await insertMap( editor, { markers: [], scrollZoom: false });
		await editor.canvas.locator( '.leaflet-container' ).waitFor({ timeout: 20_000 });

		await publishAndViewPost({ editor, page });

		const container = page.locator( '.leaflet-container' );
		await expect( container ).toBeVisible({ timeout: 20_000 });

		// The gesture-handling plugin stamps this attribute only while active; it
		// is gone when scroll zoom (and thus gesture handling) is turned off.
		await expect
			.poll( () => container.evaluate( ( el ) => el.hasAttribute( 'data-gesture-handling-scroll-content' ) ) )
			.toBe( false );
	});

	test( 'hover tooltip appears on the published map only when enabled', async({ editor, page }) => {
		await insertMap( editor, { markers: [ marker() ], showMarkerTooltip: true });
		await editor.canvas.locator( '.leaflet-marker-icon' ).first().waitFor({ timeout: 20_000 });

		await publishAndViewPost({ editor, page });

		await page.locator( '.leaflet-marker-icon' ).first().hover();
		await expect( page.locator( '.leaflet-tooltip' ) ).toHaveText( 'Sagrada Familia', { timeout: 10_000 });
	});

	test( 'hover shows no tooltip when the tooltip toggle is off (default)', async({ editor, page }) => {
		await insertMap( editor, { markers: [ marker() ] });
		await editor.canvas.locator( '.leaflet-marker-icon' ).first().waitFor({ timeout: 20_000 });

		await publishAndViewPost({ editor, page });

		await page.locator( '.leaflet-marker-icon' ).first().hover();

		// Give Leaflet a beat to open a tooltip, were one (incorrectly) bound.
		await page.waitForTimeout( 400 );
		await expect( page.locator( '.leaflet-tooltip' ) ).toHaveCount( 0 );
	});

	test( 'map can zoom in past the OSM native level 19', async({ editor, page }) => {

		// Sit the map at zoom 19. With the old maxZoom of 19 the zoom-in control
		// would be disabled here; overzoom (maxZoom 21) keeps it enabled.
		await insertMap( editor, { markers: [], zoom: 19 });
		await editor.canvas.locator( '.leaflet-container' ).waitFor({ timeout: 20_000 });

		await publishAndViewPost({ editor, page });

		const zoomIn = page.locator( '.leaflet-control-zoom-in' );
		await expect( zoomIn ).toBeVisible({ timeout: 20_000 });
		await expect( zoomIn ).not.toHaveClass( /leaflet-disabled/ );
	});

	test( 'hover tooltip is hidden once the click popup opens', async({ editor, page }) => {
		await insertMap( editor, { markers: [ marker() ], showMarkerTooltip: true });
		await editor.canvas.locator( '.leaflet-marker-icon' ).first().waitFor({ timeout: 20_000 });

		await publishAndViewPost({ editor, page });

		const icon = page.locator( '.leaflet-marker-icon' ).first();
		await icon.hover();
		await expect( page.locator( '.leaflet-tooltip' ) ).toBeVisible();

		// Clicking opens the popup; the duplicate hover tooltip should disappear.
		await icon.click();
		await expect( page.locator( '.leaflet-popup' ) ).toBeVisible();
		await expect( page.locator( '.leaflet-tooltip' ) ).toHaveCount( 0 );
	});
});
