/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

import { store as icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import edit from './edit.js';

const { name } = metadata;

registerBlockType( name, {
	title: __( 'Add to Cart Button', 'otter-blocks' ),
	...metadata,
	description: __( 'Display an Add to Cart button for your WooCommerce products.', 'otter-blocks' ),
	icon,
	keywords: [
		'woocommerce',
		'add to cart',
		'products'
	],
	styles: [
		{
			name: 'default',
			label: __( 'Default', 'otter-blocks' ),
			isDefault: true
		},
		{
			name: 'primary',
			label: __( 'Primary', 'otter-blocks' )
		},
		{
			name: 'secondary',
			label: __( 'Secondary', 'otter-blocks' )
		}
	],
	edit,
	save: () => null
});
