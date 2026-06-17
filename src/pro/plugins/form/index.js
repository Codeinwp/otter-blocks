/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	__experimentalToolsPanelItem as ToolsPanelItem,
	Disabled,
	ExternalLink,
	TextControl,
	FormTokenField,
	ToggleControl,
	Notice
} from '@wordpress/components';
import { addFilter } from '@wordpress/hooks';
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { Notice as OtterNotice } from '../../../blocks/components';
import { FieldInputWidth, HideFieldLabelToggle, mappedNameInfo, selectAllFieldsFromForm } from '../../../blocks/blocks/form/common';
import { setSavedState, setUtm } from '../../../blocks/helpers/helper-functions';
import AutoresponderBodyModal from '../../components/autoresponder/index.js';
import WebhookEditor from '../../components/webhook-editor';
import attributes from '../../../blocks/blocks/lottie/attributes';

// +-------------- Autoresponder --------------+

const fieldTypeNames = {
	'text': __( 'Text Field', 'otter-pro' ),
	'email': __( 'Email Field', 'otter-pro' ),
	'date': __( 'Date Field', 'otter-pro' ),
	'number': __( 'Number Field', 'otter-pro' ),
	'textarea': __( 'Textarea Field', 'otter-pro' ),
	'select': __( 'Select Field', 'otter-pro' ),
	'checkbox': __( 'Checkbox Field', 'otter-pro' ),
	'radio': __( 'Radio Field', 'otter-pro' ),
	'file': __( 'File Field', 'otter-pro' ),
	'url': __( 'URL Field', 'otter-pro' ),
	'hidden': __( 'Hidden Field', 'otter-pro' ),
	'stripe': __( 'Stripe Field', 'otter-pro' )
};

/**
 * Resolve the field "type" name used to filter/label magic-tag chips.
 *
 * Mirrors `extractFieldName` in src/blocks/blocks/form/sortable-input-fields.tsx.
 *
 * @param {Object} inputField The form field inner block.
 * @return {string} The field type name.
 */
const getFieldType = inputField => {
	const tag = inputField?.name?.replace( 'themeisle-blocks/', '' );

	if ( 'form-input' === tag || 'form-multiple-choice' === tag ) {
		return inputField?.attributes?.type ?? 'text';
	}

	if ( 'form-file' === tag ) {
		return 'file';
	}

	if ( 'form-hidden-field' === tag ) {
		return 'hidden';
	}

	if ( 'form-stripe-field' === tag ) {
		return 'stripe';
	}

	return 'textarea';
};

/**
 * Build the magic-tag list from the form's inner blocks.
 *
 * The inserted token is `%<fieldId>%` (the same token the autoresponder body uses), while the
 * chip label is the friendly field name. Fields of type `file`, `stripe` and `hidden` are excluded.
 *
 * @param {Array} children The form block inner blocks.
 * @return {Array<{token: string, label: string}>} The magic tags.
 */
const getMagicTags = children => {
	return selectAllFieldsFromForm( children ?? [])
		.map( ({ inputField }) => inputField )
		.filter( Boolean )
		.filter( inputField => ! [ 'file', 'stripe', 'hidden' ].includes( getFieldType( inputField ) ) )
		.filter( inputField => inputField?.attributes?.id )
		.map( inputField => ({
			token: `%${ inputField.attributes.id }%`,
			label: inputField?.attributes?.label || fieldTypeNames[ getFieldType( inputField ) ] || __( 'Field', 'otter-pro' )
		}) );
};

const AutoresponderBody = ({ formOptions, setFormOption, magicTags, disabled }) => {
	const onChange = body => {
		window.oTrk?.add({ feature: 'form-autoresponder', featureComponent: 'body' });
		setFormOption({ autoresponder: { ...formOptions.autoresponder, body }});
	};

	const onChangeAIPrompt = prompt => {
		window.oTrk?.add({ feature: 'form-autoresponder', featureComponent: 'ai-prompt' });
		setFormOption({ aiAutoresponder: { ...formOptions.aiAutoresponder, prompt }});
	};

	return (
		<AutoresponderBodyModal
			value={formOptions.autoresponder?.body}
			onChange={onChange}
			addExtraMargin={true}
			aiAutoresponder={formOptions.aiAutoresponder}
			onChangeAIPrompt={onChangeAIPrompt}
			magicTags={magicTags}
			disabled={disabled}
		/>
	);
};

/**
 * Upsell notice shown under a disabled Pro preview, linking to the upgrade page.
 *
 * @param {Object} props
 * @param {string} props.area The UTM content area identifier.
 * @return {JSX.Element}
 */
const ProUpsellNotice = ({ area }) => (
	<OtterNotice
		notice={
			<ExternalLink href={ setUtm( window.themeisleGutenberg?.upgradeLink ?? '#', area ) }>
				{ __( 'Unlock this with Otter Pro.', 'otter-pro' ) }
			</ExternalLink>
		}
		variant="upsell"
	/>
);

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

	const magicTags = getMagicTags( config?.children );
	const isPro = Boolean( window.otterPro?.isActive );

	return (
		<>
			{Options}

			<ToolsPanelItem
				hasValue={() =>
					undefined !== formOptions.autoresponder?.subject ||
					undefined !== formOptions.autoresponder?.body ||
					undefined !== formOptions.aiAutoresponder
				}
				label={__( 'Autoresponder', 'otter-pro' )}
				onDeselect={() => setFormOption({ autoresponder: undefined, aiAutoresponder: undefined })}
			>
				<Disabled isDisabled={ ! isPro }>
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

					<ToggleControl
						label={__( 'Reply with AI', 'otter-pro' )}
						help={__(
							'Let AI craft a personalized reply to each submission.',
							'otter-pro'
						)}
						checked={Boolean( formOptions.aiAutoresponder?.enabled )}
						onChange={( enabled ) => {
							window.oTrk?.add({ feature: 'form-autoresponder', featureComponent: 'reply-with-ai', groupID: attributes.id });
							setFormOption({
								aiAutoresponder: {
									...formOptions.aiAutoresponder,
									enabled
								}
							});
						}}
					/>
				</Disabled>

				<AutoresponderBody
					formOptions={formOptions}
					setFormOption={setFormOption}
					magicTags={magicTags}
					disabled={ ! isPro }
				/>

				{
					isPro && config?.showAutoResponderNotice && (
						<Notice isDismissible={false} status={'info'}>
							{
								__( 'In order for Autoresponder to work, you need to have at least one Email field in Form.', 'otter-pro' )
							}
						</Notice>
					)
				}

				{ ! isPro && <ProUpsellNotice area="formautoresponder" /> }
			</ToolsPanelItem>
			<ToolsPanelItem
				hasValue={() => formOptions?.webhookId }
				label={__( 'Webhook', 'otter-pro' )}
				onDeselect={() => setFormOption({ webhookId: undefined })}
			>
				<Disabled isDisabled={ ! isPro }>
					<WebhookEditor
						webhookId={formOptions.webhookId}
						onChange={( webhookId ) => {
							window.oTrk?.add({ feature: 'form-webhook', featureComponent: 'webhook-set', groupID: attributes.id });
							setFormOption({
								webhookId
							});
						}}
					/>
				</Disabled>

				{ ! isPro && <ProUpsellNotice area="formwebhook" /> }
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
