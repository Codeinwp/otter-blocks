/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { InspectorControls, PanelColorSettings } from '@wordpress/block-editor';

import {
	Button,
	ExternalLink,
	PanelBody,
	RangeControl,
	SelectControl,
	Spinner,
	Dashicon,
	TextControl,
	ToggleControl,
	__experimentalBoxControl as BoxControl
} from '@wordpress/components';

import {
	Fragment,
	useState,
	useContext
} from '@wordpress/element';

import classnames from 'classnames';

/**
 * Internal dependencies.
 */
import { FormContext } from './edit.js';
import SyncControl from '../../components/sync-control';

const compare = x => {

	// console.log(x, x[0] !== x[1]); TODO: remove after testing
	return x?.[1] && x[0] !== x[1];
};

/**
 * Small utility function for checking if a list of variable pair are different.
 * @param {array} list
 * @return {boolean}
 */
const isChanged = list => {
	return Boolean( 0 < list.filter( compare ).length );
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
		testService
	} = useContext( FormContext );

	const [ tab, setTab ] = useState( 'general' );

	const formOptionsChanged = isChanged([
		[ formOptions.emailTo, savedFormOptions?.email ],
		[ formOptions.subject, savedFormOptions?.emailSubject ],
		[ formOptions.redirectLink, savedFormOptions?.redirectLink ],
		[ formOptions.fromName, savedFormOptions?.fromName ],
		[ formOptions.submitMessage, savedFormOptions?.submitMessage ],
		[ formOptions.hasCaptcha, savedFormOptions?.hasCaptcha ]
	]);

	const formIntegrationChanged = isChanged([
		[ formOptions.provider, savedFormOptions?.integration?.provider ],
		[ formOptions.listId, savedFormOptions?.integration?.listId ],
		[ formOptions.action, savedFormOptions?.integration?.action ]
	]);

	return (
		<InspectorControls>
			<PanelBody className="o-heading-header-panel">
				<Button
					className={ classnames(
						'header-tab',
						{ 'is-selected': 'general' === tab }
					) }
					onClick={ () => setTab( 'general' ) }
				>
					<span>
						<Dashicon icon="admin-customizer"/>
						{ __( 'General', 'otter-blocks' ) }
					</span>
				</Button>

				<Button
					className={ classnames(
						'header-tab',
						{ 'is-selected': 'advanced' === tab }
					) }
					onClick={ () => setTab( 'advanced' ) }
				>
					<span>
						<Dashicon icon="admin-generic"/>
						{ __( 'Advanced', 'otter-blocks' ) }
					</span>
				</Button>
			</PanelBody>

			{
				'general' === tab && (
					<Fragment>
						<PanelBody
							title={ __( 'Settings', 'otter-blocks' ) }
							initialOpen={ true }
						>
							<span>
								{
									__( 'Make sure to have an email provider set-up.', 'otter-blocks' )
								}
							</span>
							<ExternalLink
								href={'https://www.wpbeginner.com/plugins/how-to-set-up-wp-mail-smtp-with-any-host-ultimate-guide/'}
								style={{ marginLeft: '3px' }}
							>
								{ __( 'Learn more.', 'otter-blocks' ) }
							</ExternalLink>
							<br/>
							<Button
								variant="primary"
								isPrimary
								style={{ marginTop: '8px'}}
								onClick={ sendTestEmail }
							>
								{ __( 'Send Test Email', 'otter-blocks' )  }
							</Button>
							<TextControl
								label={ __( 'Button Label', 'otter-blocks' ) }
								placeholder={ __( 'Submit', 'otter-blocks' ) }
								value={ attributes.submitLabel }
								onChange={ submitLabel => setAttributes({ submitLabel }) }
								help={ __( 'Set the label for the submit button.', 'otter-blocks' ) }
							/>

							<SyncControl
								field={ 'submitFontSize' }
								isSynced={ attributes.isSynced }
								setAttributes={ setAttributes }
							>
								<RangeControl
									label={ __( 'Button Font Size', 'otter-blocks' ) }
									value={ attributes.submitFontSize }
									onChange={ submitFontSize => setAttributes({ submitFontSize }) }
									allowReset
									min={0}
									max={50}
								/>
							</SyncControl>

							<SelectControl
								label={ __( 'Button Style', 'otter-blocks' ) }
								value={ attributes.submitStyle }
								options={[
									{
										label: 'Default',
										value: ''
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
								onChange={ submitStyle => setAttributes({ submitStyle}) }
							/>

							<SyncControl
								field={ 'inputsGap' }
								isSynced={ attributes.isSynced }
								setAttributes={ setAttributes }
							>
								<RangeControl
									label={ __( 'Fields Spacing', 'otter-blocks' ) }
									value={ attributes.inputsGap || 10 }
									onChange={ inputsGap => setAttributes({ inputsGap }) }
									allowReset
									min={0}
									max={50}
								/>
							</SyncControl>
						</PanelBody>

						<PanelBody
							title={ __( 'Input Styling', 'otter-blocks' ) }
						>

							<SyncControl
								field={ 'inputPadding' }
								isSynced={ attributes.isSynced }
								setAttributes={ setAttributes }
							>
								<BoxControl
									label={ __( 'Input Padding', 'otter-blocks' ) }
									values={ attributes.inputPadding }
									inputProps={ {
										min: 0,
										max: 500
									} }
									onChange={ inputPadding => setAttributes({ inputPadding }) }
								/>
							</SyncControl>

							<SyncControl
								field={ 'inputGap' }
								isSynced={ attributes.isSynced }
								setAttributes={ setAttributes }
							>
								<RangeControl
									label={ __( 'Label Spacing', 'otter-blocks' ) }
									value={ attributes.inputGap || 5}
									onChange={ inputGap => setAttributes({ inputGap }) }
									allowReset
									min={0}
									max={50}
								/>
							</SyncControl>

							<SyncControl
								field={ 'inputsBorderRadius' }
								isSynced={ attributes.isSynced }
								setAttributes={ setAttributes }
							>
								<RangeControl
									label={ __( 'Border Radius', 'otter-blocks' ) }
									value={ attributes.inputBorderRadius }
									onChange={ inputBorderRadius => setAttributes({ inputBorderRadius }) }
									allowReset
									min={0}
									max={50}
								/>
							</SyncControl>

							<SyncControl
								field={ 'inputsBorderWidth' }
								isSynced={ attributes.isSynced }
								setAttributes={ setAttributes }
							>
								<RangeControl
									label={ __( 'Border Width', 'otter-blocks' ) }
									value={ attributes.inputBorderWidth }
									onChange={ inputBorderWidth => setAttributes({ inputBorderWidth }) }
									allowReset
									min={0}
									max={50}
								/>
							</SyncControl>

							<SyncControl
								field={ 'labelFontSize' }
								isSynced={ attributes.isSynced }
								setAttributes={ setAttributes }
							>
								<RangeControl
									label={ __( 'Label Font Size', 'otter-blocks' ) }
									value={ attributes.labelFontSize }
									onChange={ labelFontSize => setAttributes({ labelFontSize }) }
									allowReset
									min={0}
									max={50}
								/>
							</SyncControl>
						</PanelBody>
						<PanelColorSettings
							title={ __( 'Color', 'otter-blocks' ) }
							initialOpen={ false }
							colorSettings={ [
								{
									value: attributes.labelColor,
									onChange: labelColor => setAttributes({ labelColor }),
									label: __( 'Label Color', 'otter-blocks' )
								},
								{
									value: attributes.inputBorderColor,
									onChange: inputBorderColor => setAttributes({ inputBorderColor }),
									label: __( 'Border Color', 'otter-blocks' )
								},
								{
									value: attributes.submitColor,
									onChange: submitColor => setAttributes({ submitColor }),
									label: __( 'Submit Text Color', 'otter-blocks' )
								},
								{
									value: attributes.submitBackgroundColor,
									onChange: submitBackgroundColor => setAttributes({ submitBackgroundColor }),
									label: __( 'Button Background Color', 'otter-blocks' )
								},
								{
									value: attributes.submitBackgroundColorHover,
									onChange: submitBackgroundColorHover => setAttributes({ submitBackgroundColorHover }),
									label: __( 'Button Background Color on Hover', 'otter-blocks' )
								},
								{
									value: attributes.submitMessageColor,
									onChange: submitMessageColor => setAttributes({ submitMessageColor }),
									label: __( 'Successful Message Color', 'otter-blocks' )
								},
								{
									value: attributes.submitMessageErrorColor,
									onChange: submitMessageErrorColor => setAttributes({ submitMessageErrorColor }),
									label: __( 'Error Message Color', 'otter-blocks' )
								}
							] }
						/>
					</Fragment>
				)
			}

			{
				'advanced' === tab && (
					<Fragment>
						<PanelBody
							title={ __( 'Form Options', 'otter-blocks' ) }
						>
							{
								'loading' === loadingState?.formOptions && (
									<div style={{ marginTop: '8px', borderLeft: '3px solid orange', paddingLeft: '10px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
										<Spinner />
										{ __( 'Loading the options. Please wait.', 'otter-blocks' ) }
									</div>
								)
							}

							<TextControl
								label={ __( 'Email Subject', 'otter-blocks' ) }
								placeholder={ __( 'A new submission', 'otter-blocks' ) }
								value={ formOptions.subject }
								onChange={ subject => setFormOption({ subject }) }
								help={ __( 'Customize the title of the email that you are gonna receive after a user submit the form.', 'otter-blocks' ) }
							/>

							<TextControl
								label={ __( 'From Name', 'otter-blocks' ) }
								value={ formOptions.fromName }
								onChange={ fromName => setFormOption({ fromName }) }
								help={ __( 'Set the name of the sender. Some SMTP plugins might override this value.', 'otter-blocks' ) }
							/>

							<TextControl
								label={ __( 'Email To', 'otter-blocks' ) }
								placeholder={ __( 'Default is to admin site', 'otter-blocks' ) }
								type="email"
								value={ formOptions.emailTo }
								onChange={ emailTo => setFormOption({emailTo}) }
								help={ __( 'Send the form\'s data to another email. (Admin\'s email is default).', 'otter-blocks' ) }
							/>

							<TextControl
								label={ __( 'Submit Success Message', 'otter-blocks' ) }
								placeholder={ __( 'Success', 'otter-blocks' ) }
								value={ formOptions.submitMessage }
								onChange={ submitMessage =>  setFormOption({ submitMessage })  }
								help={ __( 'Show this message after the form was successfully submitted.', 'otter-blocks' ) }
							/>

							<TextControl
								label={ __( 'Redirect To', 'otter-blocks' ) }
								type="url"
								placeholder={ __( 'https://example.com', 'otter-blocks' ) }
								value={ formOptions.redirectLink }
								onChange={ redirectLink => setFormOption({redirectLink})  }
								help={ __( 'Redirect the user to another page when submit is successful.', 'otter-blocks' ) }
							/>

							{
								formOptions.redirectLink && (
									<ExternalLink
										href={formOptions.redirectLink}
										style={{ marginBottom: '10px', display: 'block'}}
									>
										{__( 'Preview Redirect link.', 'otter-blocks' )}
									</ExternalLink>
								)
							}

							<Button
								isPrimary
								onClick={ saveFormEmailOptions }
								help={ __( '[WIP] Do not forget to save the options ', 'otter-blocks' ) }
								isBusy={ 'saving' === loadingState?.formOptions }
							>
								<Fragment>
									{
										'saving' === loadingState?.formOptions ? __( 'Saving...', 'otter-blocks' ) : __( 'Apply Options', 'otter-blocks' )
									}
								</Fragment>
							</Button>

							{
								'done' === loadingState?.formOptions && formOptionsChanged && (
									<div style={{ marginTop: '8px', borderLeft: '3px solid red', paddingLeft: '10px' }}>
										{ __( 'You have made some modifications. Do not forget to save the options.', 'otter-blocks' ) }
									</div>
								)
							}
							{
								'error' === loadingState?.formOptions && (
									<div style={{ marginTop: '8px', borderLeft: '3px solid red', paddingLeft: '10px' }}>
										{ __( 'An error has occurred while saving. Please try again.', 'otter-blocks' ) }
									</div>
								)
							}

						</PanelBody>

						<PanelBody
							title={ __( 'Bot Protection', 'otter-blocks' ) }
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
										{__( 'You can change the reCaptcha API Keys in Settings > Otter. ', 'otter-blocks' )}
										<ExternalLink
											href={ 'https://www.google.com/recaptcha/about/' }
											target="_blank"

										>
											{ __( 'Learn more about reCaptcha.', 'otter-blocks' ) }
										</ExternalLink>
									</div>
								)
							}
						</PanelBody>

						<PanelBody
							title={ __( 'Integration', 'otter-blocks' ) }
							initialOpen={ true }
						>
							{
								__( 'Add your client email to a Digital Marketing provider.', 'otter-blocks' )
							}
							<br /> <br />
							{
								'loading' === loadingState?.formIntegration && (
									<div style={{ marginTop: '8px', borderLeft: '3px solid orange', paddingLeft: '10px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
										<Spinner />
										{ __( 'Fetching data from server. Please wait.', 'otter-blocks' ) }
									</div>
								)
							}
							<b> { __( 'You need to have at least one email field in your form. For multiple email fields, only the first will be used.', 'otter-blocks' ) } </b>

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
										{
											! formOptions.apiKey && (
												<Fragment>
													{
														'mailchimp' === formOptions?.provider && (
															<ExternalLink
																href={'https://us5.admin.mailchimp.com/account/api/'}
																style={{ marginBottom: '10px', display: 'block'}}
																target="_blank"
															>
																{__( 'Guide to generate the API Key.', 'otter-blocks' )}
															</ExternalLink>
														)
													}
													{
														'sendinblue' === formOptions?.provider && (
															<ExternalLink
																href={'https://help.sendinblue.com/hc/en-us/articles/209467485-What-s-an-API-key-and-how-can-I-get-mine-'}
																style={{ marginBottom: '10px', display: 'block'}}
																target="_blank"
															>
																{__( 'Guide to generate the API Key.', 'otter-blocks' )}
															</ExternalLink>
														)
													}
												</Fragment>

											)
										}
										{

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

										}

										{
											formOptions.apiKey && 2 > listIDOptions.length && 'loading' === loadingState?.listId && (
												<Fragment>
													<Spinner />
													{ __( 'Loading the options.', 'otter-blocks' ) }
													<br /><br/>
												</Fragment>
											)
										}
										{
											formOptions.apiKey && 'error' === loadingState?.listId && (
												<Fragment>
													{ __( 'Invalid API Key. Please check your API Key in the provider\'s Dashboard.', 'otter-blocks' ) }
													<ExternalLink
														target="_blank"
														style={{ marginBottom: '10px', display: 'block'}}
														href={ 'sendinblue' === formOptions.provider ? 'https://account.sendinblue.com/advanced/api' : 'https://us5.admin.mailchimp.com/account/api/'}
													>
														Go to Dashboard.
													</ExternalLink>
												</Fragment>
											)
										}
										{
											formOptions.apiKey && 'timeout' === loadingState?.listId && (
												<p>
													{ __( 'Could no connect to the server. Please try again.', 'otter-blocks' ) }
												</p>
											)
										}
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
																				__( 'This action will add the client to the contact list and send a separata email with the form data to administrator or to the email mentioned in \'Form to\' field. A checkbox for data-sharing consent with third-party will be added on form.', 'otter-blocks' )
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
									<Fragment>
										{
											'saving' === loadingState?.formIntegration ? __( 'Saving', 'otter-blocks' ) : __( 'Save', 'otter-blocks' )
										}
									</Fragment>
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


							{
								'done' === loadingState?.formIntegration && formIntegrationChanged && (
									<div style={{ marginTop: '8px', borderLeft: '3px solid red', paddingLeft: '10px' }}>
										{ __( 'You have made some modifications. Do not forget to save the options.', 'otter-blocks' ) }
									</div>
								)
							}
							{
								'done' === loadingState?.serviceTesting && (
									<div style={{ marginTop: '8px', borderLeft: '3px solid orange', paddingLeft: '10px' }}>
										{ __( 'Remember to delete the test email from your provider\'s contact list.', 'otter-blocks' ) }
									</div>
								)
							}
							{
								'error' === loadingState?.formIntegration && (
									<div style={{ marginTop: '8px', borderLeft: '3px solid red', paddingLeft: '10px' }}>
										{ __( 'An error has occurred while saving. Please try again.', 'otter-blocks' ) }
									</div>
								)
							}
						</PanelBody>
					</Fragment>
				)
			}


		</InspectorControls>
	);
};

export default Inspector;
