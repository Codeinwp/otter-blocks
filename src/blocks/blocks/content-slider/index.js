/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { sliderIcon as icon } from '../../helpers/icons.js';
import edit from './edit.js';
import save from './save.js';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Content Slider', 'otter-blocks' ),
	description: __( 'A lightweight slider where each inner block becomes a slide. Powered by Otter.', 'otter-blocks' ),
	icon,
	keywords: [
		'slider',
		'carousel',
		'content',
		'slides'
	],
	edit,
	save
});
