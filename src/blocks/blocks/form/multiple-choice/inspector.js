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

/**
 *
 * @param {import('./types').FormMultipleChoiceInputInspectorProps} props
 * @returns {JSX.Element}
 */
const Inspector = ({
	attributes,
	setAttributes,
	selectParent,
	switchToTextarea,
	switchToInput
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
							label: __( 'Text', 'otter-blocks' ),
							value: 'text'
						},
						{
							label: __( 'Email', 'otter-blocks' ),
							value: 'email'
						},
						{
							label: __( 'Date', 'otter-blocks' ),
							value: 'date'
						},
						{
							label: __( 'Number', 'otter-blocks' ),
							value: 'number'
						},
						{
							label: __( 'Textarea', 'otter-blocks' ),
							value: 'textarea'
						},
						{
							label: __( 'Radio', 'otter-blocks' ),
							value: 'radio'
						},
						{
							label: __( 'Checkbox', 'otter-blocks' ),
							value: 'checkbox'
						},
						{
							label: __( 'Select', 'otter-blocks' ),
							value: 'select'
						}
					] }
					onChange={ type => {
						if ( 'textarea' === type ) {
							switchToTextarea?.();
							return;
						} else if ( 'radio' === type || 'checkbox' === type || 'select' === type ) {
							setAttributes({ type });
						} else {
							switchToInput?.( type );
						}
					}}
				/>

				<TextControl
					label={ __( 'Label', 'otter-blocks' ) }
					value={ attributes.label }
					onChange={ label => setAttributes({ label }) }
				/>

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
