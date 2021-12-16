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
import './editor.scss';
import './style.scss';
import edit from './edit.js';

if ( Boolean( window.themeisleGutenberg.hasNeveSupport.isBoosterActive ) && Boolean( window.themeisleGutenberg.hasWooCommerce ) ) {
	registerBlockType( 'themeisle-blocks/product-images', {
		apiVersion: 2,
		title: __( 'Product Images', 'otter-blocks' ),
		description: __( 'Display images of your WooCommerce product.', 'otter-blocks' ),
		icon,
		category: 'themeisle-woocommerce-blocks',
		keywords: [
			'woocommerce',
			'products',
			'images'
		],
		edit,
		save: () => null
	});
} else {
	registerBlockType( 'themeisle-blocks/product-images', {
		apiVersion: 2,
		title: __( 'Product Images', 'otter-blocks' ),
		description: __( 'Display images of your WooCommerce product.', 'otter-blocks' ),
		icon,
		category: 'themeisle-woocommerce-blocks',
		keywords: [
			'woocommerce',
			'products',
			'images'
		],
		supports: {
			inserter: false
		},
		edit: () => <div { ...useBlockProps() }><Placeholder>{ __( 'You need to have Neve Pro & WooCommerce installed to edit WooCommerce Product Images block.', 'otter-blocks' ) }</Placeholder></div>,
		save: () => null
	});
}
