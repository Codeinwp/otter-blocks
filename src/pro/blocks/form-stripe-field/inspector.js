/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	ContrastChecker,
	InspectorControls, PanelColorSettings
} from '@wordpress/block-editor';

import {
	__experimentalBoxControl as BoxControl,
	Button,
	PanelBody,
	Placeholder,
	SelectControl,
	Spinner,
	TextControl
} from '@wordpress/components';
import { applyFilters } from '@wordpress/hooks';
import { Fragment, useState } from '@wordpress/element';
import { dispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */

import { InspectorHeader, Notice as OtterNotice, SyncColorPanel } from '../../../blocks/components';
import { FieldInputWidth, fieldTypesOptions, switchFormFieldTo } from '../../../blocks/blocks/form/common';
import { objectOrNumberAsBox } from '../../../blocks/helpers/helper-functions';


/**
 *
 * @param {import('./types').FormStripeFieldInspectorPros} props
 * @return {JSX.Element}
 */
const Inspector = ({
	attributes,
	setAttributes,
	clientId,
	productsList,
	pricesList,
	isLoadingProducts,
	isLoadingPrices,
	status,
	apiKey,
	setAPIKey,
	saveApiKey
}) => {

	// FormContext is not available here. This is a workaround.
	const selectForm = () => {
		const formParentId = Array.from( document.querySelectorAll( `.wp-block-themeisle-blocks-form:has(#block-${clientId})` ) )?.pop()?.dataset?.block;
		dispatch( 'core/block-editor' ).selectBlock( formParentId );
	};

	return (
		<InspectorControls>

			<PanelBody
				title={ __( 'Field Settings', 'otter-pro' ) }
			>
				<Button
					isSecondary
					variant="secondary"
					onClick={ () => selectForm?.() }
				>
					{ __( 'Back to the Form', 'otter-pro' ) }
				</Button>

				<SelectControl
					label={ __( 'Field Type', 'otter-pro' ) }
					value={ attributes.type ?? 'stripe' }
					options={ fieldTypesOptions() }
					onChange={ type => {
						if ( 'stripe' !== type ) {
							switchFormFieldTo( type, clientId, attributes );
						}
					}}
				/>

				<FieldInputWidth attributes={ attributes } setAttributes={ setAttributes } />

				<TextControl
					label={ __( 'Mapped Name', 'otter-pro' ) }
					help={ __( 'Allow easy identification of the field in features like Webhooks.', 'otter-pro' ) }
					value={ attributes.mappedName }
					onChange={ mappedName => setAttributes({ mappedName }) }
					placeholder={ __( 'product', 'otter-pro' ) }
				/>

				{ ! Boolean( window?.otterPro?.isActive ) && (
					<Fragment>
						<OtterNotice
							notice={ __( 'You need to activate Otter Pro.', 'otter-pro' ) }
							instructions={ __( 'You need to activate your Otter Pro license to use Pro features of Form Block.', 'otter-pro' ) }
						/>
					</Fragment>
				)

				}

				<div className="o-fp-wrap">
					{
						applyFilters( 'otter.feedback', '', 'form' ) // BUG: This is not working when added in a Settings/Style tab like in the other blocks.
					}
					{ applyFilters( 'otter.poweredBy', '' ) }
				</div>
			</PanelBody>

			<PanelBody
				title={ __( 'Stripe Product', 'otter-pro' ) }
			>
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
						onChange={ product => {
							window.oTrk?.add({ feature: 'stripe-field', featureComponent: 'product-changed' });
							setAttributes({
								product: 'none' !== product ? product : undefined,
								price: undefined
							});
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
						onChange={ price => {
							window.oTrk?.add({ feature: 'stripe-field', featureComponent: 'price-changed' });
							setAttributes({ price: 'none' !== price ? price : undefined });
						} }
					/>
				) }

				{ ( isLoadingProducts || isLoadingPrices ) && <Placeholder><Spinner /></Placeholder> }
			</PanelBody>


			<PanelColorSettings
				title={ __( 'Color', 'otter-pro' ) }
				initialOpen={ false }
				colorSettings={ [
					{
						value: attributes.labelColor,
						onChange: labelColor => setAttributes({ labelColor }),
						label: __( 'Label Color', 'otter-pro' )
					},
					{
						value: attributes.borderColor,
						onChange: borderColor => setAttributes({ borderColor }),
						label: __( 'Border Color', 'otter-pro' )
					}
				] }
			/>
			<PanelBody
				title={ __( 'Border', 'otter-pro' ) }
				initialOpen={ false }
			>
				<BoxControl
					label={ __( 'Border Width', 'otter-pro' ) }
					values={ attributes.borderWidth }
					onChange={ borderWidth => setAttributes({ borderWidth }) }
				/>

				<BoxControl
					label={ __( 'Border Radius', 'otter-pro' ) }
					values={ attributes.borderRadius }
					onChange={ borderRadius => setAttributes({ borderRadius }) }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Global Settings', 'otter-pro' ) }
				initialOpen={ false }
			>
				<TextControl
					label={ __( 'Change Stripe API Key', 'otter-pro' ) }
					type="text"
					placeholder={ __( 'Type a new Stripe API Key', 'otter-pro' ) }
					value={ apiKey }
					className="components-placeholder__input"
					autoComplete='off'
					onChange={ setAPIKey }
					help={ __( 'Changing the API key effects all Stripe Checkout blocks. You will have to refresh the page after changing your API keys.', 'otter-pro' ) }
				/>

				<Button
					isSecondary
					type="submit"
					onClick={ saveApiKey }
					isBusy={ 'loading' === status }
				>
					{ __( 'Save API Key', 'otter-pro' ) }
				</Button>
			</PanelBody>

		</InspectorControls>
	);
};

export default Inspector;
