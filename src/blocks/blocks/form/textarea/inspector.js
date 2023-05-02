/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { InspectorControls } from '@wordpress/block-editor';

import {
	Button,
	PanelBody,
	SelectControl,
	TextControl,
	ToggleControl
} from '@wordpress/components';
import { FieldInputWidth } from '../common';

const Inspector = ({
	attributes,
	setAttributes,
	selectParent,
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
					value={ 'textarea' }
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
							return;
						}
						switchToInput( type );
					}}
				/>

				<TextControl
					label={ __( 'Label', 'otter-blocks' ) }
					value={ attributes.label }
					onChange={ label => setAttributes({ label }) }
				/>

				<FieldInputWidth attributes={ attributes } setAttributes={ setAttributes } />

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
		</InspectorControls>
	);
};

export default Inspector;
