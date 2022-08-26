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
	description: __( 'Minimal image slider to showcase beautiful images. Powered by Otter.', 'otter-blocks' ),
	icon: 'images-alt2',
	keywords: [
		'slider',
		'gallery',
		'carousel'
	],
	deprecated,
	transforms,
	edit,
	save,
	example: {
		attributes: {
			images: [
				{
					id: 1,
					url: 'https://s.w.org/images/core/5.3/Glacial_lakes%2C_Bhutan.jpg'
				},
				{
					id: 2,
					url: 'https://s.w.org/images/core/5.3/Sediment_off_the_Yucatan_Peninsula.jpg'
				}
			]
		}
	}
});
