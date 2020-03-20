/**
 * External dependencies.
 */
import Joyride from 'react-joyride';

/**
 * WordPress dependencies.
 */
const { debounce } = lodash;

const { __ } = wp.i18n;

const {
	Button,
	Modal
} = wp.components;

const {
	Fragment,
	useEffect,
	useRef,
	useState
} = wp.element;

const Onboarding = () => {
	const [ isOpen, setOpen ] = useState( true );
	const [ runTour, setRunTour ] = useState( false );

	const settingsRef = useRef( null );

	useEffect( () => {
		wp.api.loadPromise.then( () => {
			settingsRef.current = new wp.api.models.Settings();
		});
	}, []);

	const steps = [
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
			content: __( 'Help us in making our plugin better with anonymous data tracking.' )
		},
		{
			target: '.otter-step-seven',
			content: __( 'If you ever need any help, we are a team of real Otter-lovers who would love to help you out.' )
		},
		{
			target: '.otter-step-eight',
			content: __( 'And if you love what we do, please leave us a review at WordPress.org. Your review keeps us motivated to make awesome things.' )
		},
		{
			target: '.otter-step-one',
			content: __( 'That\'s it for now! Hope you enjoy Otter and love it as much as we do.' )
		}
	];

	const skipTour = debounce( status => {
		if ( isOpen ) {
			setOpen( false );
		}

		if ( 'ready' !== status && 'finished' !== status && 'skipped' !== status ) {
			return;
		}

		const model = new wp.api.models.Settings({
			// eslint-disable-next-line camelcase
			'themeisle_blocks_settings_tour': false
		});

		const save = model.save();

		save.success( ( response, status ) => {
			settingsRef.current.fetch();
		});

		save.error( ( response, status ) => {
			console.warning( response.responseJSON.message );
		});
	}, 1000 );

	return (
		<Fragment>
			{ isOpen && (
				<Modal
					title={ __( 'Welcome to Otter!' ) }
					isDismissable={ false }
					isDismissible={ false }
					className="otter-onboarding-modal"
				>
					<div className="otter-onboarding-modal-content">
						{ __( 'Would you like to start the onboarding wizard which will help you personalize the plugin for yourself?' ) }
					</div>

					<div className="otter-onboarding-modal-action">
						<Button
							isPrimary
							isLarge
							onClick={ () => {
								setOpen( false );
								setRunTour( true );
							} }
						>
							{ __( 'Start' ) }
						</Button>

						<Button
							isDefault
							isLarge
							onClick={ () => skipTour( 'skipped' ) }
						>
							{ __( 'Skip' ) }
						</Button>
					</div>
				</Modal>
			) }

			<Joyride
				continuous={ true }
				run={ runTour }
				steps={ steps }
				scrollToFirstStep
				showSkipButton
				locale={ {
					back: __( 'Back' ),
					close: __( 'Close' ),
					last: __( 'Finish' ),
					next: __( 'Next' ),
					skip: __( 'Skip' )
				} }
				callback={ data => skipTour( data.status )}
			/>
		</Fragment>
	);
};

export default Onboarding;
