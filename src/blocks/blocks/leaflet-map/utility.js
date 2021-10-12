/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

// reference https://nominatim.org/release-docs/develop/api/Search/
async function makeSearchRequest( location ) {
	if ( 'string' !== typeof location ) {
		throw __( 'Location must be a string', 'otter-blocks' );
	}

	const query = location.split( ' ' ).map( s => encodeURIComponent( s ) ).join( '+' );

	const url = 'https://nominatim.openstreetmap.org/search?q=' + query + '&format=geojson';

	const response = await fetch( url );

	if ( response.ok && 200 === response.status ) {
		return response.json();
	}

	return console.warn( __( 'An error has occured: ', 'otter-blocks' ) + response.status );
}

export async function getLocation( location ) {
	const data = await makeSearchRequest( location );

	if ( data?.features.length ) {

		const feature = data.features[0];

		if ( feature?.geometry?.coordinates.length ) {
			return {
				longitude: feature.geometry.coordinates[0],
				latitude: feature.geometry.coordinates[1]
			};
		}
	}

	return null;
}
