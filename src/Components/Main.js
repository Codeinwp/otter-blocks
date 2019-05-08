/**
 * External dependencies.
 */
import ReactNotification from 'react-notifications-component';

import 'react-notifications-component/dist/theme.css';

/**
 * WordPress dependencies.
 */
const { __ } = wp.i18n;

const {
	BaseControl,
	Button,
	ExternalLink,
	PanelBody,
	PanelRow,
	Placeholder,
	Spinner,
	ToggleControl
} = wp.components;

const {
	Component,
	Fragment
} = wp.element;

class Main extends Component {
	constructor() {
		super( ...arguments );

		this.changeOptions = this.changeOptions.bind( this );
		this.addNotification = this.addNotification.bind( this );
		this.notificationDOMRef = React.createRef();

		this.state = {
			isAPILoaded: false,
			isAPISaving: false,
			notification: null,
			cssModule: false,
			blocksAnimation: false,
			isDefaultSection: true,
			googleMapsAPI: ''
		};
	}

	async componentDidMount() {
		wp.api.loadPromise.then( () => {
			this.settings = new wp.api.models.Settings();

			if ( false === this.state.isAPILoaded ) {
				this.settings.fetch().then( response => {
					this.setState({
						cssModule: Boolean( response.themeisle_blocks_settings_css_module ),
						blocksAnimation: Boolean( response.themeisle_blocks_settings_blocks_animation ),
						isDefaultSection: Boolean( response.themeisle_blocks_settings_default_block ),
						googleMapsAPI: response.themeisle_google_map_block_api_key,
						isAPILoaded: true
					});
				});
			}
		});
	}

	changeOptions( option, state, value ) {
		this.setState({ isAPISaving: true });

		this.addNotification( __( 'Updating settings…' ), 'info' );

		const model = new wp.api.models.Settings({
			// eslint-disable-next-line camelcase
			[option]: value
		});

		const save = model.save();

		save.success( ( response, status ) => {
			this.notificationDOMRef.current.removeNotification( this.state.notification );

			if ( 'success' === status ) {
				this.setState({
					[state]: response[option]
				});

				setTimeout( () => {
					this.addNotification( __( 'Settings saved.' ), 'success' );
					this.setState({ isAPISaving: false });
				}, 800 );
			}

			if ( 'error' === status ) {
				setTimeout( () => {
					this.addNotification( __( 'An unknown error occurred.' ), 'danger' );
					this.setState({ isAPISaving: false });
				}, 800 );
			}

			this.settings.fetch();
		});

		save.error( ( response, status ) => {
			this.notificationDOMRef.current.removeNotification( this.state.notification );

			setTimeout( () => {
				this.addNotification( response.responseJSON.message ? response.responseJSON.message : __( 'An unknown error occurred.' ), 'danger' );
				this.setState({ isAPISaving: false });
			}, 800 );
		});
	}

	addNotification( message, type ) {
		const notification = this.notificationDOMRef.current.addNotification({
			message,
			type,
			insert: 'top',
			container: 'top-right',
			slidingEnter: {
				duration: 0,
				delay: 0
			},
			dismiss: { duration: 2000 },
			dismissable: { click: true }
		});

		this.setState({ notification });
	}

	render() {
		if ( ! this.state.isAPILoaded ) {
			return (
				<Placeholder>
					<Spinner />
				</Placeholder>
			);
		}

		return (
			<Fragment>
				<ReactNotification ref={ this.notificationDOMRef } />

				<div className="otter-main">

					<div className="otter-step-two">
						<PanelBody
							title={ __( 'Modules' ) }
						>
							<PanelRow>
								<ToggleControl
									label={ __( 'Enable Custom CSS Module' ) }
									help={ 'Custom CSS module allows to add custom CSS to each block in Block Editor.' }
									checked={ this.state.cssModule }
									onChange={ () => this.changeOptions( 'themeisle_blocks_settings_css_module', 'cssModule', ! this.state.cssModule ) }
								/>
							</PanelRow>

							<PanelRow>
								<ToggleControl
									label={ __( 'Enable Blocks Animation Module' ) }
									help={ 'Blocks Animation module allows to add CSS animations to each block in Block Editor.' }
									checked={ this.state.blocksAnimation }
									onChange={ () => this.changeOptions( 'themeisle_blocks_settings_blocks_animation', 'blocksAnimation', ! this.state.blocksAnimation ) }
								/>
							</PanelRow>
						</PanelBody>
					</div>

					<div className="otter-step-three">
						<PanelBody
							title={ __( 'Section' ) }
						>
							<PanelRow>
								<ToggleControl
									label={ __( 'Make Section your default block for Pages' ) }
									help={ 'Everytime you create a new page, Section block will be appended there by default.' }
									checked={ this.state.isDefaultSection }
									onChange={ () => this.changeOptions( 'themeisle_blocks_settings_default_block', 'isDefaultSection', ! this.state.isDefaultSection ) }
								/>
							</PanelRow>
						</PanelBody>
					</div>

					<div className="otter-step-four">
						<PanelBody
							title={ __( 'Maps' ) }
						>
							<PanelRow>
								<BaseControl
									label={ __( 'Google Maps API' ) }
									help={ 'In order to use Google Maps block, you need to use Google Maps and Places API.' }
									id="otter-options-google-map-api"
									className="otter-text-field"
								>
									<input
										type="text"
										id="otter-options-google-map-api"
										value={ this.state.googleMapsAPI }
										placeholder={ __( 'Google Maps API Key' ) }
										disabled={ this.state.isAPISaving }
										onChange={ e => this.setState({ googleMapsAPI: e.target.value }) }
									/>

									<div className="otter-text-field-button-group">
										<Button
											isPrimary
											isLarge
											disabled={ this.state.isAPISaving }
											onClick={ () => this.changeOptions( 'themeisle_google_map_block_api_key', 'googleMapsAPI', this.state.googleMapsAPI ) }
										>
											{ __( 'Save' ) }
										</Button>

										<ExternalLink
											href="https://developers.google.com/maps/documentation/javascript/get-api-key"
											className="otter-step-five"
										>
											{ __( 'Get API Key' ) }
										</ExternalLink>
									</div>
								</BaseControl>
							</PanelRow>
						</PanelBody>
					</div>

					<PanelBody>
						<div className="otter-info">
							<h2>{ __( 'Got a question for us?' ) }</h2>

							<p>{ __( 'We would love to help you out if you need any help with Otter.' ) }</p>

							<div className="otter-info-button-group">
								<Button
									isDefault
									isLarge
									target="_blank"
									href="https://wordpress.org/support/plugin/otter-blocks"
									className="otter-step-six"
								>
									{ __( 'Ask a question' ) }
								</Button>

								<Button
									isDefault
									isLarge
									target="_blank"
									href="https://wordpress.org/support/plugin/otter-blocks/reviews/#new-post"
									className="otter-step-seven"
								>
									{ __( 'Leave a review' ) }
								</Button>
							</div>
						</div>
					</PanelBody>
				</div>
			</Fragment>
		);
	}
}

export default Main;
