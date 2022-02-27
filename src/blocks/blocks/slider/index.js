/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import deprecated from './deprecated.js';
import transforms from './transforms.js';
import edit from './edit.js';
import save from './save.js';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Slider', 'otter-blocks' ),
	description: __( 'Minimal image slider to showcase beautiful images.', 'otter-blocks' ),
	icon: 'images-alt2',
	keywords: [
		'slider',
		'gallery',
		'carousel'
	],
	deprecated,
	transforms,
	edit,
	save
});
