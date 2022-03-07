/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import edit from './edit.js';

const { faIcon: icon } = window.otterUtils.icons;

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Review Comparison Table', 'otter-blocks' ),
	description: __( 'A way to compare different product reviews made on the website.', 'otter-blocks' ),
	icon,
	keywords: [
		'product',
		'review',
		'comparison'
	],
	supports: {
		html: false
	},
	edit,
	save: () => null
});
