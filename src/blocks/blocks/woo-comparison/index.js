/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

import { Placeholder } from '@wordpress/components';

/**
 * Internal dependencies
 */
import './editor.scss';
import { faIcon as icon } from '../../helpers/icons.js';
import attributes from './attributes.js';
import edit from './edit.js';

if ( Boolean( window.themeisleGutenberg.hasNeveSupport.isBoosterActive ) && Boolean( window.themeisleGutenberg.hasWooCommerce ) && Boolean( window.themeisleGutenberg.hasNeveSupport.wooComparison ) ) {
	registerBlockType( 'themeisle-blocks/woo-comparison', {
		title: __( 'WooCommerce Comparison Table', 'otter-blocks' ),
		description: __( 'A way to compare different WooCommerce products made on the website.', 'otter-blocks' ),
		icon,
		category: 'themeisle-blocks',
		keywords: [
			'woocommerce',
			'comparison',
			'table'
		],
		attributes,
		supports: {
			html: false
		},
		edit,
		save: () => null
	});
} else {
	registerBlockType( 'themeisle-blocks/woo-comparison', {
		title: __( 'WooCommerce Comparison Table', 'otter-blocks' ),
		description: __( 'A way to compare different WooCommerce products made on the website.', 'otter-blocks' ),
		icon,
		category: 'themeisle-blocks',
		keywords: [
			'woocommerce',
			'comparison',
			'table'
		],
		attributes,
		supports: {
			inserter: false
		},
		edit: () => <Placeholder>{ __( 'You need to have Neve Pro & WooCommerce installed to edit WooCommerce Comparison Table block.', 'otter-blocks' ) }</Placeholder>,
		save: () => null
	});
}

