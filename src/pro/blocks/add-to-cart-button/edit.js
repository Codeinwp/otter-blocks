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
const { SelectProducts } = window.otterComponents;

import Inspector from './inspector.js';

/**
 * Add To Card Button component
 * @param {import('./types.js').AddToCartButtonProps} props
 * @return
 */
const Edit = ({
	attributes,
	setAttributes
}) => {
	const blockProps = useBlockProps();

	return (
		<>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

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
						label={ __( 'Add to Cart Button', 'otter-pro' ) }
						instructions={ __( 'Select a WooCommerce product for the Add to Cart button.', 'otter-pro' ) }
					>
						<SelectProducts
							label={ __( 'Select Product', 'otter-pro' ) }
							hideLabelFromVision
							value={ attributes.product || '' }
							onChange={ product => {
								window.oTrk?.add({ feature: 'add-to-cart', featureComponent: 'product-changed' });

								setAttributes({ product: Number( product ) });
							} }
						/>
					</Placeholder>
				) }
			</div>
		</>
	);
};

export default Edit;
