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

registerBlockType( name, {
	title: __( 'Add to Cart Button', 'otter-blocks' ),
	...metadata,
	description: __( 'Display an Add to Cart button for your WooCommerce products.', 'otter-blocks' ),
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
