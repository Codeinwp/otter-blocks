/**
 * Internal dependencies
 */
import { test, expect } from '../fixtures';

const GOOGLE_MAP_BLOCK = 'themeisle-blocks/google-map';

/**
 * Offline stub of the Google Maps JS API.
 *
 * The block injects `https://maps.googleapis.com/maps/api/js?...` and renders
 * only after that script's `load` event. We intercept the request and fulfil it
 * with this stub so the test is deterministic and needs no real API key or
 * network. Each `Map` instance paints a `.otter-mock-gmap` node into its
 * container so we can assert how many maps actually rendered.
 */
const GOOGLE_MAPS_STUB = `
( function() {
	function noop() {}
	function Listenable() {}
	Listenable.prototype.addListener = function() { return {}; };

	function GMap( node ) {
		this._node = node;
		if ( node ) {
			node.innerHTML = '<div class="otter-mock-gmap"></div>';
		}
	}
	GMap.prototype.setOptions = noop;
	GMap.prototype.setCenter = noop;
	GMap.prototype.setZoom = noop;
	GMap.prototype.getZoom = function() { return 15; };
	GMap.prototype.getMapTypeId = function() { return 'roadmap'; };
	GMap.prototype.getCenter = function() {
		return { lat: function() { return 0; }, lng: function() { return 0; } };
	};
	GMap.prototype.addListener = function() { return {}; };

	function Marker() {}
	Marker.prototype.setMap = noop;
	Marker.prototype.addListener = function() { return {}; };

	function InfoWindow() {}
	InfoWindow.prototype.open = noop;
	InfoWindow.prototype.close = noop;
	InfoWindow.prototype.setContent = noop;

	function PlacesService() {}
	PlacesService.prototype.findPlaceFromQuery = function( request, cb ) {
		if ( 'function' === typeof cb ) {
			cb( [], 'OK' );
		}
	};

	window.google = window.google || {};
	window.google.maps = {
		Map: GMap,
		Marker: Marker,
		InfoWindow: InfoWindow,
		LatLng: function( lat, lng ) {
			this.lat = function() { return lat; };
			this.lng = function() { return lng; };
		},
		event: {
			addListener: function() { return {}; },
			addListenerOnce: function( obj, ev, cb ) {
				if ( 'function' === typeof cb ) {
					setTimeout( cb, 0 );
				}
				return {};
			},
			clearListeners: noop
		},
		places: {
			PlacesService: PlacesService,
			PlacesServiceStatus: { OK: 'OK' }
		}
	};
}() );
`;

const MAP_ATTRIBUTES = {
	latitude: '41.40',
	longitude: '2.17'
};

test.describe( 'Google Map block API v3 canvas', () => {
	test.beforeEach( async({ page, admin, otterUtils }) => {
		// A non-empty key makes the block skip the API-key prompt and load the
		// Maps script (which we stub below) instead.
		await otterUtils.setOptions({ themeisle_google_map_block_api_key: 'e2e-test-key' });

		await page.route( '**/maps.googleapis.com/maps/api/js**', ( route ) =>
			route.fulfill({
				contentType: 'application/javascript',
				body: GOOGLE_MAPS_STUB
			})
		);

		await admin.createNewPost();
	});

	test.afterEach( async({ otterUtils }) => {
		await otterUtils.setOptions({ themeisle_google_map_block_api_key: '' });
	});

	test( 'renders every Google Map block inserted on the same post', async({ editor }) => {
		await editor.insertBlock({ name: GOOGLE_MAP_BLOCK, attributes: MAP_ATTRIBUTES });
		await editor.insertBlock({ name: GOOGLE_MAP_BLOCK, attributes: MAP_ATTRIBUTES });

		await expect(
			editor.canvas.locator( '.otter-mock-gmap' )
		).toHaveCount( 2, { timeout: 20_000 });
		await expect(
			editor.canvas.locator( '.block-editor-warning' )
		).toHaveCount( 0 );
	});

	test( 'renders every saved Google Map block after a reload', async({ editor, page }) => {
		await editor.insertBlock({ name: GOOGLE_MAP_BLOCK, attributes: MAP_ATTRIBUTES });
		await editor.insertBlock({ name: GOOGLE_MAP_BLOCK, attributes: MAP_ATTRIBUTES });

		await expect(
			editor.canvas.locator( '.otter-mock-gmap' )
		).toHaveCount( 2, { timeout: 20_000 });
		await editor.publishPost();

		await page.reload();

		// Both saved maps mount at once on reload — the race that previously left
		// every map after the first stuck on a null ref / crash boundary.
		await expect(
			editor.canvas.locator( '.otter-mock-gmap' )
		).toHaveCount( 2, { timeout: 20_000 });
		await expect(
			editor.canvas.locator( '.block-editor-warning' )
		).toHaveCount( 0 );
	});
});
