/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import api from '@wordpress/api';

import { InspectorControls, PanelColorSettings } from '@wordpress/block-editor';

import {
	Button,
	Dropdown,
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

import { dispatch } from '@wordpress/data';

import {
	Fragment,
	useState,
	useEffect,
	useContext
} from '@wordpress/element';

import classnames from 'classnames';

/**
 * Internal dependencies.
 */
import { FormContext } from './edit.js';
import SyncControl from '../../components/sync-control';

/**
 * Small utility function for checking if a list of variable pair are different.
 * @param {array} list
 * @return {boolean}
 */
const isChanged = list => {
	return Boolean( 0 < list.filter( x => x?.[1] && x[0] !== x[1]).length );
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
		isEmailLoaded,
		listIDOptions,
		setListIDOptions,
		fetchListIdStatus,
		setFetchListIdStatus,
		savedEmail,
		saveFormOptions,
		email,
		setEmail,
		apiKey,
		setApiKey,
		saveIntegrationApiKey,
		fetchApiKeyStatus,
		savedIntegration,
		saveIntegration,
		savedData
	} = useContext( FormContext );

	const [ tab, setTab ] = useState( 'general' );

	const formOptionsChanged = isChanged([
		[ attributes.emailTo, savedData?.email ],
		[ attributes.subject, savedData?.emailSubject ],
		[ attributes.redirectLink, savedData?.redirectLink ],
		[ attributes.fromName, savedData?.fromName ],
		[ attributes.submitMessage, savedData?.submitMessage ],
		[ attributes.hasCaptcha, savedData?.hasCaptcha ]
	]);

	const formIntegrationChanged = isChanged([
		[ attributes.provider, savedData?.integration?.provider ],
		[ attributes.listId, savedData?.integration?.listId ],
		[ attributes.action, savedData?.integration?.action ]
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
							<TextControl
								label={ __( 'Submit Button Label', 'otter-blocks' ) }
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

							<TextControl
								label={ __( 'Submit Success Message', 'otter-blocks' ) }
								placeholder={ __( 'Success', 'otter-blocks' ) }
								value={ attributes.submitMessage }
								onChange={ submitMessage =>  setAttributes({ submitMessage })  }
								help={ __( 'Show this message after the form was succesfuly submited.', 'otter-blocks' ) }
							/>

							<SelectControl
								label={ __( 'Submit Style', 'otter-blocks' ) }
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

							<SyncControl
								field={ 'submitFontSize' }
								isSynced={ attributes.isSynced }
								setAttributes={ setAttributes }
							>
								<RangeControl
									label={ __( 'Submit Button Font Size', 'otter-blocks' ) }
									value={ attributes.submitFontSize }
									onChange={ submitFontSize => setAttributes({ submitFontSize }) }
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
							<TextControl
								label={ __( 'Email Subject', 'otter-blocks' ) }
								placeholder={ __( 'A new submission', 'otter-blocks' ) }
								value={ attributes.subject }
								onChange={ subject => setAttributes({ subject }) }
								help={ __( 'Customize the title of the email that you are gonna receive after a user submit the form.', 'otter-blocks' ) }
							/>

							<TextControl
								label={ __( 'From Name', 'otter-blocks' ) }
								value={ attributes.fromName }
								onChange={ fromName => setAttributes({ fromName }) }
								help={ __( 'Set the name of the sender.', 'otter-blocks' ) }
							/>

							<TextControl
								label={ __( 'Email To', 'otter-blocks' ) }
								placeholder={ __( 'Default is to admin site', 'otter-blocks' ) }
								value={ email }
								onChange={ email => setEmail( email ) }
								help={ __( 'Send the form\'s data to another email. (Admin\'s email is default).', 'otter-blocks' ) }
							/>

							<TextControl
								label={ __( 'Redirect To', 'otter-blocks' ) }
								type="url"
								placeholder={ __( 'https://example.com', 'otter-blocks' ) }
								value={ attributes.redirectLink }
								onChange={ redirectLink => setAttributes({redirectLink})  }
								help={ __( 'Redirect the user to another page when submit is successful.', 'otter-blocks' ) }
							/>

							{
								attributes.redirectLink && (
									<ExternalLink
										href={attributes.redirectLink}
									>
										{__( 'Preview Redirect link.', 'otter-blocks' )}
									</ExternalLink>
								)
							}


							<ToggleControl
								label={ __( 'Add captcha checkbox', 'otter-blocks' ) }
								checked={ attributes.hasCaptcha }
								onChange={ hasCaptcha => setAttributes({ hasCaptcha }) }
								help={ __( 'Add Google reCaptcha V2 for protection againts bots. You will need an API Key.', 'otter-blocks' ) }
							/>

							{
								attributes.hasCaptcha && (
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

							<Button
								isPrimary
								onClick={ saveFormOptions }
								help={ __( '[WIP] Do not forget to save the options ', 'otter-blocks' ) }
							>
								<Fragment>
									{
										! isEmailLoaded && (
											<Spinner />
										)
									}
									{
										__( 'Apply Options', 'otter-blocks' )
									}
								</Fragment>
							</Button>

							{
								formOptionsChanged && (
									<div style={{ marginTop: '8px', borderLeft: '3px solid red', paddingLeft: '10px' }}>
										{ __( 'You have made some modifications. Do not forget to save the options.', 'otter-blocks' ) }
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
							<b> { __( 'You need to have at least one email field in your form. For multiple email fields, only the first will be used.', 'otter-blocks' ) } </b>

							<SelectControl
								label={ __( 'Provider', 'otter-blocks' ) }
								value={ attributes.provider }
								options={ [
									{ label: __( 'None', 'otter-blocks' ), value: '' },
									{ label: __( 'Mailchimp', 'otter-blocks' ), value: 'mailchimp' },
									{ label: __( 'Sendinblue', 'otter-blocks' ), value: 'sendinblue' }
								] }
								onChange={ provider => {
									setAttributes({ provider, listId: '' });
									setApiKey( '' );
								} }
							/>

							{
								attributes.provider && (
									<Fragment>
										{
											'loading' === fetchApiKeyStatus ?
												(
													<Fragment>
														<Spinner />
														{ __( 'Fetching the API Key from the database.', 'otter-blocks' ) }
													</Fragment>
												) : (
													<TextControl
														label={ __( 'API Key', 'otter-blocks' ) }
														help={ __( 'You can find the key in the provider\'s website', 'otter-blocks' ) }
														value={ apiKey ? `*************************${apiKey.slice( -8 )}` : '' }
														onChange={ apiKey => {
															setFetchListIdStatus( 'loading' );
															setListIDOptions([]);
															setApiKey( apiKey );
															setAttributes({
																listId: ''
															});
															saveIntegrationApiKey( apiKey );
														}}
													/>
												)
										}
										{
											apiKey && 2 > listIDOptions.length && 'loading' === fetchListIdStatus && (
												<Fragment>
													<Spinner />
													{ __( 'Fetching data from provider.', 'otter-blocks' ) }
												</Fragment>
											)
										}
										{
											apiKey && 'error' === fetchListIdStatus && (
												<Fragment>
													{ __( 'Invalid API Key. Please check your API Key in the provider\'s Dashboard.', 'otter-blocks' ) }
													<ExternalLink
														target="_blank"
														href={ 'sendinblue' === attributes.provider ? 'https://account.sendinblue.com/advanced/api' : 'https://us5.admin.mailchimp.com/account/api/'}
													>
														Go to Dashboard.
													</ExternalLink>
												</Fragment>
											)
										}
										{
											apiKey && 'ready' === fetchListIdStatus && (
												<Fragment>
													<SelectControl
														label={ __( 'Contact List', 'otter-blocks' ) }
														value={ attributes.listId }
														options={ listIDOptions }
														onChange={ listId => setAttributes({ listId }) }
													/>
													{
														1 >= listIDOptions?.length && (
															<p>
																{ __( 'No Contact list found. Please create a list in your provider interface or check if the API key is correct.', 'otter-blocks' ) }
															</p>
														)
													}
													{
														2 <= listIDOptions?.length && attributes.listId && (
															<Fragment>
																<SelectControl
																	label={ __( 'Action', 'otter-blocks' ) }
																	value={ attributes.action }
																	options={ [
																		{ label: __( 'Default', 'otter-blocks' ), value: '' },
																		{ label: __( 'Subscribe', 'otter-blocks' ), value: 'subscribe' },
																		{ label: __( 'Submit & Subscribe', 'otter-blocks' ), value: 'submit-subscribe' }
																	] }
																	onChange={ action => setAttributes({ action }) }
																/>
																{
																	'submit-subscribe' === attributes.action && (
																		<div style={{ marginBottom: '10px' }}>
																			{
																				__( 'This action will add the client to the contact list and send a separata email with the form data to administrator or to the email mentioned in \'Form to\' field. A checkbox for data-sharing consent with third-party will be added on form.', 'otter-blocks' )
																			}
																		</div>
																		)
																}
																<Button
																	isPrimary
																	onClick={ saveIntegration }
																>
																	<Fragment>
																		{
																			! savedIntegration && (
																				<Spinner />
																			)
																		}
																		{
																			__( 'Save', 'otter-blocks' )
																		}
																	</Fragment>
																</Button>

																{
																	formIntegrationChanged && (
																		<div style={{ marginTop: '8px', borderLeft: '3px solid red', paddingLeft: '10px' }}>
																			{ __( 'You have made some modifications. Do not forget to save the options.', 'otter-blocks' ) }
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
						</PanelBody>
					</Fragment>
				)
			}


		</InspectorControls>
	);
};

export default Inspector;
