/**
 * External dependencies
 */
import classnames from 'classnames';

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

import {
	Fragment,
	useEffect,
	useState
} from '@wordpress/element';

import { useSelect } from '@wordpress/data';

import { store } from '@wordpress/icons';

/**
 * Internal dependencies.
 */
import { StripeCheckoutProps } from './types';
import Inspector from './inspector';

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
			productsList: products ? products?.map( ( product: Product ) => {
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

	const { prices, pricesList, hasPricesRequestFailed, pricesError, isLoadingPrices } = useSelect( select => {
		const {
			getStripeProductPrices,
			getResolutionError,
			isResolving
		} : {
			getStripeProductPrices: Function,
			getResolutionError: Function,
			isResolving: Function
		} = select( 'themeisle-gutenberg/data' );

		const prices = attributes.product ? getStripeProductPrices( attributes.product ) : [];

		return {
			prices: attributes.product ? getStripeProductPrices( attributes.product ) : [],
			pricesList: prices ? prices?.map( ( prices: Price ) => {
				return {
					label: `${ prices?.currency } ${ prices?.unit_amount } (id:${ prices?.id })`,
					value: prices?.id
				};
			}) : [],
			hasPricesRequestFailed: Boolean( getResolutionError( 'getStripeProductPrices', [ attributes.product ]) ),
			pricesError: getResolutionError( 'getStripeProductPrices', [ attributes.product ]),
			isLoadingPrices: isResolving( 'getStripeProductPrices', [ attributes.product ])
		};
	}, [ attributes.product ]);

	const [ view, setView ] = useState<string>( 'default' );
	const [ meta, setMeta ] = useState<any>({});

	useEffect( () => {
		const product = products?.find( ( i: Product ) => attributes.product == i.id );
		const price = prices?.find( ( i: Price ) => attributes.price == i.id );

		let unitAmount;

		if ( price?.unit_amount ) {
			unitAmount = price?.unit_amount / 100;
			unitAmount = unitAmount.toLocaleString( 'en-US', { style: 'currency', currency: price?.currency });
		}

		setMeta({
			name: product?.name,
			price: unitAmount,
			description: product?.description,
			image: product?.images?.[0] || undefined
		});
	}, [ products, prices, attributes.price ]);

	const showPlaceholder = ( isLoadingProducts || isLoadingPrices || hasProductsRequestFailed || hasPricesRequestFailed || undefined === attributes.product || undefined === attributes.price );

	const blockProps = useBlockProps({
		className: classnames({ 'is-placeholder': showPlaceholder })
	});

	if ( showPlaceholder ) {
		return (
			<div { ...blockProps }>
				<Placeholder
					icon={ store }
					label={ __( 'Stripe Checkout', 'otter-blocks' ) }
					instructions={ ( hasProductsRequestFailed && productsError?.message ) || ( hasPricesRequestFailed && pricesError?.message ) }
				>
					{ ! isLoadingProducts && (
						<SelectControl
							label={ __( 'Select a product to display.', 'otter-blocks' ) }
							value={ attributes.product }
							options={ [
								{
									label: __( 'Select a product', 'otter-blocks' ),
									value: 'none'
								},
								...productsList
							] }
							onChange={ ( product: string ) => setAttributes({ product: 'none' !== product ? product : undefined }) }
						/>
					) }

					{ ( ! isLoadingPrices && attributes.product ) && (
						<SelectControl
							label={ __( 'Select the price you want to display.', 'otter-blocks' ) }
							value={ attributes.price }
							options={ [
								{
									label: __( 'Select a price', 'otter-blocks' ),
									value: 'none'
								},
								...pricesList
							] }
							onChange={ ( price: string ) => setAttributes({ price: 'none' !== price ? price : undefined }) }
						/>
					) }

					{ ( isLoadingProducts || isLoadingPrices ) && <Placeholder><Spinner /></Placeholder> }
				</Placeholder>
			</div>
		);
	}

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				view={ view }
				setView={ setView }
				isLoadingProducts={ isLoadingProducts }
				productsList={ productsList }
				isLoadingPrices={ isLoadingPrices }
				pricesList={ pricesList }
			/>

			<div { ...blockProps }>
				{ 'default' === view && (
					<Fragment>
						<div className="o-stripe-checkout">
							{ undefined !== meta?.image && (
								<img src={ meta.image } alt={ meta?.description } />
							)}

							<div className="o-stripe-checkout-description">
								<h3>{ meta?.name }</h3>
								<h5>{ meta?.price }</h5>
							</div>
						</div>

						<a>{ __( 'Checkout', 'otter-blocks' ) }</a>
					</Fragment>
				)}

				{ 'success' === view && ( attributes.successMessage || __( 'Your payment was successful. If you have any questions, please email orders@example.com.', 'otter-blocks' ) ) }
				{ 'cancel' === view && ( attributes.cancelMessage || __( 'Your payment was unsuccessful. If you have any questions, please email orders@example.com.', 'otter-blocks' ) ) }
			</div>
		</Fragment>
	);
};

export default Edit;
