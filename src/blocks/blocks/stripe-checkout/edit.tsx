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
	Button,
	ExternalLink,
	Notice,
	Placeholder,
	SelectControl,
	Spinner,
	TextControl
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
import useSettings from '../../helpers/use-settings';
import { dispatch } from '@wordpress/data';

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

	const [ getOption, updateOption, status ] = useSettings();
	const [ canRetrieveProducts, setCanRetrieveProducts ] = useState( false );

	useEffect( () => {
		if ( 'loaded' === status ) {
			const apiKey = getOption( 'themeisle_stripe_api_key' );
			setCanRetrieveProducts( 'loaded' === status && 0 < apiKey?.length );
		}
	}, [ status, getOption ]);

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
	}, [ canRetrieveProducts, status ]);

	const { prices, pricesList, hasPricesRequestFailed, pricesError, isLoadingPrices } = useSelect( select => {

		if ( ! canRetrieveProducts ) {
			return {
				prices: [],
				pricesList: [],
				hasPricesRequestFailed: true,
				pricesError: null,
				isLoadingPrices: false
			};
		}

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
			prices,
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
	}, [ attributes.product, canRetrieveProducts ]);

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

	const showPlaceholder = ( isLoadingProducts || isLoadingPrices || hasProductsRequestFailed || hasPricesRequestFailed || undefined === attributes.product || undefined === attributes.price || 'loaded' !== status || ! canRetrieveProducts );

	const blockProps = useBlockProps({
		className: classnames({ 'is-placeholder': showPlaceholder })
	});

	const [ apiKey, setAPIKey ] = useState( '' );

	const reset = () => {
		dispatch( 'themeisle-gutenberg/data' ).invalidateResolutionForStoreSelector( 'getStripeProducts' );
		dispatch( 'themeisle-gutenberg/data' ).invalidateResolutionForStoreSelector( 'getStripeProductPrices' );
		setCanRetrieveProducts( 0 < apiKey?.length );
		setAPIKey( '' );
	};

	const saveApiKey = () => {
		setCanRetrieveProducts( false );
		updateOption( 'themeisle_stripe_api_key', apiKey?.replace?.( /\s/g, '' ), __( 'Stripe API Key saved!', 'otter-blocks' ), reset );
	};

	if ( showPlaceholder ) {
		return (
			<div { ...blockProps }>
				<Placeholder
					icon={ store }
					label={ __( 'Stripe Checkout', 'otter-blocks' ) }
				>
					{
						( 'loading' === status || 'saving' === status ) && (
							<div style={{ width: '100%' }}>
								<Spinner />
								{ __( 'Checking the API Key...', 'otter-blocks' ) }
								<br /><br />
							</div>
						)
					}

					{
						(
							( hasProductsRequestFailed || hasPricesRequestFailed ) &&
							( 'loaded' === status ) &&
							( productsError?.message?.length || pricesError?.message?.length  )
						) && (
							<div style={{ width: '100%', marginLeft: '-15px', marginBottom: '10px' }}>
								<Notice
									status='error'
									isDismissible={ false }
								>
									{
										( hasProductsRequestFailed && productsError?.message ) || ( hasPricesRequestFailed && pricesError?.message )
									}
								</Notice>
							</div>
						)
					}

					{
						( ( 'loaded' === status ) && ( ( hasProductsRequestFailed && productsError?.message?.includes( 'Invalid API Key' ) ) || ! canRetrieveProducts ) ) && (
							<div style={{ display: 'flex', flexDirection: 'column' }}>

								<TextControl
									label={ __( 'Stripe API Key', 'otter-blocks' ) }
									type="text"
									placeholder={ __( 'Type here the Stripe API Key', 'otter-blocks' ) }
									value={ apiKey }
									className="components-placeholder__input"
									onChange={ setAPIKey }
									autoComplete='off'
								/>

								<div>
									<Button
										isPrimary
										type="submit"
										onClick={ saveApiKey }
									>
										{ __( 'Save', 'otter-blocks' ) }
									</Button>
								</div>

								<br />

								<ExternalLink href={ window.themeisleGutenberg.optionsPath }>{ __( 'You can also set it from Dashboard', 'otter-blocks' ) }</ExternalLink>
							</div>
						)
					}

					{
						'error' === status && (
							<Fragment>
								{__( 'An error occurred during API Key checking.', 'otter-blocks' )}
							</Fragment>
						)
					}

					{
						( 'loaded' === status && false === hasProductsRequestFailed && canRetrieveProducts ) && (
							<Fragment>
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
							</Fragment>
						)
					}
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
				apiKey={ apiKey }
				setAPIKey={ setAPIKey }
				saveApiKey={ saveApiKey }
				status={ status }
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
