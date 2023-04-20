/**
 * External dependencies.
 */
import { SortableContainer } from 'react-sortable-hoc';

import {
	alignCenter,
	alignLeft,
	alignRight,
	menu
} from '@wordpress/icons';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { isObjectLike } from 'lodash';

import {
	InspectorAdvancedControls,
	InspectorControls
} from '@wordpress/block-editor';

import {
	__experimentalBoxControl as BoxControl,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
	BaseControl,
	Button,
	ExternalLink,
	PanelBody,
	RangeControl,
	SelectControl,
	Spinner,
	TextControl,
	TextareaControl,
	FontSizePicker
} from '@wordpress/components';

import {
	Fragment,
	useContext,
	useState
} from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import { FormContext } from './edit.js';
import {
	ColorDropdownControl,
	InspectorHeader,
	InspectorExtensions,
	ResponsiveControl,
	SyncColorPanel,
	SyncControlDropdown,
	ToogleGroupControl,
	Notice
} from '../../components/index.js';
import { useResponsiveAttributes } from '../../helpers/utility-hooks.js';

import { makeBox } from '../../plugins/copy-paste/utils';
import { _px, setUtm } from '../../helpers/helper-functions.js';
import { SortableInputField } from './sortable-input-fields';
import AutoDisableSyncAttr from '../../components/auto-disable-sync-attr/index';
import { selectAllFieldsFromForm } from './common';

const compare = x => {
	return x?.[1] && x[0] !== x[1];
};

/**
 * Small utility function for checking if a list of variable pair are different.
 * @param {Array<[any, any]>} list
 * @return {boolean}
 */
const isChanged = list => {
	return Boolean( 0 < list.filter( compare ).length );
};

const defaultFontSizes = [
	{
		name: __( 'Small', 'otter-blocks' ),
		size: '0.875em',
		slug: 'small'
	},
	{
		name: __( 'Medium', 'otter-blocks' ),
		size: '1em',
		slug: 'medium'
	},
	{
		name: __( 'Large', 'otter-blocks' ),
		size: '1.125em',
		slug: 'large'
	},
	{
		name: __( 'XL', 'otter-blocks' ),
		size: '1.25em',
		slug: 'xl'
	}
];

