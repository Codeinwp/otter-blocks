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
	ExternalLink,
	FormTokenField,
	PanelBody,
	SelectControl,
	TextControl,
	ToggleControl
} from '@wordpress/components';
import { applyFilters } from '@wordpress/hooks';
import { Fragment } from '@wordpress/element';
import { dispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { fieldTypesOptions, HideFieldLabelToggle, mappedNameInfo, switchFormFieldTo } from '../../../blocks/blocks/form/common';
import { Notice } from '../../../blocks/components';
import { setUtm } from '../../../blocks/helpers/helper-functions';


const ProPreview = ({ attributes }) => {

	return (
		<Fragment>
			<Disabled>

				<TextControl
					label={ __( 'Label', 'otter-pro' ) }
					value={ attributes.label }
					onChange={ () => {} }
				/>

				<HideFieldLabelToggle attributes={ attributes } setAttributes={ () => {} } />

				<TextControl
					label={ __( 'Max File Size in MB', 'otter-pro' ) }
					type="number"
					value={ attributes.maxFileSize }
					onChange={ () => {} }
					help={ __( 'You may need to contact your hosting provider to increase file sizes.', 'otter-pro' ) }
				/>

				<FormTokenField
					label={ __( 'Allowed File Types', 'otter-pro' ) }
					value={ attributes.allowedFileTypes }
					onChange={ () => {}  }
					help={ __( 'Add the allowed files types that can be loaded. E.g.: jpg, zip, pdf.', 'otter-pro' ) }
				/>

				<TextControl
					label={ __( 'Help Text', 'otter-pro' ) }
					value={ attributes.helpText }
					onChange={ () => {} }
				/>

				<ToggleControl
					label={ __( 'Required', 'otter-pro' ) }
					help={ __( 'If enabled, the input field must be filled out before submitting the form.', 'otter-pro' ) }
					checked={ attributes.isRequired }
					onChange={ () => {} }
				/>

				<ToggleControl
					label={ __( 'Allow multiple file uploads', 'otter-pro' ) }
					checked={ attributes.multipleFiles }
					onChange={ () => {} }
				/>

				<TextControl
					label={ __( 'Mapped Name', 'otter-pro' ) }
					help={ mappedNameInfo }
					value={ attributes.mappedName }
					onChange={ () => {} }
					placeholder={ __( 'photos', 'otter-pro' ) }
				/>

				{
					attributes.multipleFiles && (
						<TextControl
							label={ __( 'Maximum number of files', 'otter-pro' ) }
							type="number"
							value={ attributes.maxFilesNumber ?? 10 }
							onChange={ () => {} }
						/>
					)
				}

				<ToggleControl
					label={ __( 'Save to Media Library', 'otter-pro' ) }
					help={ __( 'If enabled, the files will be saved to Media Library instead of adding them as attachments to email.', 'otter-pro' ) }
					checked={ 'media-library' === attributes.saveFiles }
					onChange={ () => {} }
				/>

			</Disabled>
			{ ! Boolean( window.themeisleGutenberg.hasPro ) && (
				<Notice
					notice={ <ExternalLink href={ setUtm( window.themeisleGutenberg.upgradeLink, 'formfileblock' )}>{ __( 'Get more options with Otter Pro.', 'otter-pro' ) }</ExternalLink> }
					variant="upsell"
				/> ) }
		</Fragment>
	);
};

/**
 *
 * @param {import('./types').FormFileInspectorProps} props
 * @return {JSX.Element}
 */
const Inspector = ({
	attributes,
	setAttributes,
	clientId
}) => {

	// FormContext is not available here. This is a workaround.
	const selectForm = () => {
		const formParentId = Array.from( document.querySelectorAll( `.wp-block-themeisle-blocks-form:has(#block-${clientId})` ) )?.pop()?.dataset?.block;
		dispatch( 'core/block-editor' ).selectBlock( formParentId );
	};

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Field Settings', 'otter-pro' ) }
			>
				<Button
					isSecondary
					variant="secondary"
					onClick={ () => selectForm?.() }
				>
					{ __( 'Back to the Form', 'otter-pro' ) }
				</Button>

				<SelectControl
					label={ __( 'Field Type', 'otter-pro' ) }
					value={ attributes.type }
					options={ fieldTypesOptions() }
					onChange={ type => {
						if ( 'file' !== type ) {
							switchFormFieldTo( type, clientId, attributes );
						}
					}}
				/>

				{
					( ! window.themeisleGutenberg.hasPro ) ? <ProPreview attributes={ attributes } /> : (
						applyFilters( 'otter.form.file.inspector', <ProPreview attributes={attributes} />, { attributes, setAttributes })
					)
				}

				<div className="o-fp-wrap">
					{ applyFilters( 'otter.feedback', '', 'sticky' ) }
					{ applyFilters( 'otter.poweredBy', '' ) }
				</div>
			</PanelBody>

			<PanelColorSettings
				title={ __( 'Color', 'otter-pro' ) }
				initialOpen={ false }
				colorSettings={ [
					{
						value: attributes.labelColor,
						onChange: labelColor => setAttributes({ labelColor }),
						label: __( 'Label Color', 'otter-pro' )
					}
				] }
			/>
		</InspectorControls>
	);
};

export default Inspector;
