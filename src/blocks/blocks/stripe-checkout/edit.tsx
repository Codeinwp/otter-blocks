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

type Product = {
	id: string,
	name: string
};

type Price = {
	id: string,
	currency: string,
	unit_amount: number
};

/**
  * Stripe Checkout component
  * @param props
  * @returns
  */
const Edit = ({
	attributes,
	setAttributes
}: StripeCheckoutProps ) => {
	const { products, productsList, hasProductsRequestFailed, productsError, isLoadingProducts } = useSelect( select => {
		const {
			getStripeProducts,
			getResolutionError,
			isResolving
		} : {
			getStripeProducts: Function,
			getResolutionError: Function,
			isResolving: Function
		} = select( 'themeisle-gutenberg/data' );

		const products = getStripeProducts();

		return {
			products,
			productsList: products?.data ? products?.data.map( ( product: Product ) => {
				return {
					label: `${ product?.name } (id:${ product?.id })`,
					value: product?.id
				};
			}) : [],
			hasProductsRequestFailed: Boolean( getResolutionError( 'getStripeProducts' ) ),
			productsError: getResolutionError( 'getStripeProducts' ),
			isLoadingProducts: isResolving( 'getStripeProducts' )
		};
	}, []);

	const { prices, hasPricesRequestFailed, pricesError, isLoadingPrices } = useSelect( select => {
		const {
			getStripeProductPrices,
			getResolutionError,
			isResolving
		} : {
			getStripeProductPrices: Function,
			getResolutionError: Function,
			isResolving: Function
		} = select( 'themeisle-gutenberg/data' );

		const prices = attributes.product && getStripeProductPrices( attributes.product );

		return {
			prices,

			// pricesList: prices?.data ? prices?.data.map( ( prices: Price ) => {
			// 	return {
			// 		label: `${ prices?.currency } ${ prices?.unit_amount } (id:${ prices?.id })`,
			// 		value: prices?.id
			// 	};
			// }) : [],
			hasPricesRequestFailed: Boolean( getResolutionError( 'getStripeProductPrices', [ attributes.product ]) ),
			pricesError: getResolutionError( 'getStripeProductPrices', [ attributes.product ]),
			isLoadingPrices: isResolving( 'getStripeProductPrices', [ attributes.product ])
		};
	}, [ attributes.product ]);

	console.log( prices, hasPricesRequestFailed, pricesError, isLoadingPrices );

	const blockProps = useBlockProps();

	if ( isLoadingProducts || isLoadingPrices || hasProductsRequestFailed || hasPricesRequestFailed || ! attributes.product || ! attributes.price ) {
		return (
			<div { ...blockProps }>
				<Placeholder
					icon={ store }
					label={ __( 'Stripe Checkout', 'otter-blocks' ) }
					instructions={ ( hasProductsRequestFailed && productsError?.message ) || ( hasPricesRequestFailed && pricesError?.message ) }
				>
					{ isLoadingProducts && (
						<Placeholder><Spinner /></Placeholder>
					) }

					{ ! isLoadingProducts && (
						<SelectControl
							label={ __( 'Select a product to display.', 'otter-blocks' ) }
							value={ attributes.product }
							options={ productsList }
							onChange={ ( product: string ) => setAttributes({ product }) }
						/>
					) }

					{ isLoadingPrices && (
						<Placeholder><Spinner /></Placeholder>
					) }

					{/* { ! isLoadingPrices && (
						<SelectControl
							label={ __( 'Select the price you want to display.', 'otter-blocks' ) }
							value={ attributes.price }
							options={ pricesList }
							onChange={ ( price: string ) => setAttributes({ price }) }
						/>
					) } */}
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
