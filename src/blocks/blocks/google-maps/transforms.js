/**
 * WordPress dependencies
 */
import { omit } from 'lodash';

import { createBlock } from '@wordpress/blocks';

const transform = {
	to: [
		{
			type: 'block',
			blocks: [ 'themeisle-blocks/leaflet-map' ],
			transform: ( attributes ) => {
				const commonProps = omit( attributes, [ 'style', 'mapTypeControl', 'fullscreenControl', 'streetViewControl' ]);

				return createBlock( 'themeisle-blocks/leaflet-map', {
					...commonProps
				});
			}
		}
	]
};

export default transform;
