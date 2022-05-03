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
import attributes from './attributes.js';
import edit from './edit.js';
import Inactive from '../../components/inactive/index.js';

const { faIcon: icon } = window.otterUtils.icons;

const { name } = metadata;

if ( Boolean( window.otterPro.hasWooCommerce ) && Boolean( window.otterPro.hasNeveSupport.wooComparison ) ) {
	if ( ! ( Boolean( window.otterPro.isActive ) && ! Boolean( window.otterPro.isExpired ) ) ) {
		edit = () => <Inactive
			icon={ icon }
			label={ metadata.title }
			blockProps={ useBlockProps() }
		/>;
	}

	registerBlockType( name, {
		...metadata,
		title: __( 'WooCommerce Comparison Table', 'otter-blocks' ),
		description: __( 'A way to compare different WooCommerce products made on the website. Powered by Otter.', 'otter-blocks' ),
		icon,
		keywords: [
			'woocommerce',
			'comparison',
			'table'
		],
		attributes,
		supports: {
			inserter: Boolean( window.otterPro.isActive ) && ! Boolean( window.otterPro.isExpired )
		},
		edit,
		save: () => null
	});
} else {
	registerBlockType( name, {
		...metadata,
		title: __( 'WooCommerce Comparison Table', 'otter-blocks' ),
		description: __( 'A way to compare different WooCommerce products made on the website. Powered by Otter.', 'otter-blocks' ),
		icon,
		keywords: [
			'woocommerce',
			'comparison',
			'table'
		],
		attributes,
		supports: {
			inserter: false
		},
		edit: () => <div { ...useBlockProps() }><Placeholder>{ __( 'You need to have Neve Pro & WooCommerce installed to edit WooCommerce Comparison Table block.', 'otter-blocks' ) }</Placeholder></div>,
		save: () => null
	});
}

