/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

import { Placeholder } from '@wordpress/components';

import { store as icon } from '@wordpress/icons';

/**
  * Internal dependencies
  */
import attributes from './attributes.js';
import edit from './edit.js';

if ( Boolean( window.themeisleGutenberg.hasNeveSupport.isBoosterActive ) && Boolean( window.themeisleGutenberg.hasWooCommerce ) ) {
	registerBlockType( 'themeisle-blocks/add-to-cart-button', {
		title: __( 'Add to Cart Button', 'otter-blocks' ),
		description: __( 'Display an Add to Cart button for your WooCommerce products.', 'otter-blocks' ),
		icon,
		category: 'themeisle-blocks',
		keywords: [
			'woocommerce',
			'add to cart',
			'products'
		],
		attributes,
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
} else {
	registerBlockType( 'themeisle-blocks/add-to-cart-button', {
		title: __( 'Add to Cart Button', 'otter-blocks' ),
		description: __( 'Display an Add to Cart button for your WooCommerce products.', 'otter-blocks' ),
		icon,
		category: 'themeisle-blocks',
		keywords: [
			'woocommerce',
			'add to cart',
			'products'
		],
		attributes,
		supports: {
			inserter: false
		},
		edit: () => <Placeholder>{ __( 'You need to have Neve Pro & WooCommerce installed to edit Add to Cart Button block.', 'otter-blocks' ) }</Placeholder>,
		save: () => null
	});
}
