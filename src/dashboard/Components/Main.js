/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import apiFetch from '@wordpress/api-fetch';

import {
	BaseControl,
	Button,
	ExternalLink,
	Modal,
	PanelBody,
	PanelRow,
	Placeholder,
	Spinner,
	ToggleControl,
	TextControl
} from '@wordpress/components';

import { dispatch } from '@wordpress/data';

import {
	Fragment,
	useEffect,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies.
 */
import ButtonControl from './ButtonControl.js';

import useSettings from './../hooks/settings.js';

const Main = () => {
	useEffect( () => {
		if ( ! Boolean( window.otterObj.stylesExist ) ) {
			setRegeneratedDisabled( true );
		}
	}, []);

	const [ getOption, updateOption, status ] = useSettings();

	const { createNotice } = dispatch( 'core/notices' );

	useEffect( () => {
		setGoogleMapsAPI( getOption( 'themeisle_google_map_block_api_key' ) );
	}, [ getOption( 'themeisle_google_map_block_api_key' ) ]);

	useEffect( () => {
		setGoogleCaptchaAPISiteKey( getOption( 'themeisle_google_captcha_api_site_key' ) );
		setGoogleCaptchaAPISecretKey( getOption( 'themeisle_google_captcha_api_secret_key' ) );
	}, [ getOption( 'themeisle_google_captcha_api_site_key' ), getOption( 'themeisle_google_captcha_api_secret_key' ) ]);

	const [ googleMapsAPI, setGoogleMapsAPI ] = useState( '' );
	const [ isRegeneratedDisabled, setRegeneratedDisabled ] = useState( false );
	const [ isOpen, setOpen ] = useState( false );
	const [ googleCaptchaAPISiteKey, setGoogleCaptchaAPISiteKey ] = useState( '' );
	const [ googleCaptchaAPISecretKey, setGoogleCaptchaAPISecretKey ] = useState( '' );

	const regenerateStyles = async() => {
		const data = await apiFetch({ path: 'otter/v1/regenerate', method: 'DELETE' });

		createNotice(
			data.success ? 'success' : 'error',
			data.data.message,
			{
				isDismissible: true,
				type: 'snackbar'
			}
		);

		setRegeneratedDisabled( true );
		setOpen( false );
	};

	if ( 'loading' === status ) {
		return (
			<Placeholder>
				<Spinner />
			</Placeholder>
		);
	}

	return (
		<Fragment>
			<div className="otter-main">
				<div className="otter-left">
					<div className="otter-step-two">
						<PanelBody
							title={ __( 'Modules', 'otter-blocks' ) }
						>
							<PanelRow>
								<ToggleControl
									label={ __( 'Enable Custom CSS Module', 'otter-blocks' ) }
									help={ __( 'Custom CSS module allows to add custom CSS to each block in Block Editor.', 'otter-blocks' ) }
									checked={ Boolean( getOption( 'themeisle_blocks_settings_css_module' ) ) }
									disabled={ 'saving' === status }
									onChange={ () => updateOption( 'themeisle_blocks_settings_css_module', ! Boolean( getOption( 'themeisle_blocks_settings_css_module' ) ) ) }
								/>
							</PanelRow>

							<PanelRow>
								<ToggleControl
									label={ __( 'Enable Blocks Animation Module', 'otter-blocks' ) }
									help={ __( 'Blocks Animation module allows to add CSS animations to each block in Block Editor.', 'otter-blocks' ) }
									checked={ Boolean( getOption( 'themeisle_blocks_settings_blocks_animation' ) ) }
									disabled={ 'saving' === status }
									onChange={ () => updateOption( 'themeisle_blocks_settings_blocks_animation', ! Boolean( getOption( 'themeisle_blocks_settings_blocks_animation' ) ) ) }
								/>
							</PanelRow>
						</PanelBody>
					</div>

					<div className="otter-step-three">
						<PanelBody
							title={ __( 'Section', 'otter-blocks' ) }
						>
							<PanelRow>
								<ToggleControl
									label={ __( 'Make Section your default block for Pages', 'otter-blocks' ) }
									help={ __( 'Everytime you create a new page, Section block will be appended there by default.', 'otter-blocks' ) }
									checked={ Boolean( getOption( 'themeisle_blocks_settings_default_block' ) ) }
									disabled={ 'saving' === status }
									onChange={ () => updateOption( 'themeisle_blocks_settings_default_block', ! Boolean( getOption( 'themeisle_blocks_settings_default_block' ) ) ) }
								/>
							</PanelRow>
						</PanelBody>
					</div>

					<div className="otter-step-four">
						<PanelBody
							title={ __( 'API Keys', 'otter-blocks' ) }
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
											className="otter-step-five"
										>
											{ __( 'Get API Key', 'otter-blocks' ) }
										</ExternalLink>
									</div>
								</BaseControl>
							</PanelRow>

							<PanelRow>
								<BaseControl
									label={ __( 'Google reCaptcha API', 'otter-blocks' ) }
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
											className="otter-step-five"
										>
											{ __( 'Get API Key', 'otter-blocks' ) }
										</ExternalLink>
									</div>
								</BaseControl>
							</PanelRow>
						</PanelBody>
					</div>

					<div className="otter-step-six">
						<PanelBody
							title={ __( 'Other', 'otter-blocks' ) }
						>
							<PanelRow>
								<ToggleControl
									label={ __( 'Anonymous Data Tracking.', 'otter-blocks' ) }
									help={ __( 'Become a contributor by opting in to our anonymous data tracking. We guarantee no sensitive data is collected.', 'otter-blocks' ) }
									checked={ 'yes' === getOption( 'otter_blocks_logger_flag' ) ? true : false }
									disabled={ 'saving' === status }
									onChange={ () => updateOption( 'otter_blocks_logger_flag', ( 'yes' === getOption( 'otter_blocks_logger_flag' ) ? 'no' : 'yes' ) ) }
								/>
							</PanelRow>

							<PanelRow>
								<ToggleControl
									label={ __( 'Allow JSON & SVG Uploads.', 'otter-blocks' ) }
									help={ __( 'This option allows JSON & SVG files to be uploaded to the media library to use in Lottie Block. Only enable this option if you want to use custom JSON uploads in Lottie Block or using SVG as image source.', 'otter-blocks' ) }
									checked={ Boolean( getOption( 'themeisle_allow_json_upload' ) ) }
									disabled={ 'saving' === status }
									onChange={ () => updateOption( 'themeisle_allow_json_upload', ! Boolean( getOption( 'themeisle_allow_json_upload' ) ) ) }
								/>
							</PanelRow>

							<PanelRow>
								<div>
									{ __( 'Let us know how we can improve. Vote on existing ideas or suggest new ones.', 'otter-blocks' ) }
									{ ' ' }
									<ExternalLink href="https://otter.nolt.io/">{ __( 'Give feedback!', 'otter-blocks' ) }</ExternalLink>
								</div>
							</PanelRow>
						</PanelBody>
					</div>

					<PanelBody>
						<div className="otter-info">
							<h2>{ __( 'Got a question for us?', 'otter-blocks' ) }</h2>

							<p>{ __( 'We would love to help you out if you need any help with Otter.', 'otter-blocks' ) }</p>

							<div className="otter-info-button-group">
								<Button
									isSecondary
									target="_blank"
									href="https://wordpress.org/support/plugin/otter-blocks"
									className="otter-step-seven"
								>
									{ __( 'Ask a question', 'otter-blocks' ) }
								</Button>

								<Button
									isSecondary
									target="_blank"
									href="https://wordpress.org/support/plugin/otter-blocks/reviews/#new-post"
									className="otter-step-eight"
								>
									{ __( 'Leave a review', 'otter-blocks' ) }
								</Button>
							</div>
						</div>
					</PanelBody>
				</div>

				<div className="otter-right">
					<PanelBody
						title={ __( 'Tools', 'otter-blocks' ) }
					>
						<PanelRow>
							<ButtonControl
								label={ __( 'Regenerate Styles', 'otter-blocks' ) }
								help={ __( 'Clicking on this will delete all the Otter generated CSS files.', 'otter-blocks' ) }
								buttonLabel={ __( 'Regenerate', 'otter-blocks' ) }
								disabled={ isRegeneratedDisabled }
								action={ () => setOpen( true ) }
							/>
						</PanelRow>
					</PanelBody>
				</div>
			</div>

			{ isOpen && (
				<Modal
					title={ __( 'Are you sure?', 'otter-blocks' ) }
					onRequestClose={ () => setOpen( false ) }
				>
					<p>{ __( 'Are you sure you want to delete all Otter generated CSS files?', 'otter-blocks' ) }</p>
					<p>{ __( 'Note: Styles will be regenerated as users start visiting your pages.', 'otter-blocks' ) }</p>

					<div className="otter-modal-actions">
						<Button
							isSecondary
							onClick={ () => setOpen( false ) }
						>
							{ __( 'Cancel', 'otter-blocks' ) }
						</Button>

						<Button
							isPrimary
							disabled={ 'saving' === status }
							isBusy={ 'saving' === status }
							onClick={ regenerateStyles }
						>
							{ __( 'Confirm', 'otter-blocks' ) }
						</Button>
					</div>
				</Modal>
			) }
		</Fragment>
	);
};

export default Main;
