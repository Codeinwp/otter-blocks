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

	useEffect( () => {
		setStripeAPI( getOption( 'themeisle_stripe_api_key' ) );
	}, [ getOption( 'themeisle_stripe_api_key' ) ]);

	const [ googleMapsAPI, setGoogleMapsAPI ] = useState( '' );
	const [ googleCaptchaAPISiteKey, setGoogleCaptchaAPISiteKey ] = useState( '' );
	const [ googleCaptchaAPISecretKey, setGoogleCaptchaAPISecretKey ] = useState( '' );
	const [ stripeAPI, setStripeAPI ] = useState( '' );

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
						<TextControl
							type="password"
							label={ __( 'Secret Key', 'otter-blocks' ) }
							value={ googleMapsAPI }
							placeholder={ __( 'Google Maps API Key', 'otter-blocks' ) }
							disabled={ 'saving' === status }
							onChange={ value => setGoogleMapsAPI( value ) }
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

			<PanelBody
				title={ __( 'Stripe', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<PanelRow>
					<BaseControl
						label={ __( 'Stripe API', 'otter-blocks' ) }
						help={ __( 'In order to use Stripe block, you need to use Stripe API. You can also use Restricted keys.', 'otter-blocks' ) }
						id="otter-options-stripe-api"
						className="otter-button-field"
					>
						<TextControl
							type="password"
							label={ __( 'Secret Key', 'otter-blocks' ) }
							value={ stripeAPI }
							placeholder={ __( 'Stripe API Key', 'otter-blocks' ) }
							disabled={ 'saving' === status }
							onChange={ value => setStripeAPI( value ) }
						/>

						<div className="otter-button-group">
							<Button
								variant="secondary"
								isSecondary
								disabled={ 'saving' === status }
								onClick={ () => updateOption( 'themeisle_stripe_api_key', stripeAPI ) }
							>
								{ __( 'Save', 'otter-blocks' ) }
							</Button>

							<ExternalLink
								href="https://stripe.com/docs/keys"
							>
								{ __( 'Get API Key', 'otter-blocks' ) }
							</ExternalLink>

							<ExternalLink
								href="#"
							>
								{ __( 'More Info', 'otter-blocks' ) }
							</ExternalLink>
						</div>
					</BaseControl>
				</PanelRow>
			</PanelBody>
		</Fragment>
	);
};

export default Integrations;
