/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './style.scss';
import './editor.scss';
import attributes from './attributes.js';
import deprecated from './deprecated.js';
import transforms from './transforms.js';
import edit from './edit.js';
import save from './save.js';

registerBlockType( 'themeisle-blocks/slider', {
	title: __( 'Slider', 'otter-blocks' ),
	description: __( 'Minimal image slider to showcase beautiful images.', 'otter-blocks' ),
	icon: 'images-alt2',
	category: 'themeisle-blocks',
	keywords: [
		'slider',
		'gallery',
		'carousel'
	],
	attributes,
	deprecated,
	transforms,
	supports: {
		align: [ 'wide', 'full' ]
	},
	edit,
	save
});
