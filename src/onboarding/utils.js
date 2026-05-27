/**
 * WordPress dependencies.
 */
import { parse } from '@wordpress/blocks';

import {
	dispatch,
	select
} from '@wordpress/data';

/**
 * Recursively inline `core/pattern` blocks by replacing each with the parsed
 * content of the pattern it references. BlockPreview renders patterns via the
 * block-editor data store, which isn't hydrated in the onboarding wizard's
 * isolated provider, so without this step every `wp:pattern` reference shows
 * up as blank in the preview.
 *
 * @param {Array}  blocks   Parsed blocks.
 * @param {Array}  patterns Registered patterns from `select('core').getBlockPatterns()`.
 * @param {number} depth    Recursion guard for pattern-in-pattern cycles.
 * @return {Array}
 */
export const resolvePatternBlocks = ( blocks, patterns, depth = 0 ) => {
	if ( ! Array.isArray( blocks ) || ! Array.isArray( patterns ) || ! patterns.length || 4 < depth ) {
		return blocks;
	}

	const byName = patterns.reduce( ( acc, pattern ) => {
		if ( pattern?.name ) {
			acc[ pattern.name ] = pattern;
		}
		return acc;
	}, {});

	const resolve = block => {
		if ( ! block ) {
			return [];
		}

		if ( 'core/pattern' === block.name ) {
			const slug = block.attributes?.slug;
			const pattern = slug ? byName[ slug ] : null;

			if ( pattern?.content ) {
				return resolvePatternBlocks( parse( pattern.content ), patterns, depth + 1 );
			}

			return [];
		}

		if ( block.innerBlocks?.length ) {
			return [
				{
					...block,
					innerBlocks: block.innerBlocks.flatMap( resolve )
				}
			];
		}

		return [ block ];
	};

	return blocks.flatMap( resolve );
};

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

	
	try {
		const { setSessionID } = dispatch( 'otter/onboarding' );
		const { getSessionID } = select( 'otter/onboarding' );
		const { getCurrentTheme } = select( 'core' );
	
		const trackingId = getSessionID();
		
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
