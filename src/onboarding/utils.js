/**
 * WordPress dependencies.
 */
import {
	dispatch,
	select
} from '@wordpress/data';

export const findBlock = ( blocksAr, name ) => {
	const foundBlock = blocksAr.find( block => block.name === name );

	if ( foundBlock ) {
		return foundBlock;
	}

	return blocksAr.reduce( ( found, block ) => {
		if ( found ) {
			return found;
		}

		if ( block.innerBlocks && Array.isArray( block.innerBlocks ) ) {
			return findBlock( block.innerBlocks, name );
		}

		return undefined;
	}, undefined );
};

export const recordEvent = async( data = {}) => {
	if ( window.otterOnboardingData?.isDev ) {
		return;
	}

	const { setSessionID } = dispatch( 'otter/onboarding' );
	const { getSessionID } = select( 'otter/onboarding' );
	const { getCurrentTheme } = select( 'core' );

	const trackingId = getSessionID();

	try {
		const response = await fetch(
			'https://api.themeisle.com/tracking/onboarding',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					_id: trackingId,
					data: {
						slug: getCurrentTheme()?.template || getCurrentTheme()?.stylesheet,
						// eslint-disable-next-line camelcase
						license_id: window.otterOnboardingData?.license,
						site: window.otterOnboardingData?.rootUrl || '',
						...data
					}
				})
			}
		);

		if ( ! response.ok ) {
			console.error( `HTTP error! Status: ${ response.status }` );
			return false;
		}

		const jsonResponse = await response.json();

		const validCodes = [ 'success', 'invalid' ]; // Add valid codes to this array

		if ( ! validCodes.includes( jsonResponse.code ) ) {
			return false;
		}

		if ( 'invalid' === jsonResponse.code ) {
			console.error( jsonResponse.message );
			return false;
		}
		const responseData = jsonResponse.data;

		if ( responseData?.id && '' === trackingId ) {
			setSessionID( responseData.id );
		}

		return responseData.id || false;
	} catch ( error ) {
		console.error( error );
		return false;
	}
};
