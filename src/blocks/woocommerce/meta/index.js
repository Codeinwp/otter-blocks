/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

import { useBlockProps } from '@wordpress/block-editor';

import { Placeholder } from '@wordpress/components';

import { store as icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import edit from './edit.js';

if ( Boolean( window.themeisleGutenberg.hasNeveSupport.isBoosterActive ) && Boolean( window.themeisleGutenberg.hasWooCommerce ) ) {
	registerBlockType( 'themeisle-blocks/product-meta', {
		apiVersion: 2,
		title: __( 'Product Meta', 'otter-blocks' ),
		description: __( 'Display the meta of your WooCommerce product.', 'otter-blocks' ),
		icon,
		category: 'themeisle-woocommerce-blocks',
		keywords: [
			'woocommerce',
			'products',
			'meta'
		],
		edit,
		save: () => null
	});
} else {
	registerBlockType( 'themeisle-blocks/product-meta', {
		apiVersion: 2,
		title: __( 'Product Meta', 'otter-blocks' ),
		description: __( 'Display the meta of your WooCommerce product.', 'otter-blocks' ),
		icon,
		category: 'themeisle-woocommerce-blocks',
		keywords: [
			'woocommerce',
			'products',
			'meta'
		],
		supports: {
			inserter: false
		},
		edit: () => <div { ...useBlockProps() }><Placeholder>{ __( 'You need to have Neve Pro & WooCommerce installed to edit WooCommerce Product Meta block.', 'otter-blocks' ) }</Placeholder></div>,
		save: () => null
	});
}
