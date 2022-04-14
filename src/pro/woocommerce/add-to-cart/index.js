/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

import { useBlockProps } from '@wordpress/block-editor';

import { store as icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import edit from './edit.js';
import Inactive from '../../components/inactive/index.js';

const { name } = metadata;

if ( ! ( Boolean( window.otterPro.isActive ) && ! Boolean( window.otterPro.isExpired ) ) ) {
	edit = () => <Inactive
		icon={ icon }
		label={ metadata.title }
		blockProps={ useBlockProps() }
	/>;
}

if ( Boolean( window.otterPro.hasWooCommerce ) ) {
	registerBlockType( name, {
		...metadata,
		title: __( 'Product Add to Cart', 'otter-blocks' ),
		description: __( 'Display the add to cart section of your WooCommerce product.', 'otter-blocks' ),
		icon,
		keywords: [
			'woocommerce',
			'products',
			'add to cart'
		],
		supports: {
			inserter: Boolean( window.otterPro.isActive ) && ! Boolean( window.otterPro.isExpired )
		},
		edit,
		save: () => null
	});
}
