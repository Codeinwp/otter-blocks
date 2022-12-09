// @ts-check

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	InspectorControls,
	PanelColorSettings
} from '@wordpress/block-editor';

import {
	BaseControl,
	Button,
	ExternalLink,
	PanelBody,
	RangeControl,
	SelectControl,
	Spinner,
	TextControl,
	ToggleControl,
	TextareaControl,
	__experimentalBoxControl as BoxControl,
	FontSizePicker
} from '@wordpress/components';

import {
	Fragment,
	useContext,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies.
 */
import { FormContext } from './edit.js';
import { ColorDropdownControl, InspectorHeader, ResponsiveControl, ToogleGroupControl } from '../../components/index.js';
import { useResponsiveAttributes } from '../../helpers/utility-hooks.js';

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
	const [ mailRecipientsView, setMailRecipientsView ] = useState( 'to' );
	const [ buttonColorView, setButtonColorView ] = useState( 'normal' );

	const {
		responsiveSetAttributes,
		responsiveGetAttributes
	} = useResponsiveAttributes( setAttributes );

	const {
		listIDOptions,
		setListIDOptions,
		saveFormEmailOptions,
		saveIntegration,
		savedFormOptions,
		sendTestEmail,
		loadingState,
		formOptions,
		setFormOption,
		testService,
		hasEmailField
	} = useContext( FormContext );

	const formOptionsChanged = isChanged([
		[ formOptions.emailTo, savedFormOptions?.email ],
		[ formOptions.subject, savedFormOptions?.emailSubject ],
		[ formOptions.redirectLink, savedFormOptions?.redirectLink ],
		[ formOptions.fromName, savedFormOptions?.fromName ],
		[ formOptions.submitMessage, savedFormOptions?.submitMessage ],
		[ formOptions.cc, savedFormOptions?.cc ],
		[ formOptions.bcc, savedFormOptions?.bcc ],
		[ formOptions.hasCaptcha, savedFormOptions?.hasCaptcha ]
	]);

	const formIntegrationChanged = isChanged([
		[ formOptions.provider, savedFormOptions?.integration?.provider ],
		[ formOptions.listId, savedFormOptions?.integration?.listId ],
		[ formOptions.action, savedFormOptions?.integration?.action ]
	]);

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
						<PanelBody
							title={ __( 'Form Options', 'otter-blocks' ) }
							initialOpen={ true }
						>
							{
								'loading' === loadingState?.formOptions && (
									<div className="o-fetch-msg">
										<Spinner />
										{ __( 'Loading the options. Please wait...', 'otter-blocks' ) }
									</div>
								)
							}

							<ToogleGroupControl
								value={ mailRecipientsView }
								onChange={ setMailRecipientsView }
								options={[
									{
										label: __( 'To', 'otter-blocks' ),
										value: 'to'
									},
									{
										label: __( 'Cc', 'otter-blocks' ),
										value: 'cc'
									},
									{
										label: __( 'Bcc', 'otter-blocks' ),
										value: 'bcc'
									}
								]}
							/>

							{
								( 'to' === mailRecipientsView && (
									<TextControl
										label={ __( 'Email To', 'otter-blocks' ) }
										placeholder={ __( 'Default is to admin site', 'otter-blocks' ) }
										type="email"
										value={ formOptions.emailTo }
										onChange={ emailTo => setFormOption({ emailTo }) }
										help={ __( 'Send the form\'s data to another email. (Admin\'s email is default).', 'otter-blocks' ) }
									/>
								) ) ||
								( 'cc' === mailRecipientsView && (
									<TextControl
										label={ __( 'Cc', 'otter-blocks' ) }
										placeholder={ __( 'Send copies to', 'otter-blocks' ) }
										type="text"
										value={ formOptions.cc }
										onChange={ cc => setFormOption({ cc }) }
										help={ __( 'Add emails separated by commas: example1@otter.com, example2@otter.com.', 'otter-blocks' ) }
									/>
								) ) ||
								( 'bcc' === mailRecipientsView && (
									<TextControl
										label={ __( 'Bcc', 'otter-blocks' ) }
										placeholder={ __( 'Send copies to', 'otter-blocks' ) }
										type="text"
										value={ formOptions.bcc }
										onChange={ bcc => setFormOption({ bcc }) }
										help={ __( 'Add emails separated by commas: example1@otter.com, example2@otter.com.', 'otter-blocks' ) }
									/>
								) )
							}

							<TextControl
								label={ __( 'Email Subject', 'otter-blocks' ) }
								placeholder={ __( 'A new submission', 'otter-blocks' ) }
								value={ formOptions.subject }
								onChange={ subject => setFormOption({ subject }) }
								help={ __( 'Customize the title of the email that you are gonna receive after a user submits the form.', 'otter-blocks' ) }
							/>

							<TextControl
								label={ __( 'From Name', 'otter-blocks' ) }
								value={ formOptions.fromName }
								onChange={ fromName => setFormOption({ fromName }) }
								help={ __( 'Set the name of the sender. Some SMTP plugins might override this value.', 'otter-blocks' ) }
							/>

							<TextareaControl
								label={ __( 'Submit Success Message', 'otter-blocks' ) }
								placeholder={ __( 'Success', 'otter-blocks' ) }
								value={ formOptions.submitMessage }
								onChange={ submitMessage =>  setFormOption({ submitMessage })  }
								help={ __( 'Show this message after the form was successfully submitted.', 'otter-blocks' ) }
							/>

							{ 'done' === loadingState?.formOptions && formOptionsChanged && (
								<div className="o-fetch-msg">
									{ __( 'You have made some modifications. Do not forget to save the options.', 'otter-blocks' ) }
								</div>
							) }

							{ 'error' === loadingState?.formOptions && (
								<div className="o-fetch-msg o-error">
									{ __( 'An error has occurred while saving. Please try again.', 'otter-blocks' ) }
								</div>
							) }

						</PanelBody>
						<PanelBody
							title={ __( 'Button options', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<ResponsiveControl
								label={ __( 'Alignment', 'otter-blocks' ) }
							>
								<SelectControl
									value={ responsiveGetAttributes([ attributes.submitStyle, attributes.submitStyleTablet, attributes.submitStyleMobile  ]) ?? 'default-template' }
									options={[
										{
											label: 'Default',
											value: 'left'
										},
										{
											label: 'Right',
											value: 'right'
										},
										{
											label: 'Full',
											value: 'full'
										}
									]}
									onChange={ value => responsiveSetAttributes( '' === value ? undefined : value, [ 'submitStyle', 'submitStyleTablet', 'submitStyleMobile' ]) }
								/>
							</ResponsiveControl>

							<TextControl
								label={ __( 'Label', 'otter-blocks' ) }
								placeholder={ __( 'Submit', 'otter-blocks' ) }
								value={ attributes.submitLabel }
								onChange={ submitLabel => setAttributes({ submitLabel }) }
								help={ __( 'Set the label for the submit button.', 'otter-blocks' ) }
							/>
						</PanelBody>
						<PanelBody
							title={ __( 'Action after Submit', 'otter-blocks' ) }
							initialOpen={ true }
						>
							<TextControl
								label={ __( 'Redirect To', 'otter-blocks' ) }
								type="url"
								placeholder={ __( 'https://example.com', 'otter-blocks' ) }
								value={ formOptions.redirectLink }
								onChange={ redirectLink => setFormOption({ redirectLink })  }
								help={ __( 'Redirect the user to another page when submit is successful.', 'otter-blocks' ) }
							/>

							{
								formOptions.redirectLink && (
									<ExternalLink
										href={ formOptions.redirectLink }
										style={ {
											marginBottom: '10px',
											display: 'block'
										} }
									>
										{ __( 'Preview Redirect link.', 'otter-blocks' ) }
									</ExternalLink>
								)
							}
						</PanelBody>
						<PanelBody
							title={ __( 'Marketing Integration', 'otter-blocks' ) }
							initialOpen={ false }
						>
							{ __( 'Add your client email to a Digital Marketing provider.', 'otter-blocks' ) }
							<br /> <br />
							{
								'loading' === loadingState?.formIntegration && (
									<div className="o-fetch-msg">
										<Spinner />
										{ __( 'Fetching data from server. Please wait.', 'otter-blocks' ) }
									</div>
								)
							}
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

							{
								formOptions.provider && (
									<Fragment>
										{ ! formOptions.apiKey && (
											<Fragment>
												{
													'mailchimp' === formOptions?.provider && (
														<ExternalLink
															href="https://us5.admin.mailchimp.com/account/api/"
															style={{ marginBottom: '10px', display: 'block' }}
															target="_blank"
														>
															{ __( 'Guide to generate the API Key.', 'otter-blocks' ) }
														</ExternalLink>
													)
												}
												{
													'sendinblue' === formOptions?.provider && (
														<ExternalLink
															href="https://help.sendinblue.com/hc/en-us/articles/209467485-What-s-an-API-key-and-how-can-I-get-mine-"
															style={{ marginBottom: '10px', display: 'block' }}
															target="_blank"
														>
															{ __( 'Guide to generate the API Key.', 'otter-blocks' ) }
														</ExternalLink>
													)
												}
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

										{
											formOptions.apiKey && 'done' === loadingState?.listId && (
												<Fragment>
													<SelectControl
														label={ __( 'Contact List', 'otter-blocks' ) }
														value={ formOptions.listId }
														options={ listIDOptions }
														onChange={ listId => setFormOption({ listId }) }
													/>
													{
														1 >= listIDOptions?.length && (
															<p>
																{ __( 'No Contact list found. Please create a list in your provider interface or check if the API key is correct.', 'otter-blocks' ) }
															</p>
														)
													}
													{
														2 <= listIDOptions?.length && formOptions.listId && (
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
																{
																	'submit-subscribe' === formOptions.action && (
																		<div style={{ marginBottom: '10px' }}>
																			{
																				__( 'This action will add the client to the contact list and send a separate email with the form data to administrator or to the email mentioned in \'Form to\' field. A checkbox for data-sharing consent with third-party will be added on form.', 'otter-blocks' )
																			}
																		</div>
																	)
																}

															</Fragment>
														)
													}
												</Fragment>
											)
										}
									</Fragment>
								)
							}

							<div
								style={{
									display: 'flex',
									flexDirection: 'row',
									gap: '10px'
								}}
							>
								<Button
									isPrimary
									variant="primary"
									onClick={ saveIntegration }
									isBusy={'saving' === loadingState?.formIntegration }
								>
									{ 'saving' === loadingState?.formIntegration ? __( 'Saving', 'otter-blocks' ) : __( 'Save', 'otter-blocks' ) }
								</Button>
								{
									attributes.optionName && savedFormOptions?.integration?.provider && savedFormOptions?.integration?.apiKey && savedFormOptions?.integration?.listId && (
										<Button
											isSecondary
											variant="secondary"
											onClick={ testService }
											isBusy={ 'saving' === loadingState?.serviceTesting }
										>
											<Fragment>
												{
													__( 'Test Service', 'otter-blocks' )
												}
											</Fragment>
										</Button>
									)
								}
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
							title={ __( 'Send Test Email', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<span>{ __( 'In order for the Form to work properly, make sure your SMTP server is set up. The test email will be send to the address from the field Email To on Form Options.', 'otter-blocks' ) }</span>

							<ExternalLink
								href="https://www.wpbeginner.com/wp-tutorials/how-to-use-smtp-server-to-send-wordpress-emails/"
								style={{ marginLeft: '3px' }}
							>
								{ __( 'Learn more.', 'otter-blocks' ) }
							</ExternalLink>

							<br/>

							<Button
								variant="primary"
								isPrimary
								style={{ marginTop: '8px' }}
								onClick={ sendTestEmail }
							>
								{ __( 'Send Test Email', 'otter-blocks' )  }
							</Button>
						</PanelBody>

						<PanelBody
							title={ __( 'Bot Protection', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<ToggleControl
								label={ __( 'Add captcha checkbox', 'otter-blocks' ) }
								checked={ attributes.hasCaptcha }
								onChange={ hasCaptcha => setAttributes({ hasCaptcha }) }
								help={ __( 'Add Google reCaptcha V2 for protection againts bots. You will need an API Key.', 'otter-blocks' ) }
							/>

							{
								formOptions.hasCaptcha && (
									<div
										style={{
											display: 'flow-root',
											margin: '10px 0px'
										}}
									>
										{ __( 'You can change the reCaptcha API Keys in Settings > Otter. ', 'otter-blocks' ) }
										<ExternalLink
											href="https://www.google.com/recaptcha/about/"
											target="_blank"

										>
											{ __( 'Learn more about reCaptcha.', 'otter-blocks' ) }
										</ExternalLink>
									</div>
								)
							}
						</PanelBody>
					</Fragment>
				) }
				{
					'style' === tab && (
						<Fragment>
							<PanelColorSettings
								title={ __( 'Form Color', 'otter-blocks' ) }
								initialOpen={ false }
								colorSettings={ [
									{
										value: attributes.labelColor,
										onChange: labelColor => setAttributes({ labelColor }),
										label: __( 'Label', 'otter-blocks' )
									},
									{
										value: attributes.helpLabelColor,
										onChange: helpLabelColor => setAttributes({ helpLabelColor }),
										label: __( 'Help Label', 'otter-blocks' )
									},
									{
										value: attributes.inputBorderColor,
										onChange: inputBorderColor => setAttributes({ inputBorderColor }),
										label: __( 'Border', 'otter-blocks' )
									},
									{
										value: attributes.inputRequiredColor,
										onChange: inputRequiredColor => setAttributes({ inputRequiredColor }),
										label: __( 'Label Required', 'otter-blocks' )
									},
									{
										value: attributes.inputColor,
										onChange: inputColor => setAttributes({ inputColor }),
										label: __( 'Input Text', 'otter-blocks' )
									},
									{
										value: attributes.inputBackgroundColor,
										onChange: inputBackgroundColor => setAttributes({ inputBackgroundColor }),
										label: __( 'Input Background', 'otter-blocks' )
									}
								] }
							/>

							<PanelBody
								title={ __( 'Button', 'otter-blocks' ) }
								initialOpen={ true }
							>

								<ToogleGroupControl
									value={buttonColorView}
									onChange={setButtonColorView}
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

								{
									( 'normal' === buttonColorView && (
										<Fragment>
											<ColorDropdownControl
												label={__( 'Text', 'otter-blocks' )}
												colorValue={attributes.submitColor}
												onColorChange={( /** @type {string} */ value ) => setAttributes({ submitColor: value })}
											/>

											<ColorDropdownControl
												label={__( 'Background', 'otter-blocks' )}
												colorValue={attributes.submitBackgroundColor}
												onColorChange={( /** @type {string} */ value ) => setAttributes({ submitBackgroundColor: value })}
											/>
										</Fragment>
									) ) ||
									( 'hover' === buttonColorView && (
										<Fragment>
											<ColorDropdownControl
												label={__( 'Text', 'otter-blocks' )}
												colorValue={attributes.submitBackgroundColor}
												onColorChange={( /** @type {string} */ value ) => setAttributes({ submitColor: value })}
											/>

											<ColorDropdownControl
												label={__( 'Background', 'otter-blocks' )}
												colorValue={attributes.submitBackgroundColorHover}
												onColorChange={( /** @type {string} */ value ) => setAttributes({ submitBackgroundColor: value })}
											/>
										</Fragment>
									) )
								}

								<Fragment
									field={ 'submitFontSize' }
									isSynced={ attributes.isSynced }
									setAttributes={ setAttributes }
								>
									<FontSizePicker
										label={ __( 'Font Size', 'otter-blocks' ) }
										fontSizes={ defaultFontSizes }
										withReset
										value={ attributes.submitFontSize }
										onChange={ submitFontSize =>  setAttributes({ submitFontSize }) }
									/>
								</Fragment>

								<BoxControl
									label={ __( 'Padding', 'otter-blocks' ) }
									values={ responsiveGetAttributes([ attributes.buttonPadding, attributes.buttonPaddingTablet, attributes.buttonPaddingMobile  ]) ?? { top: '10px', bottom: '10px', right: '20px', left: '20px' }  }
									onChange={
										value => {

											// TODO: add clean up functions
											responsiveSetAttributes( value, [ 'buttonPadding', 'buttonPaddingTablet', 'buttonPaddingMobile' ]);
										}
									}
								/>


							</PanelBody>

							<PanelBody
								title={ __( 'Submit Messages', 'otter-blocks' ) }
								initialOpen={ true }
							>
								<ColorDropdownControl
									label={__( 'Success message', 'otter-blocks' )}
									colorValue={attributes.submitMessageColor}
									onColorChange={( /** @type {string} */ value ) => setAttributes({ submitMessageColor: value })}
								/>

								<ColorDropdownControl
									label={__( 'Error message', 'otter-blocks' )}
									colorValue={attributes.submitMessageErrorColor}
									onColorChange={( /** @type {string} */ value ) => setAttributes({ submitMessageErrorColor: value })}
								/>

								<Fragment
									field={ 'messageFontSize' }
									isSynced={ attributes.isSynced }
									setAttributes={ setAttributes }
								>
									<FontSizePicker
										fontSizes={ defaultFontSizes }
										withReset
										value={ attributes.messageFontSize }
										onChange={ messageFontSize =>  setAttributes({ messageFontSize }) }
									/>
								</Fragment>
							</PanelBody>

							<PanelColorSettings
								title={ __( 'Button Color', 'otter-blocks' ) }
								initialOpen={ false }
								colorSettings={ [
									{
										value: attributes.submitColor,
										onChange: submitColor => setAttributes({ submitColor }),
										label: __( 'Submit Text', 'otter-blocks' )
									},
									{
										value: attributes.submitBackgroundColor,
										onChange: submitBackgroundColor => setAttributes({ submitBackgroundColor }),
										label: __( 'Button Background', 'otter-blocks' )
									},
									{
										value: attributes.submitBackgroundColorHover,
										onChange: submitBackgroundColorHover => setAttributes({ submitBackgroundColorHover }),
										label: __( 'Button Background on Hover', 'otter-blocks' )
									},
									{
										value: attributes.submitMessageColor,
										onChange: submitMessageColor => setAttributes({ submitMessageColor }),
										label: __( 'Successful Message', 'otter-blocks' )
									},
									{
										value: attributes.submitMessageErrorColor,
										onChange: submitMessageErrorColor => setAttributes({ submitMessageErrorColor }),
										label: __( 'Error Message', 'otter-blocks' )
									}
								] }
							/>

							<PanelBody
								title={ __( 'Labels', 'otter-blocks' ) }
								initialOpen={ true }
							>
								<Fragment
									field={ 'labelFontSize' }
									isSynced={ attributes.isSynced }
									setAttributes={ setAttributes }
								>
									<FontSizePicker
										label={ __( 'Font Size', 'otter-blocks' ) }
										fontSizes={ defaultFontSizes }
										withReset
										value={ attributes.labelFontSize }
										onChange={ labelFontSize =>  setAttributes({ labelFontSize }) }
									/>
								</Fragment>
								<Fragment
									field={ 'inputGap' }
									isSynced={ attributes.isSynced }
									setAttributes={ setAttributes }
								>
									<RangeControl
										label={ __( 'Spacing', 'otter-blocks' ) }
										value={ attributes.inputGap ?? 10 }
										onChange={ inputGap => setAttributes({ inputGap }) }
										allowReset
										step={ 0.1 }
										min={ 0 }
										max={ 50 }
										initialPositino={ 10 }
									/>
								</Fragment>
							</PanelBody>

							<PanelBody
								title={ __( 'Input fields', 'otter-blocks' ) }
								initialOpen={ true }
							>
								<Fragment
									field={ 'inputFontSize' }
									isSynced={ attributes.isSynced }
									setAttributes={ setAttributes }
								>
									<FontSizePicker
										label={ __( 'Input Font Size', 'otter-blocks' ) }
										fontSizes={ defaultFontSizes }
										withReset
										value={ attributes.inputFontSize }
										onChange={ inputFontSize =>  setAttributes({ inputFontSize }) }
									/>
								</Fragment>

								<Fragment
									field={ 'inputsGap' }
									isSynced={ attributes.isSynced }
									setAttributes={ setAttributes }
								>
									<RangeControl
										label={ __( 'Fields Spacing', 'otter-blocks' ) }
										value={ attributes.inputsGap ?? 16}
										onChange={ inputsGap => setAttributes({ inputsGap }) }
										allowReset
										min={ 0 }
										max={ 50 }
										initialPosition={ 16 }
									/>
								</Fragment>

								<Fragment
									field={ 'inputPadding' }
									isSynced={ attributes.isSynced }
									setAttributes={ setAttributes }
								>
									<ResponsiveControl
										label={ __( 'Screen Type', 'otter-blocks' ) }
									>
										<BoxControl
											label={ __( 'Input Padding', 'otter-blocks' ) }
											values={ responsiveGetAttributes([ attributes.inputPadding, attributes.inputPaddingTablet, attributes.inputPaddingMobile  ]) ?? { 'top': '8px', 'right': '8px', 'bottom': '8px', 'left': '8px' } }
											inputProps={ {
												min: 0,
												max: 500
											} }
											onChange={ value => {

												// TODO: Add clean up
												responsiveSetAttributes( value, [ 'inputPadding', 'inputPaddingTablet', 'inputPaddingMobile' ]);
											} }
										/>
									</ResponsiveControl>

								</Fragment>

							</PanelBody>

							<PanelBody
								title={ __( 'Border', 'otter-blocks' ) }
								initialOpen={ false }
							>
								<Fragment
									field={ 'inputsBorderRadius' }
									isSynced={ attributes.isSynced }
									setAttributes={ setAttributes }
								>
									<RangeControl
										label={ __( 'Border Radius', 'otter-blocks' ) }
										value={ attributes.inputBorderRadius ?? 4 }
										onChange={ inputBorderRadius => setAttributes({ inputBorderRadius }) }
										allowReset
										step={ 0.1 }
										min={ 0 }
										max={ 50 }
									/>
								</Fragment>

								<Fragment
									field={ 'inputsBorderWidth' }
									isSynced={ attributes.isSynced }
									setAttributes={ setAttributes }
								>
									<RangeControl
										label={ __( 'Border Width', 'otter-blocks' ) }
										value={ attributes.inputBorderWidth ?? 1 }
										onChange={ inputBorderWidth => setAttributes({ inputBorderWidth }) }
										allowReset
										step={ 0.1 }
										min={ 0 }
										max={ 50 }
									/>
								</Fragment>
							</PanelBody>
							<PanelBody
								title={ __( 'Helper Text', 'otter-blocks' ) }
								initialOpen={ true }
							>
								<Fragment
									field={ 'helpFontSize' }
									isSynced={ attributes.isSynced }
									setAttributes={ setAttributes }
								>
									<BaseControl
										label={ __( 'Help Text Font Size', 'otter-blocks' ) }
									>
										<FontSizePicker
											label={ __( 'Help Font Size', 'otter-blocks' ) }
											fontSizes={ defaultFontSizes }
											withReset
											value={ attributes.helpFontSize }
											onChange={ helpFontSize =>  setAttributes({ helpFontSize }) }
										/>
									</BaseControl>
								</Fragment>
							</PanelBody>

						</Fragment>
					)
				}
			</div>


		</InspectorControls>
	);
};

export default Inspector;
