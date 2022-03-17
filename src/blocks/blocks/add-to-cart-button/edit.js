/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { useBlockProps } from '@wordpress/block-editor';

import {
	Disabled,
	Placeholder
} from '@wordpress/components';

import { store } from '@wordpress/icons';

import ServerSideRender from '@wordpress/server-side-render';

/**
 * Internal dependencies.
 */
import SelectProducts from '../../components/select-products-control/index.js';

/**
 * Add To Card Button component
 * @param {import('./types.js').AddToCartButtonProps} props
 * @returns
 */
const Edit = ({
	attributes,
	setAttributes
}) => {
	const blockProps = useBlockProps();

	return (
		<div { ...blockProps }>
			{ attributes.product ? (
				<Disabled>
					<ServerSideRender
						block="themeisle-blocks/add-to-cart-button"
						attributes={ { ...attributes } }
					/>
				</Disabled>
			) : (
				<Placeholder
					icon={ store }
					label={ __( 'Add to Cart Button', 'otter-blocks' ) }
					instructions={ __( 'Select a WooCommerce product for the Add to Cart button.', 'otter-blocks' ) }
				>
					<SelectProducts
						label={ __( 'Select Product', 'otter-blocks' ) }
						hideLabelFromVision
						value={ attributes.product }
						onChange={ product => setAttributes({ product: Number( product ) }) }
					/>
				</Placeholder>
			) }
		</div>
	);
};

export default Edit;
