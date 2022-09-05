/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	BaseControl,
	Button,
	Disabled,
	ExternalLink,
	PanelBody,
	PanelRow,
	TextControl,
	ToggleControl
} from '@wordpress/components';

import {
	Fragment,
	useEffect,
	useState
} from '@wordpress/element';

import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import useSettings from '../../../blocks/helpers/use-settings.js';

const Integrations = () => {
	const [ getOption, updateOption, status ] = useSettings();

	useEffect( () => {
		setGoogleMapsAPI( getOption( 'themeisle_google_map_block_api_key' ) );
	}, [ getOption( 'themeisle_google_map_block_api_key' ) ]);

	useEffect( () => {
		setGoogleCaptchaAPISiteKey( getOption( 'themeisle_google_captcha_api_site_key' ) );
		setGoogleCaptchaAPISecretKey( getOption( 'themeisle_google_captcha_api_secret_key' ) );
	}, [ getOption( 'themeisle_google_captcha_api_site_key' ), getOption( 'themeisle_google_captcha_api_secret_key' ) ]);

	const [ googleMapsAPI, setGoogleMapsAPI ] = useState( '' );
	const [ googleCaptchaAPISiteKey, setGoogleCaptchaAPISiteKey ] = useState( '' );
	const [ googleCaptchaAPISecretKey, setGoogleCaptchaAPISecretKey ] = useState( '' );

	let ProModules = () => {
		return (
			<PanelBody
				title={ __( 'Fonts Module', 'otter-blocks' ) }
				className="is-pro"
			>
				<Disabled>
					<PanelRow>
						<ToggleControl
							label={ __( 'Save Google Fonts Locally', 'otter-blocks' ) }
							help={ __( 'Enable this option to save Google Fonts locally to make your website faster', 'otter-blocks' ) }
							checked={ false }
							disabled={ true }
						/>
					</PanelRow>
				</Disabled>
			</PanelBody>
		);
	};

	ProModules = applyFilters( 'otter.dashboard.integrations', <ProModules /> );

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
								variant="secondary"
								isSecondary
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

			{  ProModules }

			<PanelBody
				title={ __( 'Google reCaptcha API', 'otter-blocks' ) }
				initialOpen={ false }
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
								variant="secondary"
								isSecondary
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
