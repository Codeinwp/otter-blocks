/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import api from '@wordpress/api';

import { InspectorControls, PanelColorSettings } from '@wordpress/block-editor';

import {
	Button,
	PanelBody,
	RangeControl,
	SelectControl,
	Spinner,
	TextControl,
	ToggleControl
} from '@wordpress/components';

import { dispatch } from '@wordpress/data';

import {
	Fragment,
	useState,
	useEffect
} from '@wordpress/element';

/**
 * Internal dependencies.
 */
import { getListIdOptionFrom } from './integrations.js';

/**
 *
 * @param {import('./type.js').FormInspectorProps} props
 * @returns
 */
const Inspector = ({
	attributes,
	setAttributes
}) => {
	const { createNotice } = dispatch( 'core/notices' );

	const [ savedEmail, setSavedEmail ] = useState( '' );
	const [ email, setEmail ] = useState( '' );
	const [ isEmailLoaded, setEmailLoading ] = useState( true );
	const [ listIDOptions, setListIDOptions ] = useState([ { label: __( 'None', 'otter-blocks' ), value: '' } ]);
	const [ fetchListIdStatus, setFetchListIdStatus ] = useState( 'loading' );

	useEffect( () => {
		if ( attributes.optionName ) {
			api.loadPromise.then( () => {
				( new api.models.Settings() ).fetch().done( res => {
					res.themeisle_blocks_form_emails?.filter( ({ form }) => form === attributes.optionName )?.forEach( item => {
						setEmail( item?.email );
						setEmailLoading( true );
						setSavedEmail( item?.email );
					});
				});
			});
		}
	}, [ attributes.optionName ]);

	useEffect( () => {
		if ( attributes.apiKey && attributes.provider ) {
			getListIdOptionFrom( attributes.provider, attributes.apiKey,
				options => {
					options.splice( 0, 0, { label: __( 'None', 'otter-blocks' ), value: '' });
					setListIDOptions( options );
					setFetchListIdStatus( 'ready' );

					const isCurrentOptionValid = 1 === options.map( ({ value }) => value ).filter( value => value === attributes.listId ).length;
					if ( attributes.listId && ! isCurrentOptionValid ) {
						createNotice(
							'error',
							__( 'The current contact list is invalid! Please choose a new contact list.', 'otter-blocks' ),
							{
								isDismissible: true,
								type: 'snackbar'
							}
						);
					}
				},
				err => {
					createNotice(
						'error',
						err?.error,
						{
							isDismissible: true,
							type: 'snackbar',
							id: 'themeisle-form-server-error'
						}
					);

					setFetchListIdStatus( 'error' );
				}
			);
		}
	}, [ attributes.provider, attributes.apiKey ]);

	const saveFormOptions = () => {
		( new api.models.Settings() ).fetch().done( res => {
			const emails = res.themeisle_blocks_form_emails ? res.themeisle_blocks_form_emails : [];
			let isMissing = true;
			let hasUpdated = false;

			emails?.forEach( ({ form }, index ) => {
				if ( form === attributes.optionName ) {
					if ( emails[index].email !== email ) {
						emails[index].email = email; // update the value
						hasUpdated = true;
					}
					if ( emails[index].redirectLink !== attributes.redirectLink ) {
						emails[index].redirectLink = attributes.redirectLink; // update the value
						hasUpdated = true;
					}
					if ( emails[index].titleSubject !== attributes.subject ) {
						emails[index].titleSubject = attributes.titleSubject; // update the value
						hasUpdated = true;
					}
					if ( emails[index].submitMessage !== attributes.submitMessage ) {
						emails[index].submitMessage = attributes.submitMessage; // update the value
						hasUpdated = true;
					}
					isMissing = false;
				}
			});

			if ( isMissing ) {
				emails.push({
					form: attributes.optionName,
					email,
					redirectLink: attributes.redirectLink,
					titleSubject: attributes.subject,
					submitMessage: attributes.submitMessage
				});
			}

			if ( isMissing || hasUpdated ) {
				const model = new api.models.Settings({
					// eslint-disable-next-line camelcase
					themeisle_blocks_form_emails: emails
				});

				setEmailLoading( false );

				model.save().then( response => {
					response.themeisle_blocks_form_emails?.filter( ({ form }) => form === attributes.optionName ).forEach( item => {
						{
							setEmailLoading( true );
							setSavedEmail( item?.email );

							createNotice(
								'info',
								__( 'Form Options has been saved!', 'otter-blocks' ),
								{
									isDismissible: true,
									type: 'snackbar'
								}
							);
						}
					});
				});
			}
		});
	};

	return (
		<InspectorControls>
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
					label={ __( 'Email To', 'otter-blocks' ) }
					placeholder={ __( 'Default is to admin site', 'otter-blocks' ) }
					value={ email }
					onChange={ email => setEmail( email ) }
					help={ __( 'Send the form\'s data to another email. (Admin\'s email is default).', 'otter-blocks' ) }
				/>

				<TextControl
					label={ __( 'Submit Message', 'otter-blocks' ) }
					placeholder={ __( 'Success', 'otter-blocks' ) }
					value={ attributes.submitMessage }
					onChange={ submitMessage =>  setAttributes({ submitMessage })  }
					help={ __( 'Show this message after the form was succesfuly submited.', 'otter-blocks' ) }
				/>

				<TextControl
					label={ __( 'Redirect To', 'otter-blocks' ) }
					placeholder={ __( 'Insert a link..', 'otter-blocks' ) }
					value={ attributes.redirectLink }
					onChange={ redirectLink =>  setAttributes({ redirectLink })  }
					help={ __( 'Redirect the user to another page when submit is succesful.', 'otter-blocks' ) }
				/>

				<Button
					isPrimary
					onClick={ saveFormOptions }
					disabled={ email === savedEmail }
				>
					<Fragment>
						{
							! isEmailLoaded && (
								<Spinner />
							)
						}
						{
							__( 'Save', 'otter-blocks' )
						}
					</Fragment>
				</Button>
			</PanelBody>

			<PanelBody
				title={ __( 'Settings', 'otter-blocks' ) }
			>

				<TextControl
					label={ __( 'Submit Button Label', 'otter-blocks' ) }
					placeholder={ __( 'Submit', 'otter-blocks' ) }
					value={ attributes.submitLabel }
					onChange={ submitLabel => setAttributes({ submitLabel }) }
					help={ __( 'Set the label for the submit button.', 'otter-blocks' ) }
				/>


				<ToggleControl
					label={ __( 'Add captcha checkbox', 'otter-blocks' ) }
					checked={ attributes.hasCaptcha }
					onChange={ hasCaptcha => setAttributes({ hasCaptcha }) }
					help={ __( 'Add Google reCaptcha V2 for protection againts bots.', 'otter-blocks' ) }
				/>

				{
					attributes.hasCaptcha && (
						__( 'You can change the API Keys in Settings > Otter', 'otter-blocks' )
					)
				}

				<RangeControl
					label={ __( 'Input Padding', 'otter-blocks' ) }
					value={ attributes.inputPadding }
					onChange={ inputPadding => setAttributes({ inputPadding }) }
					allowReset
					min={0}
					max={50}
				/>

				<SelectControl
					label={ __( 'Input Width', 'otter-blocks' ) }
					value={ attributes.inputWidth }
					onChange={ inputWidth => setAttributes({ inputWidth }) }
					options={[
						{
							label: __( 'Default', '' ),
							value: ''
						},
						{
							label: '33%',
							value: 33
						},
						{
							label: '50%',
							value: 50
						},
						{
							label: '75%',
							value: 75
						},
						{
							label: '100%',
							value: 100
						}
					]}
				/>

				<RangeControl
					label={ __( 'Border Radius', 'otter-blocks' ) }
					value={ attributes.inputBorderRadius }
					onChange={ inputBorderRadius => setAttributes({ inputBorderRadius }) }
					allowReset
					min={0}
					max={50}
				/>

				<RangeControl
					label={ __( 'Border Width', 'otter-blocks' ) }
					value={ attributes.inputBorderWidth }
					onChange={ inputBorderWidth => setAttributes({ inputBorderWidth }) }
					allowReset
					min={0}
					max={50}
				/>
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
					}
				] }
			/>


			<PanelBody
				title={ __( 'Integration', 'otter-blocks' ) }
				initialOpen={ false }
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
						setAttributes({ provider, apiKey: '', listId: '' });
					} }
				/>

				{
					attributes.provider && (
						<Fragment>
							<TextControl
								label={ __( 'API Key', 'otter-blocks' ) }
								help={ __( 'You can find the key in the provider\'s website', 'otter-blocks' ) }
								value={ attributes.apiKey }
								onChange={ apiKey => {
									setFetchListIdStatus( 'loading' );
									setListIDOptions([]);
									setAttributes({ apiKey, listId: '' });
								}}
							/>

							{
								attributes.apiKey && 2 > listIDOptions.length && 'loading' === fetchListIdStatus && (
									<Fragment>
										<Spinner />
										{ __( 'Fetching data from provider.', 'otter-blocks' ) }
									</Fragment>
								)
							}
							{
								attributes.apiKey && 'ready' === fetchListIdStatus && (
									<Fragment>
										<SelectControl
											label={ __( 'Contact List', 'otter-blocks' ) }
											value={ attributes.listId }
											options={ listIDOptions }
											onChange={ listId => setAttributes({ listId }) }
										/>
										{
											2 <= listIDOptions?.length && attributes.listId && (
												<Fragment>
													<SelectControl
														label={ __( 'Action', 'otter-blocks' ) }
														value={ attributes.action }
														options={ [
															{ label: __( 'None', 'otter-blocks' ), value: '' },
															{ label: __( 'Subscribe', 'otter-blocks' ), value: 'subscribe' },
															{ label: __( 'Submit & Subscribe', 'otter-blocks' ), value: 'submit-subscribe' }
														] }
														onChange={ action => setAttributes({ action }) }
													/>
													{
														'submit-subscribe' === attributes.action && (
															__( 'This action will add the client to the contact list and send a separata email with the form data to administrator or to the email mentioned in \'Form to\' field. A checkbox for data-sharing consent with third-party will be added on form.', 'otter-blocks' )
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
		</InspectorControls>
	);
};

export default Inspector;
