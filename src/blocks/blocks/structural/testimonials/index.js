/**
 * WordPress dependencies
 */

import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { testimonialsIcon as icon } from '../../../helpers/icons.js';
import edit from './edit.js';
import save from './save.js';

registerBlockType( 'themeisle-blocks/testimonials', {
	title: __( 'Testimonials', 'otter-blocks' ),
	description: __( 'Display kudos from customers and clients and display them on your website.', 'otter-blocks' ),
	icon,
	category: 'themeisle-blocks',
	keywords: [
		'testimonials',
		'quotes',
		'business'
	],
	edit,
	save
});
