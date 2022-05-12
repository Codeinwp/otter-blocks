/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	BaseControl,
	Button,
	ExternalLink,
	PanelBody,
	PanelRow,
	TextControl
} from '@wordpress/components';

import { Fragment } from '@wordpress/element';

const Integrations = ({
	status,
	updateOption,
	googleMapsAPI,
	setGoogleMapsAPI,
	googleCaptchaAPISiteKey,
	setGoogleCaptchaAPISiteKey,
	googleCaptchaAPISecretKey,
	setGoogleCaptchaAPISecretKey
}) => {
	return (
		<Fragment>
			<PanelBody
				title={ __( 'Google Maps', 'otter-blocks' ) }
			>
				<PanelRow>
					<BaseControl
						label={ __( 'Google Maps API', 'otter-blocks' ) }
						help={ __( 'In order to use Google Maps block, you need to use Google Maps and Places API.', 'otter-blocks' ) }
						id="otter-options-google-map-api"
						className="otter-button-field"
					>
						<input
							type="password"
							id="otter-options-google-map-api"
							value={ googleMapsAPI }
							placeholder={ __( 'Google Maps API Key', 'otter-blocks' ) }
							disabled={ 'saving' === status }
							onChange={ e => setGoogleMapsAPI( e.target.value ) }
						/>

						<div className="otter-button-group">
							<Button
								isPrimary
								disabled={ 'saving' === status }
								onClick={ () => updateOption( 'themeisle_google_map_block_api_key', googleMapsAPI ) }
							>
								{ __( 'Save', 'otter-blocks' ) }
							</Button>

							<ExternalLink
								href="https://developers.google.com/maps/documentation/javascript/get-api-key"
							>
								{ __( 'Get API Key', 'otter-blocks' ) }
							</ExternalLink>
						</div>
					</BaseControl>
				</PanelRow>
			</PanelBody>

			<PanelBody
				title={ __( 'Google reCaptcha API', 'otter-blocks' ) }
			>
				<PanelRow>
					<BaseControl
						help={ __( 'In order to use reCaptcha field in the Form block, you need to use Google reCaptcha API.', 'otter-blocks' ) }
						id="otter-options-google-recaptcha-api"
						className="otter-button-field"
					>
						<TextControl
							type="password"
							label={ __( 'Site Key', 'otter-blocks' ) }
							value={ googleCaptchaAPISiteKey }
							placeholder={ __( 'Site Key', 'otter-blocks' ) }
							disabled={ 'saving' === status }
							onChange={ value => setGoogleCaptchaAPISiteKey( value ) }
						/>

						<TextControl
							type="password"
							label={ __( 'Secret Key', 'otter-blocks' ) }
							value={ googleCaptchaAPISecretKey }
							placeholder={ __( 'Secret Key', 'otter-blocks' ) }
							disabled={ 'saving' === status }
							onChange={ value => setGoogleCaptchaAPISecretKey( value ) }
						/>

						<div className="otter-button-group">
							<Button
								isPrimary
								disabled={ 'saving' === status }
								onClick={ () => {
									updateOption( 'themeisle_google_captcha_api_site_key', googleCaptchaAPISiteKey );
									updateOption( 'themeisle_google_captcha_api_secret_key', googleCaptchaAPISecretKey );
								} }
							>
								{ __( 'Save', 'otter-blocks' ) }
							</Button>

							<ExternalLink
								href="https://www.google.com/recaptcha/admin"
							>
								{ __( 'Get API Key', 'otter-blocks' ) }
							</ExternalLink>
						</div>
					</BaseControl>
				</PanelRow>
			</PanelBody>
		</Fragment>
	);
};

export default Integrations;
