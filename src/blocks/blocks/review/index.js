/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { reviewIcon as icon } from '../../helpers/icons.js';
import edit from './edit.js';

const {
	name,
	attributes: defaultReviewAttributes
} = metadata;

window.themeisleGutenberg.defaultReviewAttributes = defaultReviewAttributes;

registerBlockType( name, {
	...metadata,
	title: __( 'Product Review', 'otter-blocks' ),
	description: __( 'Turn your posts into smart reviews with ratings and generate leads with a performing review block. Powered by Otter.', 'otter-blocks' ),
	icon,
	keywords: [
		'product',
		'review',
		'stars'
	],
	edit,
	save: () => null,
	example: {
		attributes: {}
	}
});
