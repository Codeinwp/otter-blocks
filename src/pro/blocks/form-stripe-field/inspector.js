/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	InspectorControls
} from '@wordpress/block-editor';

import {
	Button,
	PanelBody, Placeholder,
	SelectControl, Spinner,
	TextControl
} from '@wordpress/components';
import { applyFilters } from '@wordpress/hooks';
import { Fragment } from '@wordpress/element';
import { dispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */

import { Notice as OtterNotice } from '../../../blocks/components';
import { fieldTypesOptions, switchFormFieldTo } from '../../../blocks/blocks/form/common';


/**
 *
 * @param {import('./types').FormHiddenFieldInspectorPros} props
 * @returns {JSX.Element}
 */
const Inspector = ({
	attributes,
	setAttributes,
	clientId,
	productsList,
	pricesList,
	isLoadingProducts,
	isLoadingPrices
}) => {

	// FormContext is not available here. This is a workaround.
	const selectForm = () => {
		const formParentId = Array.from( document.querySelectorAll( `.wp-block-themeisle-blocks-form:has(#block-${clientId})` ) )?.pop()?.dataset?.block;
		dispatch( 'core/block-editor' ).selectBlock( formParentId );
	};

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Field Settings', 'otter-blocks' ) }
			>
				<Button
					isSecondary
					variant="secondary"
					onClick={ () => selectForm?.() }
				>
					{ __( 'Back to the Form', 'otter-blocks' ) }
				</Button>

				<SelectControl
					label={ __( 'Field Type', 'otter-blocks' ) }
					value={ attributes.type ?? 'stripe' }
					options={ fieldTypesOptions() }
					onChange={ type => {
						if ( 'stripe' !== type ) {
							switchFormFieldTo( type, clientId, attributes );
						}
					}}
				/>

				<TextControl
					label={ __( 'Mapped Name', 'otter-blocks' ) }
					help={ __( 'Allow easy identification of the field with features like: webhooks', 'otter-blocks' ) }
					value={ attributes.mappedName }
					onChange={ mappedName => setAttributes({ mappedName }) }
					placeholder={ __( 'product', 'otter-blocks' ) }
				/>

				{ ! Boolean( window?.otterPro?.isActive ) && (
					<Fragment>
						<OtterNotice
							notice={ __( 'You need to activate Otter Pro.', 'otter-blocks' ) }
							instructions={ __( 'You need to activate your Otter Pro license to use Pro features of Form Block.', 'otter-blocks' ) }
						/>
					</Fragment>
				)

				}

				<div className="o-fp-wrap">
					{ applyFilters( 'otter.feedback', '', 'form' ) }
					{ applyFilters( 'otter.poweredBy', '' ) }
				</div>
			</PanelBody>

			<PanelBody
				title={ __( 'Stripe Settings', 'otter-blocks' ) }
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


		</InspectorControls>
	);
};

export default Inspector;
