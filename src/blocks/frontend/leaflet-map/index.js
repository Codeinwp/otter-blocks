/**
 * Internal dependencies
 */
import { domReady } from '../../helpers/frontend-helper-functions.js';

const createPopupContent = ( markerProps ) => {

	/**
	 * The Popup can take a string or a HTMLElement
	 * For simple use, a string is enough.
	 * But we need interaction, in our case, to remove the marker.
	 * So, creating an HTMLElement will allow us to bind function very easily.
	 */
	const container = document.createElement( 'div' );
	const title = document.createElement( 'h6' );
	const content = document.createElement( 'div' );
	const description = document.createElement( 'p' );

	title.innerHTML = markerProps.title;
	description.innerHTML = markerProps.description;

	container.classList.add( 'wp-block-themeisle-blocks-leaflet-map-overview' );
	content.classList.add( 'wp-block-themeisle-blocks-leaflet-map-overview-content' );
	title.classList.add( 'wp-block-themeisle-blocks-leaflet-map-overview-title' );

	container.appendChild( title );
	container.appendChild( content );
	content.appendChild( description );

	return container;
};

const createMarker = ( markerProps, attributes ) => {
	const markerMap = window.L.marker([ markerProps.latitude, markerProps.longitude ]);

	const hasTitle = Boolean( markerProps.title );
	const hasContent = hasTitle || Boolean( markerProps.description );

	if ( attributes.showMarkerTooltip && hasTitle ) {
		markerMap.bindTooltip( markerProps.title, { direction: 'auto' });
	}

	if ( hasContent ) {
		markerMap.bindPopup( createPopupContent( markerProps ) );
	}

	return markerMap;
};

const createLeafletMap = ( container, attributes ) => {

	if ( ! container ) {
		console.warn( `The placeholder for the leaflet map block with id: ${ container } does not exist!` );
		return;
	}

	// Add the height of the map first
	container.classList.add( 'wp-block-themeisle-leaflet-blocks-map' );

	// `scrollZoom` defaults to true for blocks saved before the attribute existed.
	const scrollZoom = false !== attributes.scrollZoom;

	// Create the map
	const map = window.L.map( container, {
		maxZoom: 19,
		zoomControl: attributes.zoomControl,
		dragging: attributes.draggable,
		scrollWheelZoom: scrollZoom,

		// Gesture handling enforces the Ctrl/\u2318 + scroll requirement; turn it off
		// together with scrollWheelZoom when scroll zoom is disabled.
		gestureHandling: attributes.draggable && scrollZoom,
		gestureHandlingOptions: {
			text: {
				touch: 'Use two fingers to move the map',
				scroll: 'Use ctrl + scroll to zoom the map',
				scrollMac: 'Use \u2318 + scroll to zoom the map'
			}
		}
	});
	window.L.tileLayer( 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
		subdomains: [ 'a', 'b', 'c' ],
		maxZoom: 19
	}).addTo( map );

	// Set the view
	map.setView([ attributes.latitude, attributes.longitude ], attributes.zoom || 15 );

	// Add the markers
	attributes.markers.map( ( markerProps ) => createMarker( markerProps, attributes ) ).forEach( ( marker ) => {
		map.addLayer( marker );
	});

	const resizeObserver = new ResizeObserver( () => {
		map.invalidateSize();
	});

	resizeObserver.observe( container );
};

domReady( () => {
	if ( ! window.themeisleLeafletMaps ) {
		console.warn( 'The leaflet map attributes did not load on the page!' );
		return;
	}

	document.querySelectorAll( '.wp-block-themeisle-blocks-leaflet-map' )
		.forEach( mapElem => {
			mapElem.style.margin = '20px 0';
			mapElem.style.backgroundColor = '#ccc';
		});

	// The `leaflet` script loads `async`, so its order relative to this script is
	// not guaranteed. Poll on a short interval so the map appears as soon as Leaflet
	// is ready, with an attempt cap so it gives up instead of looping forever.
	const POLL_INTERVAL = 100;
	const MAX_ATTEMPTS = 100; // ~10s
	let attempts = 0;

	const checker = setInterval(
		() => {
			if ( ! window.L ) {
				if ( ++attempts >= MAX_ATTEMPTS ) {
					clearInterval( checker );
					console.warn( 'The leaflet script did not load on the page!' );
				}
				return;
			}

			clearInterval( checker );

			const idAttrMapping = Array.from( window.themeisleLeafletMaps )
				.reduce( ( acc, x ) => {

					// Point Leaflet's default marker icon at the bundled images so
					// markers render instead of showing broken-image placeholders.
					if ( x.imagePath ) {
						window.L.Icon.Default.imagePath = x.imagePath;
					}

					acc[x.container] = x.attributes;
					return acc;
				}, {});

			document.querySelectorAll( '.wp-block-themeisle-blocks-leaflet-map' )
				.forEach( mapElem => {
					if ( idAttrMapping[mapElem.id] !== undefined ) {
						createLeafletMap( mapElem, idAttrMapping[mapElem.id]);
						mapElem.style.removeProperty( 'margin' );
						mapElem.style.removeProperty( 'background-color' );
					}
				});
		},
		POLL_INTERVAL
	);
});
