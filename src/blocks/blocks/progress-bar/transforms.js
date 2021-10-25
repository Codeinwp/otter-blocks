/**
 * WordPress dependencies
 */
import {
	clamp,
	omit
} from 'lodash';

import { createBlock } from '@wordpress/blocks';

const transform = {
	to: [
		{
			type: 'block',
			blocks: [ 'themeisle-blocks/circle-counter' ],
			transform: ( attributes ) => {
				const commonProps = omit( attributes, [ 'titleStyle', 'percentagePosition', 'height', 'borderRadius', 'barBackgroundColor', 'percentageColor' ]);

				return createBlock( 'themeisle-blocks/circle-counter', {
					...commonProps,
					progressColor: attributes.barBackgroundColor,
					height: clamp( attributes.height * 4, 0, 240 ),
					titleStyle: 'default'
				});
			}
		}
	]
};

export default transform;
