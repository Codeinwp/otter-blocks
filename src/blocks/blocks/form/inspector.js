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

/**
 * Internal dependencies.
 */
import { FormContext } from './edit.js';
import SyncControl from '../../components/sync-control';

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
		fetchApiKeyStatus
	} = useContext( FormContext );

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

				<SyncControl
					field={ 'inputPadding' }
					isSynced={ attributes.isSynced }
					setAttributes={ setAttributes }
				>
					<BoxControl
						label={ __( 'Padding', 'otter-blocks' ) }
						values={ attributes.inputPadding }
						inputProps={ {
							min: 0,
							max: 500
						} }
						onChange={ inputPadding => setAttributes({ inputPadding }) }
					/>
				</SyncControl>

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
					label={ __( 'Input Gap', 'otter-blocks' ) }
					value={ attributes.inputGap }
					onChange={ inputGap => setAttributes({ inputGap }) }
					allowReset
					min={0}
					max={50}
				/>

				<RangeControl
					label={ __( 'Fields Gap', 'otter-blocks' ) }
					value={ attributes.inputsGap }
					onChange={ inputsGap => setAttributes({ inputsGap }) }
					allowReset
					min={0}
					max={50}
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
					},
					{
						value: attributes.submitColor,
						onChange: submitColor => setAttributes({ submitColor }),
						label: __( 'Submit Text Color', 'otter-blocks' )
					},
					{
						value: attributes.submitBackgroundColor,
						onChange: submitBackgroundColor => setAttributes({ submitBackgroundColor }),
						label: __( 'Submit Background Color', 'otter-blocks' )
					},
					{
						value: attributes.submitBackgroundColorHover,
						onChange: submitBackgroundColorHover => setAttributes({ submitBackgroundColorHover }),
						label: __( 'Submit Background Color on Hover', 'otter-blocks' )
					},
					{
						value: attributes.submitMessageColor,
						onChange: submitMessageColor => setAttributes({ submitMessageColor }),
						label: __( 'Successful Submit Message Color', 'otter-blocks' )
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
								apiKey && 'ready' === fetchListIdStatus && (
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
															{ label: __( 'Default', 'otter-blocks' ), value: '' },
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
