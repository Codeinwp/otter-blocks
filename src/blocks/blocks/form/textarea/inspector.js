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
import { Fragment, useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { FieldInputWidth, fieldTypesOptions, HideFieldLabelToggle, mappedNameInfo, switchFormFieldTo } from '../common';
import { FormContext } from '../edit';
import { HTMLAnchorControl } from '../../../components';

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
						value={ 'textarea' }
						options={ fieldTypesOptions() }
						onChange={ type => {
							if ( 'textarea' === type ) {
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

					<TextControl
						label={ __( 'Mapped Name', 'otter-blocks' ) }
						help={ mappedNameInfo }
						value={ attributes.mappedName }
						onChange={ mappedName => setAttributes({ mappedName }) }
						placeholder={ __( 'message', 'otter-blocks' ) }
					/>
				</PanelBody>
			</InspectorControls>
			<HTMLAnchorControl
				value={ attributes.id }
				onChange={ value => setAttributes({ id: value }) }
			/>
		</Fragment>

	);
};

export default Inspector;
