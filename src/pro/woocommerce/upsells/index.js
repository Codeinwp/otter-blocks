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
import Inactive from '../../components/inactive/index.js';

const { name } = metadata;

if ( ! ( Boolean( window.otterPro.isActive ) && ! Boolean( window.otterPro.isExpired ) ) ) {
	edit = () => <Inactive
		icon={ icon }
		label={ metadata.title }
		blockProps={ useBlockProps() }
	/>;
} else {
	edit = () => <div { ...useBlockProps() }><Placeholder>{ __( 'Upsell products will be displayed here on the product page.', 'otter-blocks' ) }</Placeholder></div>;
}

if ( Boolean( window.otterPro.hasWooCommerce ) ) {
	registerBlockType( name, {
		...metadata,
		title: __( 'Product Upsells', 'otter-blocks' ),
		description: __( 'Display upsells for your WooCommerce product.', 'otter-blocks' ),
		icon,
		keywords: [
			'woocommerce',
			'products',
			'upsells'
		],
		supports: {
			inserter: Boolean( window.otterPro.isActive ) && ! Boolean( window.otterPro.isExpired )
		},
		edit,
		save: () => null
	});
}
