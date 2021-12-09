/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

import { Placeholder } from '@wordpress/components';

import { store as icon } from '@wordpress/icons';

if ( Boolean( window.themeisleGutenberg.hasNeveSupport.isBoosterActive ) && Boolean( window.themeisleGutenberg.hasWooCommerce ) ) {
	registerBlockType( 'themeisle-blocks/product-upsells', {
		title: __( 'Product Upsells', 'otter-blocks' ),
		description: __( 'Display upsells for your WooCommerce product.', 'otter-blocks' ),
		icon,
		category: 'themeisle-woocommerce-blocks',
		keywords: [
			'woocommerce',
			'products',
			'upsells'
		],
		edit: () => <Placeholder>{ __( 'Upsell products will be displayed here on the product page.', 'otter-blocks' ) }</Placeholder>,
		save: () => null
	});
} else {
	registerBlockType( 'themeisle-blocks/product-upsells', {
		title: __( 'Product Upsells', 'otter-blocks' ),
		description: __( 'Display upsells for your WooCommerce product.', 'otter-blocks' ),
		icon,
		category: 'themeisle-woocommerce-blocks',
		keywords: [
			'woocommerce',
			'products',
			'upsells'
		],
		supports: {
			inserter: false
		},
		edit: () => <Placeholder>{ __( 'You need to have Neve Pro & WooCommerce installed to edit WooCommerce Upsell Products block.', 'otter-blocks' ) }</Placeholder>,
		save: () => null
	});
}
