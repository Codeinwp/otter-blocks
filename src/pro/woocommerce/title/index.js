/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

import { useBlockProps } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import edit from './edit.js';
import Inactive from '../../components/inactive/index.js';

const { cartIcon: icon } = window.otterUtils.icons;

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
		title: __( 'Product Title', 'otter-blocks' ),
		description: __( 'Display the title of your WooCommerce product.', 'otter-blocks' ),
		icon,
		keywords: [
			'woocommerce',
			'products',
			'title'
		],
		supports: {
			inserter: Boolean( window.otterPro.isActive ) && ! Boolean( window.otterPro.isExpired )
		},
		edit,
		save: () => null
	});
}
