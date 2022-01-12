import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { registerBlockVariation } from '@wordpress/blocks';

import './style.scss';
import './editor.scss';

import edit from './edit';
import save from './save';
import attributes from './attributes';
import { pricingIcon as icon } from '../../helpers/icons';

registerBlockType( 'themeisle-blocks/pricing-table', {
	title: __( 'Pricing', 'otter-blocks' ),
	icon,
	category: 'themeisle-blocks',
	keywords: [ 'themeisle', 'pricing', 'table' ],
	attributes,
	edit,
	save
});

registerBlockVariation( 'themeisle-blocks/advanced-columns', {
	name: 'themeisle-gutenberg/pricing-table-ext',
	icon,
	title: __( 'Pricing Table', 'otter-blocks' ),
	description: __( 'Display multiple pricing blocks.', 'otter-blocks' ),
	category: 'themeisle-blocks',
	keywords: [ 'themeisle', 'pricing', 'table', 'columns' ],
	innerBlocks: [
		{
			name: 'themeisle-blocks/advanced-column',
			attributes: {
				columnWidth: '250px',
				margin: {'top': '10px', 'right': '10px', 'bottom': '10px', 'left': '10px'}
			},
			innerBlocks: [
				{ name: 'themeisle-blocks/pricing-table' }
			]
		},
		{
			name: 'themeisle-blocks/advanced-column',
			attributes: {
				columnWidth: '250px',
				margin: {'top': '10px', 'right': '10px', 'bottom': '10px', 'left': '10px'}
			},
			innerBlocks: [
				{ name: 'themeisle-blocks/pricing-table' }
			]
		},
		{
			name: 'themeisle-blocks/advanced-column',
			attributes: {
				columnWidth: '250px',
				margin: {'top': '10px', 'right': '10px', 'bottom': '10px', 'left': '10px'}
			},
			innerBlocks: [
				{ name: 'themeisle-blocks/pricing-table' }
			]
		}
	]

});

