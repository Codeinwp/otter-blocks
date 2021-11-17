/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	Disabled,
	Placeholder
} from '@wordpress/components';

import { store } from '@wordpress/icons';

import ServerSideRender from '@wordpress/server-side-render';

/**
 * Internal dependencies.
 */
import SelectProducts from '../../../components/select-products-control/index.js';

const Edit = ({
	attributes,
	setAttributes
}) => {
	if ( ! attributes.product ) {
		return (
			<Placeholder
				icon={ store }
				label={ __( 'Product Image', 'otter-blocks' ) }
				instructions={ __( 'Select a WooCommerce product for the Image gallery.', 'otter-blocks' ) }
			>
				<SelectProducts
					label={ __( 'Select Product', 'otter-blocks' ) }
					hideLabelFromVision
					value={ attributes.product }
					onChange={ product => setAttributes({ product: Number( product ) }) }
				/>
			</Placeholder>
		);
	}

	return (
		<Disabled>
			<ServerSideRender
				block="themeisle-blocks/product-image"
				attributes={ { ...attributes } }
			/>
		</Disabled>
	);
};

export default Edit;
