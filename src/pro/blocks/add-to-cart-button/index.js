/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

import { useBlockProps } from '@wordpress/block-editor';

import { Placeholder } from '@wordpress/components';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import edit from './edit.js';
import Inactive from '../../components/inactive/index.js';

const { cartIcon: icon } = window.otterUtils.icons;

const { name } = metadata;

if ( Boolean( window.otterPro.hasWooCommerce ) ) {
	if ( ! ( Boolean( window.otterPro.isActive ) && ! Boolean( window.otterPro.isExpired ) ) ) {
		edit = () => <Inactive
			icon={ icon }
			label={ metadata.title }
			blockProps={ useBlockProps() }
		/>;
	}

	registerBlockType( name, {
		title: __( 'Add to Cart Button', 'otter-blocks' ),
		...metadata,
		description: __( 'Display an Add to Cart button for your WooCommerce products. Powered by Otter.', 'otter-blocks' ),
		icon,
		keywords: [
			'woocommerce',
			'add to cart',
			'products'
		],
		supports: {
			inserter: Boolean( window.otterPro.isActive ) && ! Boolean( window.otterPro.isExpired )
		},
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
		description: __( 'Display an Add to Cart button for your WooCommerce products. Powered by Otter.', 'otter-blocks' ),
		icon,
		keywords: [
			'woocommerce',
			'add to cart',
			'products'
		],
		supports: {
			inserter: false
		},
		edit: () => <div { ...useBlockProps() }><Placeholder>{ __( 'You need to have WooCommerce installed to edit Add to Cart Button block.', 'otter-blocks' ) }</Placeholder></div>,
		save: () => null
	});
}
