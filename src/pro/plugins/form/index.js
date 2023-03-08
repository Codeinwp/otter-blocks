// @ts-nocheck

import { Fragment } from '@wordpress/element';
import { TextControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';

const { Notice } = window.otterComponents;

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
				label={ __( 'Max File Size in MB', 'otter-blocks' ) }
				type="number"
				value={ attributes.maxFileSize }
				onChange={ maxFileSize => setAttributes({ maxFileSize }) }
				help={ __( 'You may need to contact your hosting provider to increase file sizes.', 'otter-blocks' ) }
			/>

			<TextControl
				label={ __( 'Allowed File Types', 'otter-blocks' ) }
				value={ attributes.allowedFileTypes }
				onChange={ allowedFileTypes => setAttributes({ allowedFileTypes }) }
				help={ __( 'Allowed file types separated by coma. E.g.: .png, .jpg, .pdf, .doc', 'otter-blocks' ) }
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

			<ToggleControl
				label={ __( 'Save to Media Library', 'otter-blocks' ) }
				help={ __( 'If enabled, the files will be saved to Media Library instead of adding them as attachments to email.', 'otter-blocks' ) }
				checked={ 'media-library' === attributes.saveFiles }
				onChange={ value => setAttributes({ saveFiles: value ? 'media-library' : undefined }) }
			/>
		</Fragment>
	);
};

addFilter( 'otter.form.file.inspector', 'themeisle-gutenberg/form-file-inspector', FormFileInspector );
