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
	Disabled,
	FormTokenField,
	PanelBody,
	SelectControl,
	TextControl,
	ToggleControl
} from '@wordpress/components';
import { applyFilters } from '@wordpress/hooks';
import { Fragment, useContext } from '@wordpress/element';

import { fieldTypesOptions, HideFieldLabelToggle, switchFormFieldTo } from '../common';
import { FormContext } from '../edit';

const ProPreview = ({ attributes }) => {

	return (
		<Fragment>
			<Disabled>

				<TextControl
					label={ __( 'Label', 'otter-blocks' ) }
					value={ attributes.label }
					onChange={ () => {} }
				/>

				<HideFieldLabelToggle attributes={ attributes } setAttributes={ () => {} } />

				<TextControl
					label={ __( 'Max File Size in MB', 'otter-blocks' ) }
					type="number"
					value={ attributes.maxFileSize }
					onChange={ () => {} }
					help={ __( 'You may need to contact your hosting provider to increase file sizes.', 'otter-blocks' ) }
				/>

				<FormTokenField
					label={ __( 'Allowed File Types', 'otter-blocks' ) }
					value={ attributes.allowedFileTypes }
					onChange={ () => {}  }
					help={ __( 'Add the allowed files types that can be loaded. E.g.: jpg, zip, pdf.', 'otter-blocks' ) }
				/>

				<TextControl
					label={ __( 'Help Text', 'otter-blocks' ) }
					value={ attributes.helpText }
					onChange={ () => {} }
				/>

				<ToggleControl
					label={ __( 'Required', 'otter-blocks' ) }
					help={ __( 'If enabled, the input field must be filled out before submitting the form.', 'otter-blocks' ) }
					checked={ attributes.isRequired }
					onChange={ () => {} }
				/>

				<ToggleControl
					label={ __( 'Allow multiple file uploads', 'otter-blocks' ) }
					checked={ attributes.multipleFiles }
					onChange={ () => {} }
				/>

				{
					attributes.multipleFiles && (
						<TextControl
							label={ __( 'Maximum number of files', 'otter-blocks' ) }
							type="number"
							value={ attributes.maxFilesNumber }
							onChange={ () => {} }
						/>
					)
				}

				<ToggleControl
					label={ __( 'Save to Media Library', 'otter-blocks' ) }
					help={ __( 'If enabled, the files will be saved to Media Library instead of adding them as attachments to email.', 'otter-blocks' ) }
					checked={ 'media-library' === attributes.saveFiles }
					onChange={ () => {} }
				/>
			</Disabled>
		</Fragment>
	);
};

/**
 *
 * @param {import('./types').FormFileInspectorProps} props
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
					options={ fieldTypesOptions }
					onChange={ type => {
						if ( 'file' !== type ) {
							switchFormFieldTo( type, clientId, attributes );
						}
					}}
				/>

				{
					( ! window.themeisleGutenberg.hasPro ) ? <ProPreview attributes={ attributes } /> : (
						applyFilters( 'otter.form.file.inspector', <ProPreview attributes={attributes} />, { attributes: attributes, setAttributes: setAttributes })
					)
				}

				<div className="o-fp-wrap">
					{ applyFilters( 'otter.feedback', '', 'sticky' ) }
					{ applyFilters( 'otter.poweredBy', '' ) }
				</div>
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
