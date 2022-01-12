import domReady from '@wordpress/dom-ready';

/**
 * Internal dependencies
 */
import styles from './styles.js';

const initMapScript = () => {
	let maps = [];
	maps = window.themeisleGoogleMaps;

	maps.forEach( map => {
		const mapContainer = document.getElementById( map.container );

		const googleMap = new window.google.maps.Map( mapContainer, {
			center: {
				lat: Number( map.attributes.latitude ),
				lng: Number( map.attributes.longitude )
			},
			gestureHandling: 'cooperative',
			zoom: map.attributes.zoom,
			mapTypeId: map.attributes.type,
			draggable: map.attributes.draggable,
			mapTypeControl: map.attributes.mapTypeControl,
			zoomControl: map.attributes.zoomControl,
			fullscreenControl: map.attributes.fullscreenControl,
			streetViewControl: map.attributes.streetViewControl,
			styles: styles[ map.attributes.style || 'standard' ]
		});

		if ( ! map.attributes.id && map.attributes.location ) {
			const request = {
				query: map.attributes.location,
				fields: [ 'name', 'geometry' ]
			};

			const service = new window.google.maps.places.PlacesService( googleMap );

			service.findPlaceFromQuery( request, ( results, status ) => {
				if ( status === window.google.maps.places.PlacesServiceStatus.OK ) {
					if ( 0 < results.length ) {
						googleMap.setCenter( results[0].geometry.location );
					}
				}
			});
		}

		if ( map.attributes.markers && 0 < map.attributes.markers.length ) {
			map.attributes.markers.forEach( marker => {
				const position = new window.google.maps.LatLng( marker.latitude, marker.longitude );

				const mark = new window.google.maps.Marker({
					position,
					map: googleMap,
					title: marker.title,
					icon: marker.icon || 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
				});

				if ( marker.title || marker.description ) {
					const contentString = `<div class="wp-block-themeisle-blocks-map-overview"><h6 class="wp-block-themeisle-blocks-map-overview-title">${ marker.title }</h6><div class="wp-block-themeisle-blocks-map-overview-content">${ marker.description ? `<p>${ marker.description }</p>` : '' }</div></div>`;

					const infowindow = new window.google.maps.InfoWindow({
						content: contentString
					});

					mark.addListener( 'click', () => {
						infowindow.open( googleMap, mark );
					});
				}
			});
		}
	});
};

domReady( () => {
	window.initMapScript = initMapScript;
});
