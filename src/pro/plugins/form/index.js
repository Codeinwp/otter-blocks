/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	__experimentalToolsPanelItem as ToolsPanelItem,
	TextControl,
	FormTokenField,
	ToggleControl,
	Notice, SelectControl
} from '@wordpress/components';
import { addFilter } from '@wordpress/hooks';
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { Notice as OtterNotice } from '../../../blocks/components';
import { FieldInputWidth, HideFieldLabelToggle, mappedNameInfo } from '../../../blocks/blocks/form/common';
import { setSavedState } from '../../../blocks/helpers/helper-functions';
import AutoresponderBodyModal from '../../components/autoresponder/index.js';
import WebhookEditor from '../../components/webhook-editor';
import attributes from '../../../blocks/blocks/lottie/attributes';

// +-------------- Autoresponder --------------+

const AutoresponderBody = ({ formOptions, setFormOption }) => {
	const onChange = body => {
		window.oTrk?.add({ feature: 'form-autoresponder', featureComponent: 'body' });
		setFormOption({ autoresponder: { ...formOptions.autoresponder, body }});
	};

	return <AutoresponderBodyModal value={formOptions.autoresponder?.body} onChange={onChange} addExtraMargin={true} />;
};

const helpMessages = {
	'database': __( 'Save form submissions to the database. You can see the submissions in Otter Blocks > Form Submissions on Dashboard Panel', 'otter-pro' ),
	'email': __( 'The submissions are send only via email. No data will be saved on the server, use this option to handle sensitive data.', 'otter-pro' ),
	'database-email': __( 'Save the submissions to the database and notify also via email.', 'otter-pro' )
};

/**
 * Form Options
 *
 * @param {React.ReactNode}                                                             Options       The children of the FormOptions component.
 * @param {import('../../../blocks/blocks/form/type').FormOptions}                      formOptions   The form options.
 * @param { (options: import('../../../blocks/blocks/form/type').FormOptions) => void } setFormOption The function to set the form options.
 * @param {any}                                                                         config        The form config.
 * @param {import('../../../blocks/blocks/form/type').FormAttrs}                        attributes    The form attributes.
 * @return {JSX.Element}
 */
const FormOptions = ( Options, formOptions, setFormOption, config, attributes ) => {

	return (
		<>
			{Options}

			<ToolsPanelItem
				hasValue={ () => undefined !== formOptions.submissionsSaveLocation }
				label={ __( 'Submissions', 'otter-pro' ) }
				onDeselect={ () => setFormOption({ submissionsSaveLocation: undefined }) }
				isShownByDefault={ true }
			>
				{Boolean( window.otterPro.isActive ) ? (
					<SelectControl
						label={ __( 'Save Location', 'otter-pro' ) }
						value={ formOptions.submissionsSaveLocation ?? 'database-email' }
						onChange={ submissionsSaveLocation => {
							window.oTrk?.set( `${attributes.id}_save`, { feature: 'form-storing', featureComponent: 'save-location', featureValue: submissionsSaveLocation, groupID: attributes.id });
							setFormOption({ submissionsSaveLocation });
						} }
						options={
							[
								{ label: __( 'Database', 'otter-pro' ), value: 'database' },
								{ label: __( 'Email Only', 'otter-pro' ), value: 'email' },
								{ label: __( 'Database and Email', 'otter-pro' ), value: 'database-email' }
							]
						}
						help={ helpMessages?.[formOptions?.submissionsSaveLocation] ?? helpMessages.database }
					/> ) : (
					<div>
						<OtterNotice
							notice={__(
								'You need to activate Otter Pro.',
								'otter-pro'
							)}
							instructions={__(
								'You need to activate your Otter Pro license to use Pro features of Form Block.',
								'otter-pro'
							)}
						/>
					</div>
				)}
			</ToolsPanelItem>

			<ToolsPanelItem
				hasValue={() =>
					undefined !== formOptions.autoresponder?.subject ||
					undefined !== formOptions.autoresponder?.body
				}
				label={__( 'Autoresponder', 'otter-pro' )}
				onDeselect={() => setFormOption({ autoresponder: undefined })}
			>
				{Boolean( window.otterPro.isActive ) ? (
					<>
						<TextControl
							label={__( 'Autoresponder Subject', 'otter-pro' )}
							placeholder={__(
								'Confirmation of your subscription',
								'otter-pro'
							)}
							value={formOptions.autoresponder?.subject}
							onChange={( subject ) => {
								window.oTrk?.add({ feature: 'form-autoresponder', featureComponent: 'subject', groupID: attributes.id });
								setFormOption({
									autoresponder: {
										...formOptions.autoresponder,
										subject
									}
								});
							}}
							help={__(
								'Enter the subject of the autoresponder email.',
								'otter-pro'
							)}
						/>

						<AutoresponderBody
							formOptions={formOptions}
							setFormOption={setFormOption}
						/>

						{
							config?.showAutoResponderNotice && (
								<Notice isDismissible={false} status={'info'}>
									{
										__( 'In order for Autoresponder to work, you need to have at least one Email field in Form.', 'otter-pro' )
									}
								</Notice>
							)
						}

					</>
				) : (
					<div>
						<OtterNotice
							notice={__(
								'You need to activate Otter Pro.',
								'otter-pro'
							)}
							instructions={__(
								'You need to activate your Otter Pro license to use Pro features of Form Block.',
								'otter-pro'
							)}
						/>
					</div>
				)}
			</ToolsPanelItem>
			<ToolsPanelItem
				hasValue={() => formOptions?.webhookId }
				label={__( 'Webhook', 'otter-pro' )}
				onDeselect={() => setFormOption({ webhookId: undefined })}
			>
				{Boolean( window.otterPro.isActive ) ? (
					<>
						<WebhookEditor
							webhookId={formOptions.webhookId}
							onChange={( webhookId ) => {
								window.oTrk?.add({ feature: 'form-webhook', featureComponent: 'webhook-set', groupID: attributes.id });
								setFormOption({
									webhookId
								});
							}}
						/>
					</>
				) : (
					<div>
						<OtterNotice
							notice={__(
								'You need to activate Otter Pro.',
								'otter-pro'
							)}
							instructions={__(
								'You need to activate your Otter Pro license to use Pro features of Form Block.',
								'otter-pro'
							)}
						/>
					</div>
				)}
			</ToolsPanelItem>
		</>
	);
};

