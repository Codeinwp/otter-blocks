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
import { HideFieldLabelToggle, switchFormFieldTo } from '../common';

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
	selectParent,
	clientId
}) => {
	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Field Settings', 'otter-blocks' ) }
			>
				<Button
					isSecondary
					variant="secondary"
					onClick={ () => selectParent?.() }
				>
					{ __( 'Back to the Form', 'otter-blocks' ) }
				</Button>

				<SelectControl
					label={ __( 'Field Type', 'otter-blocks' ) }
					value={ attributes.type }
					options={ [
						{
							label: __( 'Checkbox', 'otter-blocks' ),
							value: 'checkbox'
						},
						{
							label: __( 'Date', 'otter-blocks' ),
							value: 'date'
						},
						{
							label: __( 'Email', 'otter-blocks' ),
							value: 'email'
						},
						{
							label: __( 'Number', 'otter-blocks' ),
							value: 'number'
						},
						{
							label: __( 'Radio', 'otter-blocks' ),
							value: 'radio'
						},
						{
							label: __( 'Select', 'otter-blocks' ),
							value: 'select'
						},
						{
							label: __( 'Text', 'otter-blocks' ),
							value: 'text'
						},
						{
							label: __( 'Textarea', 'otter-blocks' ),
							value: 'textarea'
						},
						{
							label: __( 'Url', 'otter-blocks' ),
							value: 'url'
						}
					] }
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
