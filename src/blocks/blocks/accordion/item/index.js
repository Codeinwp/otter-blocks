/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { accordionItemIcon as icon } from '../../../helpers/icons.js';
import edit from './edit.js';
import save from './save.js';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Accordion Item', 'otter-blocks' ),
	description: __( 'Vertically collapsing accordions perfect for displaying your FAQs. Powered by Otter.', 'otter-blocks' ),
	icon,
	keywords: [
		'accordions',
		'collapse',
		'faq'
	],
	edit,
	save
});
