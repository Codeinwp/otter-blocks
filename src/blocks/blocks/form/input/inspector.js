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
	TextControl,
	ToggleControl
} from '@wordpress/components';

/**
 *
 * @param {import('./types').FormInputProps} props
 * @returns {JSX.Element}
 */
const Inspector = ({
	attributes,
	setAttributes,
	selectParent,
	switchToTextarea
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
						}
					] }
					onChange={ type => {
						if ( 'textarea' === type ) {
							switchToTextarea?.();
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

				<TextControl
					label={ __( 'Placeholder', 'otter-blocks' ) }
					value={ attributes.placeholder }
					onChange={ placeholder => setAttributes({ placeholder }) }
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
