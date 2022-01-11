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
		title: __( 'Add to Cart Button', 'otter-blocks' ),
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
} else {
	registerBlockType( name, {
		...metadata,
		title: __( 'Add to Cart Button', 'otter-blocks' ),
		description: __( 'Display an Add to Cart button for your WooCommerce products.', 'otter-blocks' ),
		icon,
		keywords: [
			'woocommerce',
			'add to cart',
			'products'
		],
		supports: {
			inserter: false
		},
		edit: () => <div { ...useBlockProps() }><Placeholder>{ __( 'You need to have Neve Pro & WooCommerce installed to edit Add to Cart Button block.', 'otter-blocks' ) }</Placeholder></div>,
		save: () => null
	});
}
