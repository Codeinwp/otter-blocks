/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

import { useBlockProps } from '@wordpress/block-editor';

import { Placeholder } from '@wordpress/components';

import { store as icon } from '@wordpress/icons';

if ( Boolean( window.themeisleGutenberg.hasNeveSupport.isBoosterActive ) && Boolean( window.themeisleGutenberg.hasWooCommerce ) ) {
	registerBlockType( 'themeisle-blocks/product-tabs', {
		apiVersion: 2,
		title: __( 'Product Tabs', 'otter-blocks' ),
		description: __( 'Display the tabs for your WooCommerce product.', 'otter-blocks' ),
		icon,
		category: 'themeisle-woocommerce-blocks',
		keywords: [
			'woocommerce',
			'products',
			'tabs'
		],
		edit: () => <Placeholder>{ __( 'Tabs will be displayed here on the product page.', 'otter-blocks' ) }</Placeholder>,
		save: () => null
	});
} else {
	registerBlockType( 'themeisle-blocks/product-tabs', {
		apiVersion: 2,
		title: __( 'Product Tabs', 'otter-blocks' ),
		description: __( 'Display the tabs for your WooCommerce product.', 'otter-blocks' ),
		icon,
		category: 'themeisle-woocommerce-blocks',
		keywords: [
			'woocommerce',
			'products',
			'tabs'
		],
		supports: {
			inserter: false
		},
		edit: () => <div { ...useBlockProps() }><Placeholder>{ __( 'You need to have Neve Pro & WooCommerce installed to edit WooCommerce Product Tabs block.', 'otter-blocks' ) }</Placeholder></div>,
		save: () => null
	});
}
