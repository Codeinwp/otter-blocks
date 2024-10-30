/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import apiFetch from '@wordpress/api-fetch';

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

import { useDispatch } from '@wordpress/data';

import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import useSettings from '../../../blocks/helpers/use-settings.js';

const Integrations = () => {
	const [ getOption, updateOption, status ] = useSettings();
	const [ googleMapsAPI, setGoogleMapsAPI ] = useState( '' );
	const [ googleCaptchaAPISiteKey, setGoogleCaptchaAPISiteKey ] = useState( '' );
	const [ googleCaptchaAPISecretKey, setGoogleCaptchaAPISecretKey ] = useState( '' );
	const [ stripeAPI, setStripeAPI ] = useState( '' );
	const [ openAISecretKey, setOpenAISecretKey ] = useState( '' );
	const [ toolbarActions, setToolbarActions ] = useState([]);

	const [ maskOpenAISecretKey, setMaskOpenAISecretKey ] = useState( '' );


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

	useEffect( () => {
		const apiKey = getOption( 'themeisle_open_ai_api_key' );
		if ( ! apiKey || 8 > apiKey.length ) {
			return;
		}

		setMaskOpenAISecretKey( apiKey.slice( 0, 3 ) + 'X'.repeat( apiKey.length - 8 ) + apiKey.slice( -4 ) );
	}, [ getOption( 'themeisle_open_ai_api_key' ) ]);

	useEffect( () => {
		setToolbarActions( getOption( 'themeisle_blocks_settings_prompt_actions' ) );
	}, [ getOption( 'themeisle_blocks_settings_prompt_actions' ) ]);

	const { createNotice } = useDispatch( 'core/notices' );

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
								onClick={ () => {
									window.tiTrk?.with( 'otter' ).add({ feature: 'dashboard-integration', featureComponent: 'stripe' });
									updateOption( 'themeisle_stripe_api_key', stripeAPI );
								} }
							>
								{ __( 'Save', 'otter-blocks' ) }
							</Button>

							<ExternalLink
								href="https://stripe.com/docs/keys"
							>
								{ __( 'Get API Key', 'otter-blocks' ) }
							</ExternalLink>

							<ExternalLink
								href="https://docs.themeisle.com/article/1688-integrations-related-blocks#stripe-checkout"
							>
								{ __( 'More Info', 'otter-blocks' ) }
							</ExternalLink>
						</div>
					</BaseControl>
				</PanelRow>
			</PanelBody>

			<PanelBody
				title={ __( 'OpenAI', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<PanelRow>
					<BaseControl
						label={ __( 'OpenAI API', 'otter-blocks' ) }
						help={ __( 'In order to use AI Block, you need to use OpenAI API.', 'otter-blocks' ) }
						id="otter-options-stripe-api"
						className="otter-button-field"
					>
						<TextControl
							type="text"
							label={ __( 'Secret Key', 'otter-blocks' ) }
							value={ openAISecretKey }
							placeholder={ maskOpenAISecretKey ? maskOpenAISecretKey : __( 'OpenAI API Key', 'otter-blocks' ) }
							disabled={ 'saving' === status }
							onChange={ value => setOpenAISecretKey( value ) }
						/>

						<div className="otter-button-group">
							<Button
								variant="secondary"
								isSecondary
								disabled={ 'saving' === status }
								onClick={ async() => {
									try {
										const response = await apiFetch({
											path: 'otter/v1/openai/key',
											method: 'POST',
											data: {
												'api_key': openAISecretKey
											}
										});

										if ( ! response.success ) {
											createNotice(
												'error',
												response.message ?? __( 'An unknown error occurred.', 'otter-blocks' ),
												{
													isDismissible: true,
													type: 'snackbar'
												}
											);

											return;
										}

										createNotice(
											'success',
											__( 'API Key saved successfully.', 'otter-blocks' ),
											{
												isDismissible: true,
												type: 'snackbar'
											}
										);
									} catch ( e ) {
										createNotice(
											'error',
											e?.message ?? __( 'An unknown error occurred.', 'otter-blocks' ),
											{
												isDismissible: true,
												type: 'snackbar'
											}
										);

										
									}
								} }
							>
								{ __( 'Save', 'otter-blocks' ) }
							</Button>

							<ExternalLink
								href="https://platform.openai.com/account/api-keys"
							>
								{ __( 'Get API Key', 'otter-blocks' ) }
							</ExternalLink>

							<ExternalLink
								href="https://docs.themeisle.com/article/1916-how-to-generate-an-openai-api-key"
							>
								{ __( 'More Info', 'otter-blocks' ) }
							</ExternalLink>
						</div>
					</BaseControl>
				</PanelRow>
				{
					0 < getOption( 'themeisle_open_ai_api_key' )?.length ? (
						<PanelRow>
							<BaseControl
								label={ __( 'Toolbar Actions', 'otter-blocks' ) }
								help={ __( 'Change the actions present in the AI Toolbar.', 'otter-blocks' ) }
								id="otter-options-toolbar-actions"
								className="otter-button-field"
							>
								<div className="otter-ai-toolbar-actions">
									{
										toolbarActions.map( ( action, index ) => {
											return (
												<PanelBody title={ action.title } key={ `container-${index}` } initialOpen={false}>
													<TextControl
														key={ `name-${index}` }
														type="text"
														value={ action.title }
														label={ __( 'Action Name', 'otter-blocks' ) }
														placeholder={ __( 'Action Name', 'otter-blocks' ) }
														disabled={ 'saving' === status }
														onChange={ value => {
															const newActions = [ ...toolbarActions ];
															newActions[ index ].title = value;
															setToolbarActions( newActions );
														} }
													/>
													<TextControl
														key={ `prompt-${index}` }
														type="text"
														value={ action.prompt }
														label={ __( 'Prompt', 'otter-blocks' ) }
														placeholder={ __( 'Prompt', 'otter-blocks' ) }
														disabled={ 'saving' === status }
														onChange={ value => {
															const newActions = [ ...toolbarActions ];
															newActions[ index ].prompt = value;
															setToolbarActions( newActions );
														} }
													/>
												</PanelBody>
											);
										})
									}
								</div>

								<div className="otter-button-group">
									<Button
										variant="secondary"
										isSecondary
										disabled={ 'saving' === status }
										onClick={ () => {
											window.tiTrk?.with( 'otter' ).add({ feature: 'dashboard-integration', featureComponent: 'toolbar-actions' });
											updateOption( 'themeisle_blocks_settings_prompt_actions', toolbarActions );
										} }
									>
										{ __( 'Save', 'otter-blocks' ) }
									</Button>

									<ExternalLink
										href="https://docs.themeisle.com/article/1916-how-to-generate-an-openai-api-key"
									>
										{ __( 'More Info', 'otter-blocks' ) }
									</ExternalLink>
								</div>
							</BaseControl>
						</PanelRow>
					) : (
						<></>
					)
				}
			</PanelBody>
		</Fragment>
	);
};

export default Integrations;
