/**
 * WordPress dependencies.
 */
import { createBlock } from '@wordpress/blocks';

const transforms = {
	from: [
		{
			type: 'block',
			blocks: [ 'core/heading' ],
			transform: ({ content }) => {
				return createBlock( 'themeisle-blocks/advanced-heading', {
					content
				});
			}
		},
		{
			type: 'block',
			blocks: [ 'core/paragraph' ],
			transform: ({ content }) => {
				return createBlock( 'themeisle-blocks/advanced-heading', {
					content
				});
			}
		}
	],
	to: [
		{
			type: 'block',
			blocks: [ 'core/paragraph' ],
			transform: ({ content }) => {
				return createBlock( 'core/paragraph', {
					content
				});
			}
		}
	]
};

export default transforms;
