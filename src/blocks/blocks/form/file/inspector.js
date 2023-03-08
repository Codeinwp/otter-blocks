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
import { Fragment, useContext } from '@wordpress/element';

import { HideFieldLabelToggle, switchFormFieldTo } from '../common';
import { FormContext } from '../edit';
import { Notice } from '../../../components';
import { setUtm } from '../../../helpers/helper-functions';

const ProPreview = ({ attributes }) => {
	const setAttributes = () => {};

	return (
		<Fragment>
			<Disabled>
				<TextControl
					label={ __( 'Max File Size in MB', 'otter-blocks' ) }
					type="number"
					value={ attributes.maxFileSize }
					onChange={ maxFileSize => setAttributes({ maxFileSize }) }
					help={ __( 'You may need to contact your hosting provider to increase file sizes.', 'otter-blocks' ) }
				/>

				<FormTokenField
					label={ __( 'Allowed File Types', 'otter-blocks' ) }
					value={ attributes.allowedFileTypes }
					onChange={ allowedFileTypes => setAttributes({ allowedFileTypes }) }
					help={ __( 'Add the allowed files types that can be loaded. E.g.: jpg, zip, pdf.', 'otter-blocks' ) }
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

				<ToggleControl
					label={ __( 'Allow multiple file uploads', 'otter-blocks' ) }
					checked={ attributes.multipleFiles }
					onChange={ multipleFiles => setAttributes({ multipleFiles }) }
				/>

				{
					attributes.multipleFiles && (
						<TextControl
							label={ __( 'Maximum number of files', 'otter-blocks' ) }
							type="number"
							value={ attributes.maxFilesNumber }
							onChange={ maxFilesNumber => setAttributes({ maxFilesNumber }) }
						/>
					)
				}

				<ToggleControl
					label={ __( 'Save to Media Library', 'otter-blocks' ) }
					help={ __( 'If enabled, the files will be saved to Media Library instead of adding them as attachments to email.', 'otter-blocks' ) }
					checked={ 'media-library' === attributes.saveFiles }
					onChange={ value => setAttributes({ saveFiles: value ? 'media-library' : undefined }) }
				/>
			</Disabled>

			{ ! Boolean( window.themeisleGutenberg?.hasPro ) && (
				<Notice
					notice={<ExternalLink href={setUtm( window.themeisleGutenberg.upgradeLink, 'formfilefieldfeature' )}>{__( 'Activate this field with Otter Pro.', 'otter-blocks' )}</ExternalLink>}
					variant="upsell" instructions={undefined}				/>
			) }
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
						if ( 'textarea' === type || 'radio' === type || 'checkbox' === type || 'select' === type ) {
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
