// @ts-nocheck

import { Fragment } from '@wordpress/element';
import { FormTokenField, TextControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { HideFieldLabelToggle } from '../../../blocks/blocks/form/common';
import { setSavedState } from '../../../blocks/helpers/helper-functions';

const { Notice } = window.otterComponents;

const fileTypeSuggestions = [
	'image/*',
	'audio/*',
	'video/*',
	'image/jpeg',
	'.jpeg',
	'.png',
	'.gif',
	'.pdf',
	'.doc',
	'.docx',
	'.xls',
	'.xlsx',
	'.ppt',
	'.pptx',
	'.odt',
	'.ods',
	'.odp',
	'.odg',
	'.odc',
	'.odf',
	'.odb',
	'.csv',
	'.txt',
	'.zip',
	'.rar',
	'.7z',
	'.gz',
	'.psd',
	'.bmp',
	'.tif',
	'.tiff',
	'.svg',
	'.mp4',
	'.m4v',
	'.mov',
	'.wmv',
	'.avi',
	'.mpg',
	'.mp3',
	'.mkv'
];

const replaceJPGWithJPEG = fileType => {
	if ( 'image/jpg' === fileType || '.jpg' === fileType ) {
		return 'image/jpeg';
	}

	return fileType;
};

const FormFileInspector = ( Template, {
	attributes,
	setAttributes
}) => {

	if ( ! Boolean( window?.otterPro?.isActive ) ) {
		return (
			<Fragment>
				{ Template }
				<Notice
					notice={ __( 'You need to activate Otter Pro.', 'otter-blocks' ) }
					instructions={ __( 'You need to activate your Otter Pro license to use Pro features of Sticky Extension.', 'otter-blocks' ) }
				/>
			</Fragment>
		);
	}

	return (
		<Fragment>
			<TextControl
				label={ __( 'Label', 'otter-blocks' ) }
				value={ attributes.label }
				onChange={ label => setAttributes({ label }) }
			/>

			<HideFieldLabelToggle attributes={ attributes } setAttributes={ setAttributes } />

			<TextControl
				label={ __( 'Max File Size in MB', 'otter-blocks' ) }
				type="number"
				value={ parseInt( attributes.maxFileSize ) }
				onChange={ maxFileSize => {
					setSavedState( attributes.id, true );
					setAttributes({ maxFileSize: maxFileSize?.toString() });
				} }
				help={ __( 'You may need to contact your hosting provider to increase file sizes.', 'otter-blocks' ) }
			/>

			<FormTokenField
				label={ __( 'Allowed File Types', 'otter-blocks' ) }
				value={ attributes.allowedFileTypes }
				onChange={ allowedFileTypes => {
					setSavedState( attributes.id, true );
					setAttributes({ allowedFileTypes: allowedFileTypes.map( replaceJPGWithJPEG ) });
				} }
				help={ __( 'Add the allowed files types that can be loaded. E.g.: .png, .mp4, .jpeg, .zip, .pdf. Attention: The host provider might not allow to saving of all type of files.', 'otter-blocks' ) }
				suggestions={ fileTypeSuggestions }
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
				onChange={ multipleFiles => {
					setSavedState( attributes.id, true );
					setAttributes({ multipleFiles, hasChanged: true });
				} }
			/>

			{
				attributes.multipleFiles && (
					<TextControl
						label={ __( 'Maximum number of files', 'otter-blocks' ) }
						type="number"
						value={ attributes.maxFilesNumber  ?? 10 }
						onChange={ maxFilesNumber => {
							setSavedState( attributes.id, true );
							setAttributes({ maxFilesNumber: maxFilesNumber?.toString(), hasChanged: true });
						} }
					/>
				)
			}

			<ToggleControl
				label={ __( 'Save to Media Library', 'otter-blocks' ) }
				help={ __( 'If enabled, the files will be saved to Media Library instead of adding them as attachments to email.', 'otter-blocks' ) }
				checked={ 'media-library' === attributes.saveFiles }
				onChange={ value => {
					setSavedState( attributes.id, true );
					setAttributes({ saveFiles: value ? 'media-library' : undefined, hasChanged: true });
				} }
			/>
		</Fragment>
	);
};

addFilter( 'otter.form.file.inspector', 'themeisle-gutenberg/form-file-inspector', FormFileInspector );