const FormOptions = ({ formOptions, setFormOption, attributes, setAttributes }) => {
	return (
		<Fragment>
			<ToolsPanelItem
				hasValue={ () => false }
				label={ __( 'Email To', 'otter-blocks' ) }
				isShownByDefault={ true }
				className="is-first"
			>
				<TextControl
					label={ __( 'Email To', 'otter-blocks' ) }
					placeholder={ __( 'Default is to admin site', 'otter-blocks' ) }
					type="email"
					value={ formOptions.emailTo }
					onChange={ emailTo => setFormOption({ emailTo }) }
					help={ __( 'Default is site administrator.', 'otter-blocks' ) }
				/>
			</ToolsPanelItem>

			<ToolsPanelItem
				hasValue={ () => undefined !== formOptions.cc }
				label={ __( 'CC', 'otter-blocks' ) }
				onDeselect={ () => setFormOption({ cc: '' }) }
				isShownByDefault={ false }
			>
				<TextControl
					label={ __( 'CC', 'otter-blocks' ) }
					placeholder={ __( 'Send copies to', 'otter-blocks' ) }
					type="text"
					value={ formOptions.cc }
					onChange={ cc => setFormOption({ cc }) }
					help={ __( 'Add emails separated by commas: example1@otter.com, example2@otter.com.', 'otter-blocks' ) }
				/>
			</ToolsPanelItem>

			<ToolsPanelItem
				hasValue={ () => undefined !== formOptions.bcc }
				label={ __( 'BCC', 'otter-blocks' ) }
				onDeselect={ () => setFormOption({ bcc: '' }) }
				isShownByDefault={ false }
			>
				<TextControl
					label={ __( 'BCC', 'otter-blocks' ) }
					placeholder={ __( 'Send copies to', 'otter-blocks' ) }
					type="text"
					value={ formOptions.bcc }
					onChange={ bcc => setFormOption({ bcc }) }
					help={ __( 'Add emails separated by commas: example1@otter.com, example2@otter.com.', 'otter-blocks' ) }
				/>
			</ToolsPanelItem>

			<ToolsPanelItem
				hasValue={ () => false }
				label={ __( 'Email Subject', 'otter-blocks' ) }
				isShownByDefault={ true }
			>
				<TextControl
					label={ __( 'Email Subject', 'otter-blocks' ) }
					placeholder={ __( 'A new submission', 'otter-blocks' ) }
					value={ formOptions.subject }
					onChange={ subject => setFormOption({ subject }) }
					help={ __( 'Enter the title of the email.', 'otter-blocks' ) }
				/>
			</ToolsPanelItem>

			<ToolsPanelItem
				hasValue={ () => undefined !== formOptions.fromEmail }
				label={ __( 'From Name', 'otter-blocks' ) }
				onDeselect={ () => setFormOption({ fromEmail: '' }) }
				isShownByDefault={ false }
			>
				<TextControl
					label={ __( 'From Name', 'otter-blocks' ) }
					value={ formOptions.fromName }
					onChange={ fromName => setFormOption({ fromName }) }
					help={ __( 'Set the name of the sender. Some SMTP plugins might override this value.', 'otter-blocks' ) }
				/>
			</ToolsPanelItem>

			<ToolsPanelItem
				hasValue={ () => undefined !== formOptions.redirectLink }
				label={ __( 'Redirect on Submit', 'otter-blocks' ) }
				onDeselect={ () => setFormOption({ redirectLink: '' }) }
				isShownByDefault={ false }
			>
				<TextControl
					label={ __( 'Redirect on Submit', 'otter-blocks' ) }
					type="url"
					placeholder={ __( 'https://example.com', 'otter-blocks' ) }
					value={ formOptions.redirectLink }
					onChange={ redirectLink => setFormOption({ redirectLink })  }
					help={ __( 'Redirect the user to another page when submit is successful.', 'otter-blocks' ) }
				/>

				{ formOptions.redirectLink && (
					<ExternalLink
						href={ formOptions.redirectLink }
						style={ {
							marginBottom: '10px',
							display: 'block'
						} }
					>
						{ __( 'Preview Redirect link.', 'otter-blocks' ) }
					</ExternalLink>
				) }
			</ToolsPanelItem>

			<ToolsPanelItem
				hasValue={ () => true === attributes.hasCaptcha }
				label={ __( 'Enable reCaptcha', 'otter-blocks' ) }
				onSelect={ () => setAttributes({ hasCaptcha: true }) }
				onDeselect={ () => setAttributes({ hasCaptcha: false }) }
				isShownByDefault={ false }
			>
				<Notice
					notice={
						<div>
							{ __( 'Captcha is activated. You can modify the API Keys in Integrations tab from Settings > Otter.', 'otter-blocks' ) }
							<ExternalLink href={ ( window?.themeisleGutenberg?.optionsPath ) }>{ __( 'Go to Dashboard.', 'otter-blocks' ) }</ExternalLink>
						</div>
					}
					variant="help"
				/>
			</ToolsPanelItem>

			{ ! Boolean( window.themeisleGutenberg?.hasPro ) && (
				<ToolsPanelItem
					hasValue={ () => false }
					label={ __( 'Autoresponder (Pro)', 'otter-blocks' ) }
					onDeselect={ () => {} }
				>
					<TextControl
						label={ __( 'Autoresponder Subject', 'otter-blocks' ) }
						placeholder={ __( 'Confirmation of your subscription', 'otter-blocks' ) }
						value={ undefined }
						onChange={ () => {} }
						help={ __( 'Enter the subject of the autoresponder email.', 'otter-blocks' ) }
						disabled
						className="o-disabled"
					/>

					<TextareaControl
						label={ __( 'Autoresponder Body', 'otter-blocks' ) }
						placeholder={ __( 'Thank you for subscribing!', 'otter-blocks' )}
						rows={2}
						value={ undefined }
						onChange={ () => {} }
						help={ __( 'Enter the body of the autoresponder email.', 'otter-blocks' ) }
						disabled
						className="o-disabled"
					/>

					<div>
						<Notice
							notice={ <ExternalLink href={ setUtm( window.themeisleGutenberg.upgradeLink, 'form-block' ) }>{ __( 'Unlock this with Otter Pro.', 'otter-blocks' ) }</ExternalLink> }
							variant="upsell"
						/>
						<p className="description">{ __( 'Automatically send follow-up emails to your users with the Autoresponder feature.', 'otter-blocks' ) }</p>
					</div>

				</ToolsPanelItem>
			) }
		</Fragment>
	);
};

