/**
 * WordPress dependencies
 */
import { createBlock } from '@wordpress/blocks';

const {
	clamp,
	omit
} = lodash;

const transform = {
	to: [
		{
			type: 'block',
			blocks: [ 'themeisle-blocks/progress-bar' ],
			transform: ( attributes ) => {
				const commonProps = omit( attributes, [ 'titleStyle', 'height', 'fontSize', 'strokeWidth', 'progressColor' ]);

				return createBlock( 'themeisle-blocks/progress-bar', {
					...commonProps,
					barBackgroundColor: attributes.progressColor,
					height: clamp( attributes.height / 4, 0, 100 ),
					titleStyle: 'default'
				});
			}
		}
	]
};

export default transform;
