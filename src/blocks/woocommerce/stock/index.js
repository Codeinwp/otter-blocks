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
import metadata from './block.json';
import edit from './edit.js';

const { name } = metadata;

if ( Boolean( window.themeisleGutenberg.hasNeveSupport.isBoosterActive ) && Boolean( window.themeisleGutenberg.hasWooCommerce ) ) {
	registerBlockType( name, {
		...metadata,
		title: __( 'Product Stock', 'otter-blocks' ),
		description: __( 'Display the stock of your WooCommerce product.', 'otter-blocks' ),
		icon,
		keywords: [
			'woocommerce',
			'products',
			'stock'
		],
		edit,
		save: () => null
	});
} else {
	registerBlockType( name, {
		...metadata,
		title: __( 'Product Stock', 'otter-blocks' ),
		description: __( 'Display the stock of your WooCommerce product.', 'otter-blocks' ),
		icon,
		keywords: [
			'woocommerce',
			'products',
			'stock'
		],
		supports: {
			inserter: false
		},
		edit: () => <div { ...useBlockProps() }><Placeholder>{ __( 'You need to have Neve Pro & WooCommerce installed to edit WooCommerce Product Stock block.', 'otter-blocks' ) }</Placeholder></div>,
		save: () => null
	});
}
