import { rotateRight as icon } from '@wordpress/icons';
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

import './style.scss';
import './editor.scss';

import edit from './edit';
import save from './save';

registerBlockType( 'themeisle/pricing-table-item', {
	title: __( 'Pricing Table', 'otter-blocks' ),
	icon,
	category: 'themeisle-blocks',
	keywords: [ 'themeisle', 'pricing', 'table' ],
	attributes: {
		title: {
			type: 'string',
			default: __( 'Pricing Title', 'otter-blocks' )
		},
		description: {
			type: 'string',
			default: __( 'Pricing Description', 'otter-blocks' )
		},
		buttonText: {
			type: 'string',
			default: __( 'Purchase', 'otter-blocks' )
		},
		variations: {
			type: 'array',
			default: []
		},
		isFeatured: {
			type: 'boolean',
			default: false
		},
		hasTableLink: {
			type: 'boolean',
			default: false
		},
		selector: {
			type: 'string'
		},
		linkText: {
			default: __( 'See all features', 'otter-blocks' ),
			type: 'string'
		}
	},
	edit,
	save
});
