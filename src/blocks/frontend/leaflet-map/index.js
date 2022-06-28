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

const createMarker = ( markerProps ) => {
	const markerMap = window.L.marker([ markerProps.latitude, markerProps.longitude ]);

	markerMap.bindTooltip( markerProps.title, { direction: 'auto' });
	markerMap.bindPopup( createPopupContent( markerProps ) );

	return markerMap;
};

const createLeafletMap = ( container, attributes ) => {

	if ( ! container ) {
		console.warn( `The placeholder for the leaflet map block with id: ${ container } does not exist!` );
		return;
	}

	// Add the height of the map first
	container.classList.add( 'wp-block-themeisle-leaflet-blocks-map' );

	// Create the map
	const map = window.L.map( container, {
		zoomControl: attributes.zoomControl,
		dragging: attributes.draggable,
		gestureHandling: true,
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
		subdomains: [ 'a', 'b', 'c' ]
	}).addTo( map );

	// Set the view
	map.setView([ attributes.latitude, attributes.longitude ], attributes.zoom || 15 );

	// Add the markers
	attributes.markers.map( ( markerProps ) => createMarker( markerProps ) ).forEach( ( marker ) => {
		map.addLayer( marker );
	});
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

	const checker = setInterval(
		() => {
			if ( ! window.L ) {
				console.warn( 'The leaflet script did not load on the page! Waiting for loading.' );
				return;
			}

			clearInterval( checker );

			const idAttrMapping = Array.from( window.themeisleLeafletMaps )
				.reduce( ( acc, x ) => {
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
		2_000
	);
});
