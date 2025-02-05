import classnames from 'classnames';
import hash from 'object-hash';

/**
 * WordPress dependencies
 */

import { Fragment, useContext, useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { store } from '@wordpress/icons';
import { dispatch, select, useSelect } from '@wordpress/data';
import { Button, ExternalLink, Notice, Placeholder, SelectControl, Spinner, TextControl } from '@wordpress/components';

/**
 * Internal dependencies
 */

import metadata from './block.json';
import Inspector from './inspector';
import useSettings from '../../../blocks/helpers/use-settings';
import { blockInit } from '../../../blocks/helpers/block-utility';
import DeferredWpOptionsSave from '../../../blocks/helpers/defered-wp-options-save';
import { _cssBlock, boxValues } from '../../../blocks/helpers/helper-functions';

const { attributes: defaultAttributes } = metadata;

/**
 * Stripe Field component
 * @param {import('./types').FormStripeFieldProps} props
 * @return
 */
const Edit = ({
	attributes,
	setAttributes,
	clientId,
	name
}) => {

	useEffect( () => {
		const unsubscribe = blockInit( clientId, defaultAttributes );

		if ( undefined === attributes.id ) {
			window.oTrk?.add({ block: name, action: 'block-created', groupID: attributes.id });
		}

		return () => unsubscribe( attributes.id );
	}, [ attributes.id ]);

	const [ getOption, updateOption, status ] = useSettings();
	const [ canRetrieveProducts, setCanRetrieveProducts ] = useState( false );
	const { createNotice } = dispatch( 'core/notices' );

	useEffect( () => {
		if ( 'loaded' === status ) {
			const apiKey = getOption( 'themeisle_stripe_api_key' );
			setCanRetrieveProducts( 'loaded' === status && 0 < apiKey?.length );
		}
	}, [ status, getOption ]);

	/**
	 * Create the form identification tag for Otter Options.
	 */
	useEffect( () => {
		if ( attributes.id && select( 'core/edit-widgets' ) ) {
			setAttributes({ fieldOptionName: `widget_${ attributes.id.slice( -8 ) }` });
		} else if ( attributes.id ) {
			setAttributes({ fieldOptionName: `${ hash({ url: window.location.pathname }) }_${ attributes.id.slice( -8 ) }` });
		}
	}, [ attributes.id ]);

	const { products, productsList, hasProductsRequestFailed, productsError, isLoadingProducts } = useSelect( select => {

		const {
			getStripeProducts,
			getResolutionError,
			isResolving
		} = select( 'themeisle-gutenberg/data' );

		const products = getStripeProducts();

		return {
			products,
			productsList: products ? products?.map( ( product ) => {
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
		} = select( 'themeisle-gutenberg/data' );

		const prices = attributes.product ? getStripeProductPrices( attributes.product ) : [];

		return {
			prices,
			pricesList: prices ? prices?.map( ( prices ) => {
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

	const [ view, setView ] = useState( 'default' );
	const [ meta, setMeta ] = useState({});

	useEffect( () => {
		const product = products?.find( ( i ) => attributes.product === i.id );
		const price = prices?.find( ( i ) => attributes.price === i.id );

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
		className: classnames({ 'is-placeholder': showPlaceholder }),
		id: attributes.id
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
		updateOption( 'themeisle_stripe_api_key', apiKey?.replace?.( /\s/g, '' ), __( 'Stripe API Key saved!', 'otter-pro' ), 'stripe-api-key', reset );
	};


	const saveProduct = ( fieldOptionName, product, price ) => {
		if ( ! product || ! price || ! fieldOptionName || ! Boolean( window.themeisleGutenberg?.hasPro ) ) {
			return;
		}

		( new DeferredWpOptionsSave() )
			.save( 'field_options', {
				fieldOptionName: attributes.fieldOptionName,
				fieldOptionType: 'stripe',
				stripe: {
					product: attributes.product ? attributes.product : undefined,
					price: attributes.price ? attributes.price : undefined
				}
			}, ( res, error ) => {
				if ( error ) {
					createNotice(
						'info',
						__( 'Error saving Stripe product on Form.', 'otter-pro' ),
						{
							type: 'snackbar',
							isDismissible: true,
							id: 'stripe-product-error'
						}
					);
				} else {
					createNotice(
						'success',
						__( 'Form Stripe product saved.', 'otter-pro' ),
						{
							type: 'snackbar',
							isDismissible: true,
							id: 'stripe-product'
						}
					);
				}
			});
	};

	const { canSaveData } = useSelect( select => {
		const isSavingPost = select( 'core/editor' )?.isSavingPost();
		const isPublishingPost = select( 'core/editor' )?.isPublishingPost();
		const isAutosaving = select( 'core/editor' )?.isAutosavingPost();
		const widgetSaving = select( 'core/edit-widgets' )?.isSavingWidgetAreas();

		return {
			canSaveData: ( ! isAutosaving && ( isSavingPost || isPublishingPost ) ) || widgetSaving
		};
	});

	/**
	 * Prevent saving data if the block is inside an AI block. This will prevent polluting the wp_options table.
	 */
	const isInsideAiBlock = useSelect( select => {
		const {
			getBlockParentsByBlockName
		} = select( 'core/block-editor' );

		const parents = getBlockParentsByBlockName( clientId, 'themeisle-blocks/content-generator' );
		return 0 < parents?.length;
	}, [ clientId ]);

	useEffect( () => {
		if ( canSaveData && ! isInsideAiBlock ) {
			saveProduct( attributes.fieldOptionName, attributes.product, attributes.price );
		}
	}, [ canSaveData ]);

	if ( showPlaceholder ) {
		return (
			<div { ...blockProps }>
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
					clientId={ clientId }
				/>

				<Placeholder
					icon={ store }
					label={ __( 'Stripe Checkout', 'otter-pro' ) }
				>
					{
						( 'loading' === status || 'saving' === status ) && (
							<div style={{ width: '100%' }}>
								<Spinner />
								{ __( 'Checking the API Key…', 'otter-pro' ) }
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
									label={ __( 'Stripe API Key', 'otter-pro' ) }
									type="text"
									placeholder={ __( 'Type here the Stripe API Key', 'otter-pro' ) }
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
										{ __( 'Save', 'otter-pro' ) }
									</Button>
								</div>

								<br />

								<ExternalLink href={ window.themeisleGutenberg.optionsPath }>{ __( 'You can also set it from Dashboard', 'otter-pro' ) }</ExternalLink>
							</div>
						)
					}

					{
						'error' === status && (
							<Fragment>
								{__( 'An error occurred during API Key checking.', 'otter-pro' )}
							</Fragment>
						)
					}

					{
						( 'loaded' === status && false === hasProductsRequestFailed && canRetrieveProducts ) && (
							<Fragment>
								{ ! isLoadingProducts && (
									<SelectControl
										label={ __( 'Select a product to display.', 'otter-pro' ) }
										value={ attributes.product }
										options={ [
											{
												label: __( 'Select a product', 'otter-pro' ),
												value: 'none'
											},
											...productsList
										] }
										onChange={ ( product ) => {
											setAttributes({ product: 'none' !== product ? product : undefined });
										} }
									/>
								) }

								{ ( ! isLoadingPrices && attributes.product ) && (
									<SelectControl
										label={ __( 'Select the price you want to display.', 'otter-pro' ) }
										value={ attributes.price }
										options={ [
											{
												label: __( 'Select a price', 'otter-pro' ),
												value: 'none'
											},
											...pricesList
										] }
										onChange={ ( price ) => {
											setAttributes({ price: 'none' !== price ? price : undefined });
										} }
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
				clientId={ clientId }
			/>

			<div { ...blockProps }>
				<style>
					{
						`#block-${clientId}` + _cssBlock([
							[ '--label-color', attributes.labelColor ],
							[ '--stripe-border-color', attributes.borderColor ],
							[ '--stripe-border-radius', boxValues( attributes.borderRadius ), attributes.borderRadius !== undefined ],
							[ '--stripe-border-width', boxValues( attributes.borderWidth ), attributes.borderRadius !== undefined ]
						])
					}
				</style>
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
					</Fragment>
				)}

				{ 'success' === view && ( attributes.successMessage || __( 'Your payment was successful. If you have any questions, please email orders@example.com.', 'otter-pro' ) ) }
				{ 'cancel' === view && ( attributes.cancelMessage || __( 'Your payment was unsuccessful. If you have any questions, please email orders@example.com.', 'otter-pro' ) ) }
			</div>
		</Fragment>
	);
};

export default Edit;
