/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Fragment, useState } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { InspectorControls } from '@wordpress/block-editor';

import {
	Button,
	Modal,
	PanelBody,
	Placeholder,
	SelectControl,
	Spinner,
	TextControl,
	TextareaControl,
	ExternalLink
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { ButtonToggleControl, Notice as OtterNotice, Notice, RichTextEditor } from '../../components/index.js';
import { setUtm } from '../../helpers/helper-functions';

const ProFeatures = () => {
	return (
		<PanelBody
			title={ __( 'Autoresponder', 'otter-blocks' ) }
			initialOpen={ false }
		>
			<TextControl
				label={__( 'Autoresponder Subject', 'otter-blocks' )}
				placeholder={__(
					'Thank you for your purchase',
					'otter-blocks'
				)}
				disabled
				help={__(
					'Enter the subject of the autoresponder email.',
					'otter-blocks'
				)}
				className="o-disabled"
			/>

			<TextareaControl
				label={ __( 'Autoresponder Body', 'otter-blocks' ) }
				placeholder={ __( 'We appreciate your recent purchase made on our website. You have received a promotional code, namely <strong>EXAMPLE</strong>, which can be applied during checkout on our <a href="https://themeisle.com/plugins/otter-blocks/">website</a>', 'otter-blocks' )}
				rows={2}
				help={ __( 'Enter the body of the autoresponder email.', 'otter-blocks' ) }
				disabled
				className="o-disabled"
			/>

			{
				( ! Boolean( window?.otterPro?.isActive ) && Boolean( window?.themeisleGutenberg?.hasPro ) ) && (
					<OtterNotice
						notice={ __( 'You need to activate Otter Pro.', 'otter-blocks' ) }
						instructions={ __( 'You need to activate your Otter Pro license to use Pro features of Stripe Checkout.', 'otter-blocks' ) }
					/>
				)
			}

			{
				( ! Boolean( window?.themeisleGutenberg?.hasPro ) ) && (
					<div>
						<Notice
							notice={ <ExternalLink href={ setUtm( window.themeisleGutenberg.upgradeLink, 'form-block' ) }>{ __( 'Unlock this with Otter Pro.', 'otter-blocks' ) }</ExternalLink> }
							variant="upsell"
						/>
						<p className="description">{ __( 'Automatically send follow-up emails to your users with the Autoresponder feature.', 'otter-blocks' ) }</p>
					</div>
				)
			}
		</PanelBody>
	);
};

const Inspector = ({
	attributes,
	setAttributes,
	view,
	setView,
	isLoadingProducts,
	productsList,
	isLoadingPrices,
	pricesList,
	apiKey,
	setAPIKey,
	saveApiKey,
	status
}) => {

	const [ isOpen, setOpen ] = useState( false );

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Settings', 'otter-blocks' ) }
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
						onChange={ product => {
							window.oTrk?.add({ feature: 'stripe-checkout', featureComponent: 'product-changed' });
							setAttributes({
								product: 'none' !== product ? product : undefined,
								price: undefined
							});
						} }
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
						onChange={ price => {
							window.oTrk?.add({ feature: 'stripe-checkout', featureComponent: 'price-changed' });
							setAttributes({ price: 'none' !== price ? price : undefined });
						} }
					/>
				) }

				{ ( isLoadingProducts || isLoadingPrices ) && <Placeholder><Spinner /></Placeholder> }
			</PanelBody>

			<PanelBody
				title={ __( 'Success & Cancel Messages', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<ButtonToggleControl
					label={ __( 'View', 'otter-blocks' ) }
					value={ view }
					options={[
						{
							label: __( 'Default', 'otter-blocks' ),
							value: 'default'
						},
						{
							label: __( 'Success', 'otter-blocks' ),
							value: 'success'
						},
						{
							label: __( 'Cancel', 'otter-blocks' ),
							value: 'cancel'
						}
					]}
					onChange={ setView }
				/>

				{ isOpen && (
					<Modal
						title={ __( 'Stripe Messages' ) }
						onRequestClose={() => setOpen( false )}
						shouldCloseOnClickOutside={ false }
					>
						<RichTextEditor
							label={ __( 'Success Message', 'otter-blocks' ) }
							value={ attributes.successMessage ?? __( 'Your payment was successful. If you have any questions, please email orders@example.com.', 'otter-blocks' ) }
							onChange={ successMessage => setAttributes({ successMessage }) }
							allowRawHTML
						/>

						<RichTextEditor
							label={ __( 'Cancel Message', 'otter-blocks' ) }
							value={ attributes.cancelMessage ?? __( 'Your payment was unsuccessful. If you have any questions, please email orders@example.com.', 'otter-blocks' ) }
							onChange={ cancelMessage => setAttributes({ cancelMessage }) }
							allowRawHTML
						/>
					</Modal>
				) }

				<Button
					variant="secondary"
					onClick={() => setOpen( true )}
				>
					{ __( 'Open Editor', 'otter-blocks' ) }
				</Button>
			</PanelBody>

			<PanelBody
				title={ __( 'Global Settings', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<TextControl
					label={ __( 'Change Stripe API Key', 'otter-blocks' ) }
					type="text"
					placeholder={ __( 'Type a new Stripe API Key', 'otter-blocks' ) }
					value={ apiKey }
					className="components-placeholder__input"
					autoComplete='off'
					onChange={ setAPIKey }
					help={ __( 'Changing the API key effects all Stripe Checkout blocks. You will have to refresh the page after changing your API keys.', 'otter-blocks' ) }
				/>

				<Button
					isSecondary
					type="submit"
					onClick={ saveApiKey }
					isBusy={ 'loading' === status }
				>
					{ __( 'Save API Key', 'otter-blocks' ) }
				</Button>
			</PanelBody>

			{ applyFilters(
				'otter.stripe-checkout.inspector',
				<ProFeatures />,
				attributes,
				setAttributes
			) }
		</InspectorControls>
	);
};

export default Inspector;
