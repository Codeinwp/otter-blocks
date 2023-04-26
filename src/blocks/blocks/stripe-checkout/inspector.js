/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { InspectorControls } from '@wordpress/block-editor';

import {
	Button,
	Modal,
	PanelBody,
	Placeholder,
	SelectControl,
	Spinner,
	TextareaControl
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { ButtonToggleControl, RichTextEditor } from '../../components/index.js';
import { useState } from '@wordpress/element';

const Inspector = ({
	attributes,
	setAttributes,
	view,
	setView,
	isLoadingProducts,
	productsList,
	isLoadingPrices,
	pricesList
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
						onChange={ price => setAttributes({ price: 'none' !== price ? price : undefined }) }
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
		</InspectorControls>
	);
};

export default Inspector;
