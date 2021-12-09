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
	registerBlockType( 'themeisle-blocks/product-rating', {
		title: __( 'Product Rating', 'otter-blocks' ),
		description: __( 'Display the rating of your WooCommerce product.', 'otter-blocks' ),
		icon,
		category: 'themeisle-blocks',
		keywords: [
			'woocommerce',
			'products',
			'rating'
		],
		edit,
		save: () => null
	});
} else {
	registerBlockType( 'themeisle-blocks/product-rating', {
		title: __( 'Product Rating', 'otter-blocks' ),
		description: __( 'Display the rating of your WooCommerce product.', 'otter-blocks' ),
		icon,
		category: 'themeisle-blocks',
		keywords: [
			'woocommerce',
			'products',
			'rating'
		],
		supports: {
			inserter: false
		},
		edit: () => <Placeholder>{ __( 'You need to have Neve Pro & WooCommerce installed to edit WooCommerce Product Rating block.', 'otter-blocks' ) }</Placeholder>,
		save: () => null
	});
}
