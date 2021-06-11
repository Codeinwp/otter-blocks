/**
 * External dependencies.
 */
import { store } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';

/**
 * WordPress dependencies.
 */
const { __ } = wp.i18n;

const { apiFetch } = wp;

const {
	BaseControl,
	Button,
	ExternalLink,
	Modal,
	PanelBody,
	PanelRow,
	Placeholder,
	Spinner,
	ToggleControl
} = wp.components;

const {
	Fragment,
	useEffect,
	useRef,
	useState
} = wp.element;

/**
 * Internal dependencies.
 */
import ButtonControl from './ButtonControl.js';

const Main = () => {
	useEffect( () => {
		wp.api.loadPromise.then( () => {
			settingsRef.current = new wp.api.models.Settings();

			if ( false === isAPILoaded ) {
				settingsRef.current.fetch().then( response => {
					setCSSModule( Boolean( response.themeisle_blocks_settings_css_module ) );
					setBlocksAnimation( Boolean( response.themeisle_blocks_settings_blocks_animation ) );
					setMenuIcons( Boolean( response.themeisle_blocks_settings_menu_icons ) );
					setDefaultSection( Boolean( response.themeisle_blocks_settings_default_block ) );
					setGoogleMapsAPI( response.themeisle_google_map_block_api_key );
					setLoggingData( response.otter_blocks_logger_flag );
					setJSONUploads( Boolean( response.themeisle_allow_json_upload ) );
					setAPILoaded( true );
				});
			}
		});

		if ( ! Boolean( otterObj.stylesExist ) ) {
			setRegeneratedDisabled( true );
		}
	}, []);

	const [ isAPILoaded, setAPILoaded ] = useState( false );
	const [ isAPISaving, setAPISaving ] = useState( false );
	const [ notification, setNotification ] = useState( null );
	const [ cssModule, setCSSModule ] = useState( false );
	const [ blocksAnimation, setBlocksAnimation ] = useState( false );
	const [ menuIcons, setMenuIcons ] = useState( false );
	const [ isDefaultSection, setDefaultSection ] = useState( true );
	const [ googleMapsAPI, setGoogleMapsAPI ] = useState( '' );
	const [ isLoggingData, setLoggingData ] = useState( 'no' );
	const [ allowJSONUploads, setJSONUploads ] = useState( false );
	const [ isOpen, setOpen ] = useState( false );
	const [ isRegeneratedDisabled, setRegeneratedDisabled ] = useState( false );

	const settingsRef = useRef( null );
	const notificationDOMRef = useRef( null );

	const changeOptions = ( option, state, value ) => {
		setAPISaving( true );

		addNotification( __( 'Updating settings…', 'otter-blocks' ), 'info' );

		const model = new wp.api.models.Settings({
			// eslint-disable-next-line camelcase
			[option]: value
		});

		const save = model.save();

		save.success( ( response, status ) => {
			store.removeNotification( notification );

			if ( 'success' === status ) {

				setOptions( state, response[option]);

				setTimeout( () => {
					addNotification( __( 'Settings saved.', 'otter-blocks' ), 'success' );
					setAPISaving( false );
				}, 800 );
			}

			if ( 'error' === status ) {
				setTimeout( () => {
					addNotification( __( 'An unknown error occurred.', 'otter-blocks' ), 'danger' );
					setAPISaving( false );
				}, 800 );
			}

			settingsRef.current.fetch();
		});

		save.error( ( response, status ) => {
			store.removeNotification( notification );

			setTimeout( () => {
				addNotification( response.responseJSON.message ? response.responseJSON.message : __( 'An unknown error occurred.', 'otter-blocks' ), 'danger' );
				setAPISaving( false );
			}, 800 );
		});
	};

	const setOptions = ( option, value ) => {
		switch ( option ) {
		case 'cssModule':
			setCSSModule( value );
			break;
		case 'blocksAnimation':
			setBlocksAnimation( value );
			break;
		case 'menuIcons':
			setMenuIcons( value );
			break;
		case 'isDefaultSection':
			setDefaultSection( value );
			break;
		case 'googleMapsAPI':
			setGoogleMapsAPI( value );
			break;
		case 'isLoggingData':
			setLoggingData( value );
			break;
		case 'allowJSONUploads':
			setJSONUploads( value );
			break;
		}
	};

	const regenerateStyles = async() => {
		setAPISaving( true );
		let data = await apiFetch({ path: 'themeisle-gutenberg-blocks/v1/regenerate_styles', method: 'DELETE' });
		addNotification( data.data.message, data.success ? 'success' : 'danger' );
		setRegeneratedDisabled( true );
		setAPISaving( false );
		setOpen( false );
	};

	const addNotification = ( message, type ) => {
		const notification = store.addNotification({
			message,
			type,
			insert: 'top',
			container: 'bottom-left',
			isMobile: true,
			dismiss: {
				duration: 2000,
				showIcon: true
			},
			dismissable: {
				click: true,
				touch: true
			}
		});

		setNotification( notification );
	};

	if ( ! isAPILoaded ) {
		return (
			<Placeholder>
				<Spinner />
			</Placeholder>
		);
	}

	return (
		<Fragment>
			<div className="otter-main">
				<div className="otter-step-two">
					<PanelBody
						title={ __( 'Modules', 'otter-blocks' ) }
					>
						<PanelRow>
							<ToggleControl
								label={ __( 'Enable Custom CSS Module', 'otter-blocks' ) }
								help={ 'Custom CSS module allows to add custom CSS to each block in Block Editor.' }
								checked={ cssModule }
								onChange={ () => changeOptions( 'themeisle_blocks_settings_css_module', 'cssModule', ! cssModule ) }
							/>
						</PanelRow>

						<PanelRow>
							<ToggleControl
								label={ __( 'Enable Blocks Animation Module', 'otter-blocks' ) }
								help={ 'Blocks Animation module allows to add CSS animations to each block in Block Editor.' }
								checked={ blocksAnimation }
								onChange={ () => changeOptions( 'themeisle_blocks_settings_blocks_animation', 'blocksAnimation', ! blocksAnimation ) }
							/>
						</PanelRow>

						{ Boolean( otterObj.navExists ) && (
							<PanelRow>
								<ToggleControl
									label={ __( 'Enable Menu Icons Module', 'otter-blocks' ) }
									help={ 'Menu Icons module allows to add icons to navigation menu items in Block Editor.' }
									checked={ menuIcons }
									onChange={ () => changeOptions( 'themeisle_blocks_settings_menu_icons', 'menuIcons', ! menuIcons ) }
								/>
							</PanelRow>
						) }
					</PanelBody>
				</div>

				<div className="otter-step-three">
					<PanelBody
						title={ __( 'Section', 'otter-blocks' ) }
					>
						<PanelRow>
							<ToggleControl
								label={ __( 'Make Section your default block for Pages', 'otter-blocks' ) }
								help={ 'Everytime you create a new page, Section block will be appended there by default.' }
								checked={ isDefaultSection }
								onChange={ () => changeOptions( 'themeisle_blocks_settings_default_block', 'isDefaultSection', ! isDefaultSection ) }
							/>
						</PanelRow>
					</PanelBody>
				</div>

				<div className="otter-step-four">
					<PanelBody
						title={ __( 'Maps', 'otter-blocks' ) }
					>
						<PanelRow>
							<BaseControl
								label={ __( 'Google Maps API', 'otter-blocks' ) }
								help={ 'In order to use Google Maps block, you need to use Google Maps and Places API.' }
								id="otter-options-google-map-api"
								className="otter-button-field"
							>
								<input
									type="text"
									id="otter-options-google-map-api"
									value={ googleMapsAPI }
									placeholder={ __( 'Google Maps API Key', 'otter-blocks' ) }
									disabled={ isAPISaving }
									onChange={ e => setGoogleMapsAPI( e.target.value ) }
								/>

								<div className="otter-button-group">
									<Button
										isPrimary
										isLarge
										disabled={ isAPISaving }
										onClick={ () => changeOptions( 'themeisle_google_map_block_api_key', 'googleMapsAPI', googleMapsAPI ) }
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
					</PanelBody>
				</div>

				<div className="otter-step-six">
					<PanelBody
						title={ __( 'Other', 'otter-blocks' ) }
					>
						<PanelRow>
							<ToggleControl
								label={ __( 'Anonymous Data Tracking.', 'otter-blocks' ) }
								help={ 'Become a contributor by opting in to our anonymous data tracking. We guarantee no sensitive data is collected.' }
								checked={ 'yes' === isLoggingData ? true : false }
								onChange={ () => changeOptions( 'otter_blocks_logger_flag', 'isLoggingData', ( 'yes' === isLoggingData ? 'no' : 'yes' ) ) }
							/>
						</PanelRow>

						<PanelRow>
							<ToggleControl
								label={ __( 'Allow JSON Uploads.', 'otter-blocks' ) }
								help={ 'This option allows JSON files to be uploaded to the media library to use in Lottie Block. Only enable this option if you want to use custom JSON uploads in Lottie Block.' }
								checked={ allowJSONUploads }
								onChange={ () => changeOptions( 'themeisle_allow_json_upload', 'allowJSONUploads', ! allowJSONUploads ) }
							/>
						</PanelRow>

						<PanelRow>
							<ButtonControl
								label={ __( 'Regenerate Styles', 'otter-blocks' ) }
								help={ 'Clicking on this will delete all the Otter generated CSS files.' }
								buttonLabel={ __( 'Regenerate', 'otter-blocks' ) }
								disabled={ isRegeneratedDisabled }
								action={ () => setOpen( true ) }
							/>
						</PanelRow>

						<PanelRow>
							<div>
								{ [
									__( 'Let us know how we can improve. Vote on existing ideas or suggest new ones.', 'otter-blocks' ),
									' ',
									<ExternalLink href="https://otter.nolt.io/">{ __( 'Give feedback!', 'otter-blocks' ) }</ExternalLink>
								] }
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
								isLarge
								target="_blank"
								href="https://wordpress.org/support/plugin/otter-blocks"
								className="otter-step-seven"
							>
								{ __( 'Ask a question', 'otter-blocks' ) }
							</Button>

							<Button
								isSecondary
								isLarge
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
							isLarge
							onClick={ () => setOpen( false ) }
						>
							{ __( 'Cancel', 'otter-blocks' ) }
						</Button>

						<Button
							isPrimary
							isLarge
							disabled={ isAPISaving }
							isBusy={ isAPISaving }
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
