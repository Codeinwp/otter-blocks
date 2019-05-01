/**
 * External dependencies.
 */
import Joyride from 'react-joyride';

/**
 * WordPress dependencies.
 */
const { __ } = wp.i18n;

const {
	Button,
	Modal
} = wp.components;

const {
	Component,
	Fragment
} = wp.element;

class Onboarding extends Component {
	constructor() {
		super( ...arguments );
		this.skipTour = this.skipTour.bind( this );

		this.state = {
			isOpen: true,
			runTour: false,
			steps: [
				{
					target: '.otter-step-one',
					content: __( 'Howdy, I\'m Ollie The Otter! I will help you configure your Otter experience. So let\'s start the magic!' ),
					disableBeacon: true
				},
				{
					target: '.otter-step-two',
					content: __( 'Jazz up your blocks with some sparkly custom CSS or Blocks Animation right inside the block. Here you can enable modules to enhance your experience with Block Editor.' )
				},
				{
					target: '.otter-step-three',
					content: __( 'Section Block is the signature feature of Otter. It allows you to build beautiful layouts right inside the Block Editor. You can set Section Block as the default block for your new Pages.' )
				},
				{
					target: '.otter-step-four',
					content: __( 'We love maps! Here you can set your Google Maps API key for Otter\'s Map Block.' )
				},
				{
					target: '.otter-step-five',
					content: __( 'If you don\'t have an API key, you can register one by clicking here.' )
				},
				{
					target: '.otter-step-six',
					content: __( 'If you ever need any help, we are a team of real Otter-lovers who would love to help you out.' )
				},
				{
					target: '.otter-step-seven',
					content: __( 'And if you love what we do, please leave us a review at WordPress.org. Your review keeps us motivated to make awesome things.' )
				},
				{
					target: '.otter-step-one',
					content: __( 'That\'s it for now! Hope you enjoy Otter and love it as much as we do.' )
				}
			]
		};
	}

	async componentDidMount() {
		wp.api.loadPromise.then( () => {
			this.settings = new wp.api.models.Settings();
		});
	}

	skipTour( status ) {
		if ( this.state.isOpen ) {
			this.setState({ isOpen: false });
		}

		if ( 'finished' !== status && 'skipped' !== status ) {
			return;
		}

		const model = new wp.api.models.Settings({
			// eslint-disable-next-line camelcase
			'themeisle_blocks_settings_tour': false
		});

		const save = model.save();

		save.success( ( response, status ) => {
			this.settings.fetch();
		});

		save.error( ( response, status ) => {
			console.warning( response.responseJSON.message );
		});
	}

	render() {
		return (
			<Fragment>
				{ this.state.isOpen && (
					<Modal
						title={ __( 'Welcome to Otter!' ) }
						isDismissable={ false }
						className="otter-onboarding-modal"
					>
						<div className="otter-onboarding-modal-content">
							{ __( 'Would you like to start the onboarding wizard which will help you personalize the plugin for yourself?' ) }
						</div>

						<div className="otter-onboarding-modal-action">
							<Button
								isPrimary
								isLarge
								onClick={ () => this.setState({
									isOpen: false,
									runTour: true
								}) }
							>
								{ __( 'Start' ) }
							</Button>

							<Button
								isDefault
								isLarge
								onClick={ () => this.skipTour( 'skipped' ) }
							>
								{ __( 'Skip' ) }
							</Button>
						</div>
					</Modal>
				) }

				<Joyride
					continuous={ true }
					run={ this.state.runTour }
					steps={ this.state.steps }
					scrollToFirstStep
					showSkipButton
					locale={ {
						back: __( 'Back' ),
						close: __( 'Close' ),
						last: __( 'Finish' ),
						next: __( 'Next' ),
						skip: __( 'Skip' )
					} }
					callback={ data => this.skipTour( data.status )}
				/>
			</Fragment>
		);
	}
}

export default Onboarding;
