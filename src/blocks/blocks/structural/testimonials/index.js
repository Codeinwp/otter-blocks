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
	description: __( 'Display kudos from customers and clients and display them on your website. Powered by Otter.', 'otter-blocks' ),
	icon,
	keywords: [
		'testimonials',
		'quotes',
		'business'
	],
	edit,
	save,
	example: {
		attributes: {},
		innerBlocks: [
			[ 'core/image', {
				align: 'center',
				url: 'https://s.w.org/images/core/5.3/MtBlanc1.jpg'
			} ],
			[ 'themeisle-blocks/advanced-heading', {
				content: __( 'John Doe', 'otter-blocks' ),
				align: 'center',
				fontSize: 24,
				tag: 'h3',
				marginTop: 25,
				marginBottom: 10,
				marginTopTablet: 25,
				marginTopMobile: 25
			} ],
			[ 'themeisle-blocks/advanced-heading', {
				content: __( 'Jedi Master', 'otter-blocks' ),
				align: 'center',
				fontSize: 14,
				tag: 'h4',
				marginTop: 10,
				marginBottom: 10
			} ],
			[ 'themeisle-blocks/advanced-heading', {
				content: __( '"What is the point of being alive if you don’t at least try to do something remarkable?"', 'otter-blocks' ),
				align: 'center',
				color: '#999999',
				tag: 'p',
				fontSize: 14,
				marginTop: 10,
				marginBottom: 20
			} ]
		]
	}
});
