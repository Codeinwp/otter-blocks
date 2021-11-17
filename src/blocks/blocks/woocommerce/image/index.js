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
import './editor.scss';
import './style.scss';
import attributes from './attributes.js';
import edit from './edit.js';

if ( Boolean( window.themeisleGutenberg.hasNeveSupport.isBoosterActive ) && Boolean( window.themeisleGutenberg.hasWooCommerce ) ) {
	registerBlockType( 'themeisle-blocks/product-image', {
		title: __( 'Product Image', 'otter-blocks' ),
		description: __( 'Display image of your WooCommerce products.', 'otter-blocks' ),
		icon,
		category: 'themeisle-blocks',
		keywords: [
			'woocommerce',
			'add to cart',
			'products'
		],
		attributes,
		edit,
		save: () => null
	});
} else {
	registerBlockType( 'themeisle-blocks/product-image', {
		title: __( 'Product Image', 'otter-blocks' ),
		description: __( 'Display image of your WooCommerce products.', 'otter-blocks' ),
		icon,
		category: 'themeisle-blocks',
		keywords: [
			'woocommerce',
			'image',
			'products'
		],
		attributes,
		supports: {
			inserter: false
		},
		edit: () => <Placeholder>{ __( 'You need to have Neve Pro & WooCommerce installed to edit WooCommerce Product Image block.', 'otter-blocks' ) }</Placeholder>,
		save: () => null
	});
}
