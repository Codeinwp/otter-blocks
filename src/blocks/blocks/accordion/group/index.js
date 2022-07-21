/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { buttonsIcon as icon } from '../../../helpers/icons.js';
import edit from './edit.js';
import save from './save.js';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Accordion', 'otter-blocks' ),
	description: __( 'Vertically collapsing accordions perfect for displaying your FAQs. Powered by Otter.', 'otter-blocks' ),
	icon,
	keywords: [
		'accordions',
		'collapse',
		'faq'
	],
	edit,
	save,
	example: {
		attributes: {},
		innerBlocks: [
			{
				name: 'themeisle-blocks/accordion-item',
				attributes: {
					initialOpen: true,
					title: __( 'Accordion Item', 'otter-blocks' )
				},
				innerBlocks: [
					{
						name: 'core/paragraph',
						attributes: {
							customFontSize: 48,
							content: 'Lorem ipsum dolor sit amet, eu liber saperet est. Recusabo volutpat has ne, sed dicit eruditi detraxit ut, modus ancillae mei eu.',
							align: 'left'
						}
					}
				]
			}
		]
	}
});