/**
 *
 * @param {import('./type.js').FormInspectorProps} props
 * @returns
 */
const Inspector = ({
	attributes,
	setAttributes
}) => {

	const [ tab, setTab ] = useState( 'settings' );
	const [ buttonColorView, setButtonColorView ] = useState( 'normal' );

	const {
		responsiveSetAttributes,
		responsiveGetAttributes
	} = useResponsiveAttributes( setAttributes );

	const {
		listIDOptions,
		setListIDOptions,
		saveIntegration,
		savedFormOptions,
		sendTestEmail,
		loadingState,
		formOptions,
		setFormOption,
		testService,
		hasEmailField,
		children,
		inputFieldActions,
		hasInnerBlocks
	} = useContext( FormContext );

	const inputFields = selectAllFieldsFromForm( children );

	const formIntegrationChanged = isChanged([
		[ formOptions.provider, savedFormOptions?.integration?.provider ],
		[ formOptions.listId, savedFormOptions?.integration?.listId ],
		[ formOptions.action, savedFormOptions?.integration?.action ]
	]);

	const InputFieldList = SortableContainer( ({ items }) => {
		return (
			<div>
				{ items.map( ( item, index ) => {
					return (
						<SortableInputField
							key={ item.inputClientId }
							index={ index }
							item={ item }
							actions={inputFieldActions}
						/>
					);
				}) }
			</div>
		);
	});

	const onSortEnd = ({ oldIndex, newIndex }) => {
		inputFieldActions.move( inputFields?.[oldIndex]?.parentClientId, newIndex );
	};

	return (
		<InspectorControls>
			<InspectorHeader
				value={ tab }
				options={[
					{
						label: __( 'Settings', 'otter-blocks' ),
						value: 'settings'
					},
					{
						label: __( 'Style', 'otter-blocks' ),
						value: 'style'
					}
				]}
				onChange={ setTab }
			/>

			<div>
				{ 'settings' === tab && (
					<Fragment>
						{ hasInnerBlocks && (
							<PanelBody
								title={ __( 'Input Fields', 'otter-blocks' ) }
								initialOpen={ true }
							>
								<p>{ __( 'Press and hold to use drag and drop to sort the tabs', 'otter-blocks' ) }</p>

								{ 0 < children?.length && (
									<InputFieldList
										items={ inputFields }
										onSortEnd={ onSortEnd }
										useDragHandle
										axis="y"
										lockAxis="y"
									/>
								) }

								<Button
									variant="secondary"
									className="wp-block-themeisle-blocks-tabs-inspector-add-tab"
									onClick={ () => inputFieldActions?.add?.( 'themeisle-blocks/form-input' ) }
								>
									{ __( 'Add Input Field', 'otter-blocks' ) }
								</Button>
							</PanelBody>
						) }

						<ToolsPanel
							label={ __( 'Form Options' ) }
							className="o-form-options"
						>
							{ 'loading' === loadingState?.formOptions && (
								<div className="o-fetch-msg">
									<Spinner />
									{ __( 'Loading the options. Please wait...', 'otter-blocks' ) }
								</div>
							) }

							{ 'error' === loadingState?.formOptions && (
								<div className="o-fetch-msg o-error">
									{ __( 'An error has occurred while saving. Please try again.', 'otter-blocks' ) }
								</div>
							) }

							{ applyFilters(
								'otter.formBlock.options',
								<FormOptions
									formOptions={formOptions}
									setFormOption={setFormOption}
									attributes={attributes}
									setAttributes={setAttributes}
								/>,
								formOptions,
								setFormOption
							) }
						</ToolsPanel>

						<PanelBody
							title={ __( 'Marketing Integration', 'otter-blocks' ) }
							initialOpen={ false }
						>
							{ __( 'Add your client email to a Digital Marketing provider.', 'otter-blocks' ) }

							<br /> <br />

							{ 'loading' === loadingState?.formIntegration && (
								<div className="o-fetch-msg">
									<Spinner />
									{ __( 'Fetching data from server. Please wait.', 'otter-blocks' ) }
								</div>
							) }

							<b>{ __( 'You need to have at least one email field in your form. For multiple email fields, only the first will be used.', 'otter-blocks' ) }</b>

							<SelectControl
								label={ __( 'Provider', 'otter-blocks' ) }
								value={ formOptions.provider }
								options={ [
									{ label: __( 'None', 'otter-blocks' ), value: '' },
									{ label: __( 'Mailchimp', 'otter-blocks' ), value: 'mailchimp' },
									{ label: __( 'Sendinblue', 'otter-blocks' ), value: 'sendinblue' }
								] }
								onChange={ provider => {
									setFormOption({ provider, listId: '', apiKey: '' });
								} }
							/>

							{ formOptions.provider && (
								<Fragment>
									{ ! formOptions.apiKey && (
										<Fragment>
											{ 'mailchimp' === formOptions?.provider && (
												<ExternalLink
													href="https://us5.admin.mailchimp.com/account/api/"
													style={{ marginBottom: '10px', display: 'block' }}
													target="_blank"
												>
													{ __( 'Guide to generate the API Key.', 'otter-blocks' ) }
												</ExternalLink>
											) }
											{ 'sendinblue' === formOptions?.provider && (
												<ExternalLink
													href="https://help.sendinblue.com/hc/en-us/articles/209467485-What-s-an-API-key-and-how-can-I-get-mine-"
													style={{ marginBottom: '10px', display: 'block' }}
													target="_blank"
												>
													{ __( 'Guide to generate the API Key.', 'otter-blocks' ) }
												</ExternalLink>
											) }
										</Fragment>

									) }

									<TextControl
										label={ __( 'API Key', 'otter-blocks' ) }
										help={ __( 'You can find the key in the provider\'s website', 'otter-blocks' ) }
										value={ formOptions.apiKey ? `*************************${formOptions.apiKey.slice( -8 )}` : '' }
										onChange={ apiKey => {
											setListIDOptions([]);
											setFormOption({
												listId: '',
												apiKey
											});
										}}
									/>

									{ formOptions.apiKey && 2 > listIDOptions.length && 'loading' === loadingState?.listId && (
										<Fragment>
											<Spinner />
											{ __( 'Loading the options.', 'otter-blocks' ) }
											<br /><br/>
										</Fragment>
									) }

									{ formOptions.apiKey && 'error' === loadingState?.listId && (
										<Fragment>
											{ __( 'Invalid API Key. Please check your API Key in the provider\'s Dashboard.', 'otter-blocks' ) }

											<ExternalLink
												target="_blank"
												style={{ marginBottom: '10px', display: 'block' }}
												href={ 'sendinblue' === formOptions.provider ? 'https://account.sendinblue.com/advanced/api' : 'https://us5.admin.mailchimp.com/account/api/' }
											>
												{ __( 'Go to Dashboard.', 'otter-blocks' ) }
											</ExternalLink>
										</Fragment>
									) }

									{ formOptions.apiKey && 'timeout' === loadingState?.listId && (
										<p>{ __( 'Could no connect to the server. Please try again.', 'otter-blocks' ) }</p>
									) }

									{ formOptions.apiKey && 'done' === loadingState?.listId && (
										<Fragment>
											<SelectControl
												label={ __( 'Contact List', 'otter-blocks' ) }
												value={ formOptions.listId }
												options={ listIDOptions }
												onChange={ listId => setFormOption({ listId }) }
											/>

											{ 1 >= listIDOptions?.length && <p> { __( 'No Contact list found. Please create a list in your provider interface or check if the API key is correct.', 'otter-blocks' ) } </p> }

											{ 2 <= listIDOptions?.length && formOptions.listId && (
												<Fragment>
													<SelectControl
														label={ __( 'Action', 'otter-blocks' ) }
														value={ formOptions.action }
														options={ [
															{ label: __( 'Default', 'otter-blocks' ), value: '' },
															{ label: __( 'Subscribe', 'otter-blocks' ), value: 'subscribe' },
															{ label: __( 'Submit & Subscribe', 'otter-blocks' ), value: 'submit-subscribe' }
														] }
														onChange={ action => setFormOption({ action }) }
													/>

													{ 'submit-subscribe' === formOptions.action && (
														<div style={{ marginBottom: '10px' }}>
															{ __( 'This action will add the client to the contact list and send a separate email with the form data to administrator or to the email mentioned in \'Form to\' field. A checkbox for data-sharing consent with third-party will be added on form.', 'otter-blocks' ) }
														</div>
													) }
												</Fragment>
											) }
										</Fragment>
									) }
								</Fragment>
							) }

							<div
								style={{
									display: 'flex',
									flexDirection: 'row',
									gap: '10px'
								}}
							>
								<Button
									variant="primary"
									onClick={ saveIntegration }
									isBusy={'saving' === loadingState?.formIntegration }
								>
									{ 'saving' === loadingState?.formIntegration ? __( 'Saving', 'otter-blocks' ) : __( 'Save', 'otter-blocks' ) }
								</Button>

								{ attributes.optionName && savedFormOptions?.integration?.provider && savedFormOptions?.integration?.apiKey && savedFormOptions?.integration?.listId && (
									<Button
										variant="secondary"
										onClick={ testService }
										isBusy={ 'saving' === loadingState?.serviceTesting }
									>
										{ __( 'Test Service', 'otter-blocks' ) }
									</Button>
								) }
							</div>


							{ 'done' === loadingState?.formIntegration && formIntegrationChanged && (
								<div className="o-fetch-msg">
									{ __( 'You have made some modifications. Do not forget to save the options.', 'otter-blocks' ) }
								</div>
							) }

							{ 'done' === loadingState?.serviceTesting && (
								<div className="o-fetch-msg">
									{ __( 'Remember to delete the test email from your provider\'s contact list.', 'otter-blocks' ) }
								</div>
							) }

							{ 	( 'done' === loadingState?.formIntegration && formOptions?.apiKey && formOptions?.listId && ! hasEmailField ) && (
								<div className="o-fetch-msg o-error">
									{ __( 'Please add a Text Field with Email as type in your form for email registration.', 'otter-blocks' ) }
								</div>
							) }

							{ 'error' === loadingState?.formIntegration && (
								<div className="o-fetch-msg o-error">
									{ __( 'An error has occurred while saving. Please try again.', 'otter-blocks' ) }
								</div>
							) }
						</PanelBody>

						<PanelBody
							title={ __( 'Submit Messages', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<TextareaControl
								label={ __( 'Success Message', 'otter-blocks' ) }
								placeholder={ __( 'Success', 'otter-blocks' ) }
								value={ formOptions.submitMessage }
								onChange={ submitMessage =>  setFormOption({ submitMessage })  }
								help={ __( 'Show this message after the form was successfully submitted.', 'otter-blocks' ) }
							/>

							<TextareaControl
								label={ __( 'Error Message', 'otter-blocks' ) }
								placeholder={ __( 'Error. Please try again.', 'otter-blocks' ) }
								value={ formOptions.errorMessage }
								onChange={ errorMessage =>  setFormOption({ errorMessage })  }
								help={ __( 'This message will be displayed when there is a problem with the server.' ) }
							/>
						</PanelBody>

						<InspectorExtensions/>
					</Fragment>
				) }

				{ 'style' === tab && (
					<Fragment>
						<SyncColorPanel
							label={ __( 'Form Color', 'otter-blocks' ) }
							isSynced={ attributes.isSynced ?? [] }
							initialOpen={ true }
							setAttributes={ setAttributes }
							options={ [
								{
									value: attributes.labelColor,
									label: __( 'Label', 'otter-blocks' ),
									slug: 'labelColor'
								},
								{
									value: attributes.inputColor,
									label: __( 'Input Text', 'otter-blocks' ),
									slug: 'inputColor'
								},
								{
									value: attributes.inputBackgroundColor,
									label: __( 'Input Background', 'otter-blocks' ),
									slug: 'inputBackgroundColor'
								},
								{
									value: attributes.inputBorderColor,
									label: __( 'Border', 'otter-blocks' ),
									slug: 'inputBorderColor'
								},
								{
									value: attributes.helpLabelColor,
									label: __( 'Helper Label', 'otter-blocks' ),
									slug: 'helpLabelColor'
								},
								{
									value: attributes.inputRequiredColor,
									label: __( 'Required Label', 'otter-blocks' ),
									slug: 'inputRequiredColor'
								},
								{
									value: attributes.submitMessageColor,
									label: __( 'Success Message', 'otter-blocks' ),
									slug: 'submitMessageColor'
								},
								{
									value: attributes.submitMessageErrorColor,
									label: __( 'Error Message', 'otter-blocks' ),
									slug: 'submitMessageErrorColor'
								}
							] }
						/>
						<PanelBody
							title={ __( 'Button', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<SyncControlDropdown
								isSynced={ attributes.isSynced }
								options={[
									{
										label: __( 'Font Size', 'otter-blocks' ),
										value: 'submitFontSize'
									},
									{
										label: __( 'Normal Text Color', 'otter-blocks' ),
										value: 'submitColor'
									},
									{
										label: __( 'Normal Background Color', 'otter-blocks' ),
										value: 'submitBackgroundColor'
									},
									{
										label: __( 'Hover Text Color', 'otter-blocks' ),
										value: 'submitColorHover'
									},
									{
										label: __( 'Hover Background Color', 'otter-blocks' ),
										value: 'submitBackgroundColorHover'
									},
									{
										label: __( 'Padding', 'otter-blocks' ),
										value: responsiveGetAttributes([ 'buttonPadding', 'buttonPaddingTablet', 'buttonPaddingMobile' ])
									}
								]}
								setAttributes={ setAttributes }
							/>

							<ToogleGroupControl
								value={ buttonColorView }
								onChange={ setButtonColorView }
								options={[
									{
										label: 'Normal',
										value: 'normal'
									},
									{
										label: 'Hover',
										value: 'hover'
									}
								]}
							/>

							<br/>

							{ ( 'normal' === buttonColorView && (
								<Fragment>
									<AutoDisableSyncAttr attributes={ attributes } attr={'submitColor'}>
										<ColorDropdownControl
											label={ __( 'Text', 'otter-blocks' ) }
											colorValue={ attributes.submitColor }
											onColorChange={( /** @type {string} */ value ) => setAttributes({ submitColor: value })}
											className="is-list is-first"
										/>
									</AutoDisableSyncAttr>

									<AutoDisableSyncAttr attributes={ attributes } attr={'submitBackgroundColor'}>
										<ColorDropdownControl
											label={__( 'Background', 'otter-blocks' )}
											colorValue={attributes.submitBackgroundColor}
											onColorChange={( /** @type {string} */ value ) => setAttributes({ submitBackgroundColor: value })}
											className="is-list"
										/>
									</AutoDisableSyncAttr>
								</Fragment>
							) ) || ( 'hover' === buttonColorView && (
								<Fragment>
									<AutoDisableSyncAttr attributes={ attributes } attr={'submitColorHover'}>
										<ColorDropdownControl
											label={ __( 'Text', 'otter-blocks' ) }
											colorValue={ attributes.submitColorHover }
											onColorChange={( /** @type {string} */ value ) => setAttributes({ submitColorHover: value })}
											className="is-list is-first"
										/>
									</AutoDisableSyncAttr>

									<AutoDisableSyncAttr attributes={ attributes } attr={'submitBackgroundColorHover'}>
										<ColorDropdownControl
											label={ __( 'Background', 'otter-blocks' ) }
											colorValue={ attributes.submitBackgroundColorHover }
											onColorChange={( /** @type {string} */ value ) => setAttributes({ submitBackgroundColorHover: value })}
											className="is-list"
										/>
									</AutoDisableSyncAttr>
								</Fragment>
							) )}

							<br/>

							<AutoDisableSyncAttr attributes={ attributes } attr={ 'submitFontSize' }>
								<FontSizePicker
									label={ __( 'Font Size', 'otter-blocks' ) }
									fontSizes={ defaultFontSizes }
									withReset
									value={ attributes.submitFontSize }
									onChange={ submitFontSize =>  setAttributes({ submitFontSize }) }
								/>
							</AutoDisableSyncAttr>

							<ResponsiveControl
								label={ __( 'Screen Type', 'otter-blocks' ) }
							>
								<AutoDisableSyncAttr attributes={ attributes} attr={ responsiveGetAttributes([ 'buttonPadding', 'buttonPaddingTablet', 'buttonPaddingMobile' ]) }>
									<BoxControl
										label={ __( 'Padding', 'otter-blocks' ) }
										values={ responsiveGetAttributes([ attributes.buttonPadding, attributes.buttonPaddingTablet, attributes.buttonPaddingMobile ]) ?? { top: '10px', bottom: '10px', right: '20px', left: '20px' }  }
										onChange={ value =>  responsiveSetAttributes( value, [ 'buttonPadding', 'buttonPaddingTablet', 'buttonPaddingMobile' ]) }
									/>
								</AutoDisableSyncAttr>
							</ResponsiveControl>

							<ResponsiveControl
								label={ __( 'Alignment', 'otter-blocks' ) }
							>
								<ToogleGroupControl
									value={ responsiveGetAttributes([ attributes.submitStyle, attributes.submitStyleTablet, attributes.submitStyleMobile  ]) ?? 'left' }
									onChange={ value => responsiveSetAttributes( '' === value ? undefined : value, [ 'submitStyle', 'submitStyleTablet', 'submitStyleMobile' ]) }
									options={[
										{
											icon: alignLeft,
											label: __( 'Left', 'otter-blocks' ),
											value: 'left'
										},
										{
											icon: alignCenter,
											label: __( 'Center', 'otter-blocks' ),
											value: 'center'
										},
										{
											icon: alignRight,
											label: __( 'Right', 'otter-blocks' ),
											value: 'right'
										},
										{
											icon: menu,
											label: __( 'Full', 'otter-blocks' ),
											value: 'full'
										}
									]}
									hasIcon={ true }
								/>
							</ResponsiveControl>
						</PanelBody>

						<PanelBody
							title={ __( 'Labels', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<SyncControlDropdown
								isSynced={ attributes.isSynced }
								options={[
									{
										label: __( 'Font Size', 'otter-blocks' ),
										value: 'labelFontSize'
									},
									{
										label: __( 'Spacing', 'otter-blocks' ),
										value: 'inputGap'
									}
								]}
								setAttributes={ setAttributes }
							/>

							<AutoDisableSyncAttr attributes={ attributes } attr={'labelFontSize'}>
								<FontSizePicker
									label={ __( 'Font Size', 'otter-blocks' ) }
									fontSizes={ defaultFontSizes }
									withReset
									value={ attributes.labelFontSize }
									onChange={ labelFontSize =>  setAttributes({ labelFontSize }) }
								/>
							</AutoDisableSyncAttr>

							<AutoDisableSyncAttr attributes={ attributes } attr={'inputGap'}>
								<RangeControl
									label={ __( 'Spacing', 'otter-blocks' ) }
									value={ attributes.inputGap ?? 10 }
									onChange={ inputGap => setAttributes({ inputGap }) }
									allowReset
									step={ 0.1 }
									min={ 0 }
									max={ 50 }
									initialPosition={ 10 }
								/>
							</AutoDisableSyncAttr>
						</PanelBody>

						<PanelBody
							title={ __( 'Input Fields', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<SyncControlDropdown
								isSynced={attributes.isSynced}
								options={[
									{
										label: __( 'Input Font Size', 'otter-blocks' ),
										value: 'inputFontSize'
									},
									{
										label: __( 'Fields Spacing', 'otter-blocks' ),
										value: 'inputsGap'
									},
									{
										label: __( 'Input Padding', 'otter-blocks' ),
										value: 'inputPadding'
									}
								]}
								setAttributes={setAttributes}
							/>

							<AutoDisableSyncAttr attributes={attributes} attr={'inputFontSize'}>
								<FontSizePicker
									label={ __( 'Input Font Size', 'otter-blocks' ) }
									fontSizes={ defaultFontSizes }
									withReset
									value={ attributes.inputFontSize }
									onChange={ inputFontSize =>  setAttributes({ inputFontSize }) }
								/>

							</AutoDisableSyncAttr>

							<AutoDisableSyncAttr attributes={attributes} attr={'inputsGap'}>
								<RangeControl
									label={ __( 'Fields Spacing', 'otter-blocks' ) }
									value={ attributes.inputsGap ?? 16}
									onChange={ inputsGap => setAttributes({ inputsGap }) }
									allowReset
									min={ 0 }
									max={ 50 }
									initialPosition={ 16 }
								/>
							</AutoDisableSyncAttr>

							<ResponsiveControl
								label={ __( 'Screen Type', 'otter-blocks' ) }
							>
								<AutoDisableSyncAttr attributes={attributes} attr={responsiveGetAttributes([ 'inputPadding', 'inputPaddingTablet', 'inputPaddingMobile' ])}>
									<BoxControl
										label={ __( 'Input Padding', 'otter-blocks' ) }
										values={ responsiveGetAttributes([ attributes.inputPadding, attributes.inputPaddingTablet, attributes.inputPaddingMobile  ]) ?? { 'top': '8px', 'right': '8px', 'bottom': '8px', 'left': '8px' } }
										inputProps={ {
											min: 0,
											max: 500
										} }
										onChange={ value => responsiveSetAttributes( value, [ 'inputPadding', 'inputPaddingTablet', 'inputPaddingMobile' ]) }
									/>
								</AutoDisableSyncAttr>
							</ResponsiveControl>
						</PanelBody>

						<PanelBody
							title={ __( 'Border', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<SyncControlDropdown
								isSynced={ attributes.isSynced }
								options={[
									{
										label: __( 'Border Radius', 'otter-blocks' ),
										value: 'inputBorderRadius'
									},
									{
										label: __( 'Border Width', 'otter-blocks' ),
										value: 'inputBorderWidth'
									}
								]}
								setAttributes={ setAttributes }
							/>

							<AutoDisableSyncAttr attributes={ attributes } attr={'inputBorderRadius'}>
								<BoxControl
									label={ __( 'Border Radius', 'otter-blocks' ) }
									values={ ! isObjectLike( attributes.inputBorderRadius ) ? makeBox( _px( attributes.inputBorderRadius ?? 4 ) ) : attributes.inputBorderRadius }
									onChange={ inputBorderRadius  => setAttributes({ inputBorderRadius }) }
									id="o-border-raduis-box"
								/>
							</AutoDisableSyncAttr>

							<AutoDisableSyncAttr attributes={ attributes } attr={'inputBorderWidth'}>
								<BoxControl
									label={ __( 'Border Width', 'otter-blocks' ) }
									values={ ! isObjectLike( attributes.inputBorderWidth ) ? makeBox( _px( attributes.inputBorderWidth ?? 1 ) ) : attributes.inputBorderWidth }
									onChange={ inputBorderWidth  => setAttributes({ inputBorderWidth }) }
								/>
							</AutoDisableSyncAttr>
						</PanelBody>

						<PanelBody
							title={ __( 'Helper & Submit Messages', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<SyncControlDropdown
								isSynced={ attributes.isSynced }
								options={[
									{
										label: __( 'Helper Text Size', 'otter-blocks' ),
										value: 'helpFontSize'
									},
									{
										label: __( 'Success/Error Message Size', 'otter-blocks' ),
										value: 'messageFontSize'
									}
								]}
								setAttributes={ setAttributes }
							/>

							<AutoDisableSyncAttr attributes={ attributes } attr={ 'helpFontSize' }>
								<BaseControl
									label={ __( 'Helper Text Size', 'otter-blocks' ) }
								>
									<FontSizePicker
										fontSizes={ defaultFontSizes }
										withReset
										value={ attributes.helpFontSize }
										onChange={ helpFontSize =>  setAttributes({ helpFontSize }) }
									/>
								</BaseControl>
							</AutoDisableSyncAttr>

							<AutoDisableSyncAttr attributes={ attributes } attr={ 'messageFontSize' }>
								<BaseControl
									label={ __( 'Success/Error Message Size', 'otter-blocks' ) }
								>
									<FontSizePicker
										fontSizes={ defaultFontSizes }
										withReset
										value={ attributes.messageFontSize }
										onChange={ messageFontSize =>  setAttributes({ messageFontSize }) }
									/>
								</BaseControl>
							</AutoDisableSyncAttr>
						</PanelBody>
					</Fragment>
				) }
			</div>

			<InspectorAdvancedControls>
				<span>{ __( 'In order for the Form to work properly, make sure your SMTP server is set up. The test email will be send to the address from the Email To field in Form Options.', 'otter-blocks' ) }</span>

				<ExternalLink
					href="https://docs.themeisle.com/article/1713-how-to-set-up-your-smtp-server"
					style={{ marginLeft: '3px' }}
				>
					{ __( 'Learn more.', 'otter-blocks' ) }
				</ExternalLink>

				<br/>

				<Button
					variant="primary"
					style={{ marginTop: '8px' }}
					onClick={ sendTestEmail }
				>
					{ __( 'Send Test Email', 'otter-blocks' )  }
				</Button>
			</InspectorAdvancedControls>
		</InspectorControls>
	);
};

export default Inspector;
