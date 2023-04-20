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
	PanelBody,
	SelectControl,
	TextareaControl,
	TextControl,
	ToggleControl
} from '@wordpress/components';

import { getActiveStyle, changeActiveStyle } from '../../../helpers/helper-functions.js';
import { fieldTypesOptions, HideFieldLabelToggle, switchFormFieldTo } from '../common';
import { useContext } from '@wordpress/element';
import { FormContext } from '../edit.js';

const styles = [
	{
		label: __( 'Inline List', 'otter-blocks' ),
		value: 'inline-list'
	}
];

/**
 *
 * @param {import('./types').FormMultipleChoiceInputInspectorProps} props
 * @returns {JSX.Element}
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
						if ( 'radio' === type || 'checkbox' === type || 'select' === type ) {
							setAttributes({ type });
							return;
						}
						switchFormFieldTo( type, clientId, attributes );
					}}
				/>

				<TextControl
					label={ __( 'Label', 'otter-blocks' ) }
					value={ attributes.label }
					onChange={ label => setAttributes({ label }) }
				/>

				<HideFieldLabelToggle attributes={ attributes } setAttributes={ setAttributes } />

				<TextareaControl
					label={ __( 'Options', 'otter-blocks' ) }
					help={ __( 'Enter each option in a different line.', 'otter-blocks' ) }
					value={ attributes.options }
					onChange={ ( options ) => setAttributes({ options }) }
				/>

				<TextControl
					label={ __( 'Help Text', 'otter-blocks' ) }
					value={ attributes.helpText }
					onChange={ helpText => setAttributes({ helpText }) }
				/>

				{
					'select' !== attributes?.type && (
						<ToggleControl
							label={ __( 'Inline list', 'otter-blocks' ) }
							checked={ Boolean( getActiveStyle( styles, attributes.className ) ) }
							onChange={ value => {
								const classes = changeActiveStyle( attributes.className, styles, value ? 'inline-list' : undefined );
								setAttributes({ className: classes });
							} }
						/>
					)
				}

				{
					'select' === attributes?.type && (
						<ToggleControl
							label={ __( 'Multiple selection', 'otter-blocks' ) }
							checked={ attributes.multipleSelection }
							onChange={ multipleSelection => setAttributes({ multipleSelection }) }
						/>
					)
				}

				<ToggleControl
					label={ __( 'Required', 'otter-blocks' ) }
					help={ __( 'If enabled, the input field must be filled out before submitting the form.', 'otter-blocks' ) }
					checked={ attributes.isRequired }
					onChange={ isRequired => setAttributes({ isRequired }) }
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
	);
};

export default Inspector;
