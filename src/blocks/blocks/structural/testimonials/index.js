/**
 * WordPress dependencies
 */

import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { testimonialsIcon as icon } from '../../../helpers/icons.js';
import edit from './edit.js';
import save from './save.js';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Testimonials', 'otter-blocks' ),
	description: __( 'Display kudos from customers and clients and display them on your website.', 'otter-blocks' ),
	icon,
	keywords: [
		'testimonials',
		'quotes',
		'business'
	],
	edit,
	save
});