addFilter( 'otter.formBlock.options', 'themeisle-gutenberg/form-block-options', FormOptions );

// +-------------- Form File Inspector --------------+

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
				<OtterNotice
					notice={ __( 'You need to activate Otter Pro.', 'otter-pro' ) }
					instructions={ __( 'You need to activate your Otter Pro license to use Pro features of Sticky Extension.', 'otter-pro' ) }
				/>
			</Fragment>
		);
	}

	return (
		<Fragment>
			<TextControl
				label={ __( 'Label', 'otter-pro' ) }
				value={ attributes.label }
				onChange={ label => setAttributes({ label }) }
			/>

			<HideFieldLabelToggle attributes={ attributes } setAttributes={ setAttributes } />

			<FieldInputWidth attributes={ attributes } setAttributes={ setAttributes } />

			<TextControl
				label={ __( 'Max File Size in MB', 'otter-pro' ) }
				type="number"
				value={ ! isNaN( parseInt( attributes.maxFileSize ) ) ? attributes.maxFileSize : undefined }
				onChange={ maxFileSize => {
					window.oTrk?.set( `${attributes.id}_size`, { feature: 'form-file', featureComponent: 'file-size', featureValue: maxFileSize, groupID: attributes.id });
					setSavedState( attributes.id, true );
					setAttributes({ maxFileSize: maxFileSize ? maxFileSize?.toString() : undefined });
				} }
				help={ __( 'You may need to contact your hosting provider to increase file sizes.', 'otter-pro' ) }
			/>

			<FormTokenField
				label={ __( 'Allowed File Types', 'otter-pro' ) }
				value={ attributes.allowedFileTypes }
				onChange={ allowedFileTypes => {
					window.oTrk?.set( `${attributes.id}_type`, { feature: 'form-file', featureComponent: 'file-type', featureValue: allowedFileTypes, groupID: attributes.id });
					setSavedState( attributes.id, true );
					setAttributes({ allowedFileTypes: allowedFileTypes ? allowedFileTypes.map( replaceJPGWithJPEG ) : undefined });
				} }
				help={ __( 'Add the allowed files types that can be loaded. E.g.: .png, .mp4, .jpeg, .zip, .pdf. Attention: The host provider might not allow to saving of all type of files.', 'otter-pro' ) }
				suggestions={ fileTypeSuggestions }
			/>

			<TextControl
				label={ __( 'Help Text', 'otter-pro' ) }
				value={ attributes.helpText }
				onChange={ helpText => setAttributes({ helpText }) }
			/>

			<ToggleControl
				label={ __( 'Required', 'otter-pro' ) }
				help={ __( 'If enabled, the input field must be filled out before submitting the form.', 'otter-pro' ) }
				checked={ attributes.isRequired }
				onChange={ isRequired => setAttributes({ isRequired }) }
			/>

			<TextControl
				label={ __( 'Mapped Name', 'otter-pro' ) }
				help={ mappedNameInfo }
				value={ attributes.mappedName }
				onChange={ mappedName => setAttributes({ mappedName }) }
				placeholder={ __( 'photos', 'otter-pro' ) }
			/>

			<ToggleControl
				label={ __( 'Allow multiple file uploads', 'otter-pro' ) }
				checked={ Boolean( attributes.multipleFiles ) }
				onChange={ multipleFiles => {
					window.oTrk?.add({ feature: 'form-file', featureComponent: 'enable-multiple-file', groupID: attributes.id });
					setSavedState( attributes.id, true );
					setAttributes({ multipleFiles: multipleFiles ? multipleFiles : undefined });
				} }
			/>

			{
				attributes.multipleFiles && (
					<TextControl
						label={ __( 'Maximum number of files', 'otter-pro' ) }
						type="number"
						value={ ! isNaN( parseInt( attributes.maxFilesNumber ) ) ? ( attributes.maxFilesNumber ) : undefined }
						onChange={ maxFilesNumber => {
							window.oTrk?.set( `${attributes.id}_num`, { feature: 'form-file', featureComponent: 'multiple-file', featureValue: maxFilesNumber, groupID: attributes.id });
							setSavedState( attributes.id, true );
							setAttributes({ maxFilesNumber: maxFilesNumber ? maxFilesNumber?.toString() : undefined });
						} }
						help={ __( 'By default, only 10 files are allowed to load.', 'otter-pro' )}
					/>
				)
			}

			<ToggleControl
				label={ __( 'Save to Media Library', 'otter-pro' ) }
				help={ __( 'If enabled, the files will be saved to Media Library instead of adding them as attachments to email.', 'otter-pro' ) }
				checked={ 'media-library' === attributes.saveFiles }
				onChange={ value => {
					window.oTrk?.add({ feature: 'form-file', featureComponent: 'enable-media-saving', groupID: attributes.id });
					setSavedState( attributes.id, true );
					setAttributes({ saveFiles: value ? 'media-library' : undefined });
				} }
			/>
		</Fragment>
	);
};

addFilter( 'otter.form.file.inspector', 'themeisle-gutenberg/form-file-inspector', FormFileInspector );
