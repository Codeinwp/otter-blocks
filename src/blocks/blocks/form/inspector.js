/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import api from '@wordpress/api';

import { InspectorControls } from '@wordpress/block-editor';

import {
	Button,
	PanelBody,
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
						__( err?.error, 'otter-blocks' ),
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

	const saveEmail = () => {
		( new api.models.Settings() ).fetch().done( res => {
			const emails = res.themeisle_blocks_form_emails ? res.themeisle_blocks_form_emails : [];
			let isMissing = true;
			let hasUpdated = false;

			emails?.forEach( ({ form }, index )=> {
				if ( form === attributes.optionName ) {
					if ( emails[index].email !== email ) {
						emails[index].email = email; // update the value
						hasUpdated = true;
					}
					isMissing = false;
				}
			});

			if ( isMissing ) {
				emails.push({
					form: attributes.optionName,
					email: email
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
								__( 'Email has been saved!', 'otter-blocks' ),
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
				title={ __( 'Settings', 'otter-blocks' ) }
			>
				<TextControl
					label={ __( 'Email Subject', 'otter-blocks' ) }
					placeholder={ __( 'A new submission', 'otter-blocks' ) }
					value={ attributes.subject }
					onChange={ subject => setAttributes({ subject }) }
					help={ __( 'Customize the email title send by this form.', 'otter-blocks' ) }
				/>

				<TextControl
					label={ __( 'Email To', 'otter-blocks' ) }
					placeholder={ __( 'Default is to admin site', 'otter-blocks' ) }
					value={ email }
					onChange={ email => setEmail( email ) }
					help={ __( 'Send form data to another email. (Admin is default).', 'otter-blocks' ) }
				/>

				<Button
					isPrimary
					onClick={ saveEmail }
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

	   		</PanelBody>

			<PanelBody
				title={ __( 'Integration', 'otter-blocks' )}
				initialOpen={ false }
			>
				{
					__( 'Add your client email to a Digital Marketing provider.', 'otter-blocks' )
				}
				<br/> <br/>
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
										<Spinner/>
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
