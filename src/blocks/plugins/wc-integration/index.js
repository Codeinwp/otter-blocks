/**
 * WordPress dependencies.
 */
import { assign } from 'lodash';

import { createHigherOrderComponent } from '@wordpress/compose';

import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import Edit from './edit.js';

const addAttribute = ( props ) => {
	if ( 'themeisle-blocks/review' === props.name ) {
		props.attributes = assign( props.attributes, {
			product: {
				type: 'number'
			}
		});
	}

	return props;
};

const withWooCommerceExtension = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		if ( 'themeisle-blocks/review' === props.name ) {
			return (
				<Edit
					BlockEdit={ BlockEdit }
					props={ props }
				/>
			);
		}

		return <BlockEdit { ...props } />;
	};
}, 'withWooCommerceExtension' );


if ( Boolean( window.themeisleGutenberg.hasNeveSupport.isBoosterActive ) && Boolean( window.themeisleGutenberg.hasWooCommerce ) ) {
	addFilter( 'blocks.registerBlockType', 'themeisle-gutenberg/review-woocommerce-extension-attributes', addAttribute );
	addFilter( 'editor.BlockEdit', 'themeisle-gutenberg/review-woocommerce-extension', withWooCommerceExtension );
}
