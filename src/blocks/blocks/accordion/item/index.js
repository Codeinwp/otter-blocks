/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { buttonsIcon as icon } from '../../../helpers/icons.js';
import attributes from './attributes.js';
import edit from './edit.js';
import save from './save.js';

registerBlockType( 'themeisle-blocks/accordion-item', {
	title: __( 'Accordion Item', 'otter-blocks' ),
	description: __( 'Vertically collapsing accordions perfect for displaying your FAQs.', 'otter-blocks' ),
	parent: [ 'themeisle-blocks/accordion' ],
	icon,
	category: 'themeisle-blocks',
	keywords: [
		'accordions',
		'collapse',
		'faq'
	],
	attributes,
	supports: {
		reusable: false
	},
	edit,
	save
});
