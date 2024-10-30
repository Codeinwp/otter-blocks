/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	InspectorControls,
	PanelColorSettings
} from '@wordpress/block-editor';

import {
	Button,
	ExternalLink,
	PanelBody,
	SelectControl,
	TextControl,
	ToggleControl
} from '@wordpress/components';
import { Fragment, useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { FieldInputWidth, fieldTypesOptions, HideFieldLabelToggle, mappedNameInfo, switchFormFieldTo } from '../common';
import { FormContext } from '../edit';
import { HTMLAnchorControl } from '../../../components';

/**
 *
 * @param {import('./types').FormInputProps} props
 * @return {JSX.Element}
 */
const Inspector = ({
	attributes,
	setAttributes,
	clientId
}) => {

	const {
		selectForm
	} = useContext( FormContext );

	return (
		<Fragment>
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
						value={ attributes.type }
						options={ fieldTypesOptions() }
						onChange={ type => {
							if ( 'textarea' === type || 'radio' === type || 'checkbox' === type || 'select' === type || 'file' === type || 'hidden' === type || 'stripe' === type ) {
								switchFormFieldTo( type, clientId, attributes );
								return;
							}

							setAttributes({ type });
						}}
					/>

					<TextControl
						label={ __( 'Label', 'otter-blocks' ) }
						value={ attributes.label }
						onChange={ label => setAttributes({ label }) }
					/>

					<HideFieldLabelToggle attributes={ attributes } setAttributes={ setAttributes } />

					<FieldInputWidth attributes={ attributes } setAttributes={ setAttributes } />

					{
						( 'date' !== attributes.type || undefined === attributes.type ) && (
							<TextControl
								label={ __( 'Placeholder', 'otter-blocks' ) }
								value={ attributes.placeholder }
								onChange={ placeholder => setAttributes({ placeholder }) }
							/>
						)
					}

					<TextControl
						label={ __( 'Help Text', 'otter-blocks' ) }
						value={ attributes.helpText }
						onChange={ helpText => setAttributes({ helpText }) }
					/>

					<ToggleControl
						label={ __( 'Required', 'otter-blocks' ) }
						help={ __( 'If enabled, the input field must be filled out before submitting the form.', 'otter-blocks' ) }
						checked={ attributes.isRequired }
						onChange={ isRequired => setAttributes({ isRequired }) }
					/>

					<TextControl
						label={ __( 'Default Value', 'otter-blocks' ) }
						value={ attributes.defaultValue }
						onChange={ defaultValue => setAttributes({ defaultValue }) }
					/>

					<TextControl
						label={ __( 'Mapped Name', 'otter-blocks' ) }
						help={ mappedNameInfo }
						value={ attributes.mappedName }
						onChange={ mappedName => setAttributes({ mappedName }) }
						placeholder={ __( 'first_name', 'otter-blocks' ) }
					/>
				</PanelBody>

				<PanelColorSettings
					title={ __( 'Color', 'otter-blocks' ) }
					initialOpen={ false }
					colorSettings={ [
						{
							value: attributes.labelColor,
							onChange: labelColor => setAttributes({ labelColor }),
							label: __( 'Label Color', 'otter-blocks' )
						}
					] }
				/>
			</InspectorControls>
			<HTMLAnchorControl
				value={ attributes.id }
				onChange={ value => setAttributes({ id: value }) }
			/>
		</Fragment>
	);
};

export default Inspector;
