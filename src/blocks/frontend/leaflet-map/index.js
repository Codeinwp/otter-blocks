/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import domReady from '@wordpress/dom-ready';

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

const createMarker = ( markerProps ) => {
	const markerMap = L.marker([ markerProps.latitude, markerProps.longitude ]);

	markerMap.bindTooltip( markerProps.title, { direction: 'auto'});
	markerMap.bindPopup( createPopupContent( markerProps ) );

	return markerMap;
};

const createLeafletMap = ( containerId, attributes ) => {
	const container = document.querySelector( `#${containerId}` );

	if ( ! container ) {
		console.warn( __( `The placeholer for the leaflet map block with id: ${containerId} does not exist!`, 'otter-blocks' ) );
		return;
	}

	// Add the height of the map first
	container.style.height = attributes.height + 'px';
	container.classList.add( 'wp-block-themeisle-leaflet-blocks-map' );

	// Create the map
	const map = L.map( container, {
		zoomControl: attributes.zoomControl,
		dragging: attributes.draggable,
		gestureHandling: true,
		gestureHandlingOptions: {
			text: {
				touch: __( 'Use two fingers to move the map', 'otter-blocks' ),
				scroll: __( 'Use ctrl + scroll to zoom the map', 'otter-blocks' ),
				scrollMac: __( 'Use \u2318 + scroll to zoom the map', 'otter-blocks' )
			}
		}
	});
	L.tileLayer( 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
		subdomains: [ 'a', 'b', 'c' ]
	}).addTo( map );


	// Set the view
	map.setView([ attributes.latitude, attributes.longitude ], attributes.zoom || 13 );

	// Add the markers
	attributes.markers.map( markerProps => createMarker( markerProps ) ).forEach( marker => {
		map.addLayer( marker );
	});
};

domReady( () => {
	if ( ! window.themeisleLeafletMaps ) {
		console.warn( 'The leaflet map attributes did not load on the page!' );
		return;
	}

	if ( ! L ) {
		console.warn( 'The leaflet script did not load on the page!' );
		return;
	}

	window.themeisleLeafletMaps.forEach( block => {
		createLeafletMap( block.container, block.attributes );
	});
});
