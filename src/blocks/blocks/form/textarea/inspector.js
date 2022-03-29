/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { InspectorControls } from '@wordpress/block-editor';

import {
	PanelBody,
	TextControl,
	ToggleControl,
	SelectControl
} from '@wordpress/components';

const Inspector = ({
	attributes,
	setAttributes
}) => {
	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Settings', 'otter-blocks' ) }
			>
				<TextControl
					label={ __( 'Label', 'otter-blocks' ) }
					value={ attributes.label }
					onChange={ label => setAttributes({ label }) }
				/>

				<TextControl
					label={ __( 'Placeholder', 'otter-blocks' ) }
					value={ attributes.placeholer }
					onChange={ placeholder => setAttributes({ placeholder }) }
				/>

				<TextControl
					label={ __( 'Help Text', 'otter-blocks' ) }
					value={ attributes.helpText }
					onChange={ helpText => setAttributes({ helpText }) }
				/>

				<ToggleControl
					label={ __( 'Is this field required?', 'otter-blocks' ) }
					help={ __( 'If true, the input field must be filled out before submitting the form.', 'otter-blocks' ) }
					checked={ attributes.isRequired }
					onChange={ isRequired => setAttributes({ isRequired }) }
				/>

				<SelectControl
					label={ __( 'Input Width', 'otter-blocks' ) }
					value={ attributes.inputWidth }
					onChange={ inputWidth => setAttributes({ inputWidth }) }
					options={[
						{
							label: __( 'Default', '' ),
							value: ''
						},
						{
							label: '33%',
							value: 33
						},
						{
							label: '50%',
							value: 50
						},
						{
							label: '75%',
							value: 75
						},
						{
							label: '100%',
							value: 100
						}
					]}
				/>
			</PanelBody>
		</InspectorControls>
	);
};

export default Inspector;
