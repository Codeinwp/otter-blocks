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

const { name } = metadata;

if ( Boolean( window.otterPro.hasWooCommerce ) ) {
	registerBlockType( name, {
		...metadata,
		title: __( 'Product Tabs', 'otter-blocks' ),
		description: __( 'Display the tabs for your WooCommerce product.', 'otter-blocks' ),
		icon,
		keywords: [
			'woocommerce',
			'products',
			'tabs'
		],
		edit: () => <div { ...useBlockProps() }><Placeholder>{ __( 'Tabs will be displayed here on the product page.', 'otter-blocks' ) }</Placeholder></div>,
		save: () => null
	});
}
