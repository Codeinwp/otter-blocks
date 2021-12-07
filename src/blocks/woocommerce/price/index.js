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
import edit from './edit.js';

if ( Boolean( window.themeisleGutenberg.hasNeveSupport.isBoosterActive ) && Boolean( window.themeisleGutenberg.hasWooCommerce ) ) {
	registerBlockType( 'themeisle-blocks/product-price', {
		title: __( 'Product Price', 'otter-blocks' ),
		description: __( 'Display the price of your WooCommerce product.', 'otter-blocks' ),
		icon,
		category: 'themeisle-blocks',
		keywords: [
			'woocommerce',
			'products',
			'price'
		],
		edit,
		save: () => null
	});
} else {
	registerBlockType( 'themeisle-blocks/product-price', {
		title: __( 'Product Price', 'otter-blocks' ),
		description: __( 'Display the price of your WooCommerce product.', 'otter-blocks' ),
		icon,
		category: 'themeisle-blocks',
		keywords: [
			'woocommerce',
			'products',
			'price'
		],
		supports: {
			inserter: false
		},
		edit: () => <Placeholder>{ __( 'You need to have Neve Pro & WooCommerce installed to edit WooCommerce Product Price block.', 'otter-blocks' ) }</Placeholder>,
		save: () => null
	});
}
