/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { useBlockProps } from '@wordpress/block-editor';

import {
	Placeholder,
	SelectControl,
	Spinner
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import { store } from '@wordpress/icons';

/**
 * Internal dependencies.
 */
import { StripeCheckoutProps } from './types';

/**
  * Stripe Checkout component
  * @param props
  * @returns
  */
const Edit = ({
	attributes,
	setAttributes
}: StripeCheckoutProps ) => {
	const { products, hasRequestFailed, errors, isLoadingProducts } = useSelect( select => {
		const {
			getStripeProducts,
			getResolutionError,
			isResolving
		} : {
			getStripeProducts: Function,
			getResolutionError: Function,
			isResolving: Function
		} = select( 'themeisle-gutenberg/data' );

		return {
			products: getStripeProducts(),
			hasRequestFailed: Boolean( getResolutionError( 'getStripeProducts' ) ),
			errors: getResolutionError( 'getStripeProducts' ),
			isLoadingProducts: isResolving( 'getStripeProducts' )
		};
	}, []);

	const blockProps = useBlockProps();

	if ( isLoadingProducts || hasRequestFailed || undefined === attributes.product ) {
		return (
			<div { ...blockProps }>
				<Placeholder
					icon={ store }
					label={ __( 'Stripe Checkout', 'otter-blocks' ) }
					instructions={ hasRequestFailed ? errors?.message : __( 'Select a product for the Stripe Checkout.', 'otter-blocks' ) }
				>
					{ isLoadingProducts && (
						<Placeholder><Spinner /></Placeholder>
					) }

					{ ! isLoadingProducts && (
						<SelectControl
							value={ attributes.product }
							options={ products }
							onChange={ ( value: string ) => setAttributes({ product: value }) }
						/>
					) }
				</Placeholder>
			</div>
		);
	}

	return (
		<div { ...blockProps }>
			<p>Product Selected</p>
		</div>
	);
};

export default Edit;
