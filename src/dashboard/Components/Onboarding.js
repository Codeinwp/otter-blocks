/**
 * External dependencies.
 */
import Joyride from 'react-joyride';

/**
 * WordPress dependencies.
 */
import { debounce } from 'lodash';

import { __ } from '@wordpress/i18n';

import api from '@wordpress/api';

import {
	Button,
	Modal
} from '@wordpress/components';

import {
	Fragment,
	useEffect,
	useMemo,
	useRef,
	useState
} from '@wordpress/element';

const Onboarding = () => {
	const [ isOpen, setOpen ] = useState( true );
	const [ runTour, setRunTour ] = useState( false );

	const settingsRef = useRef( null );

	useEffect( () => {
		api.loadPromise.then( () => {
			settingsRef.current = new api.models.Settings();
		});
	}, []);

	const steps = [
		{
			target: '.otter-step-one',
			content: __( 'Howdy, I\'m Ollie The Otter! I will help you configure your Otter experience. So let\'s start the magic!', 'otter-blocks' ),
			disableBeacon: true
		},
		{
			target: '.otter-step-two',
			content: __( 'Jazz up your blocks with some sparkly custom CSS or Blocks Animation right inside the block. Here you can enable modules to enhance your experience with Block Editor.', 'otter-blocks' )
		},
		{
			target: '.otter-step-three',
			content: __( 'Section Block is the signature feature of Otter. It allows you to build beautiful layouts right inside the Block Editor. You can set Section Block as the default block for your new Pages.', 'otter-blocks' )
		},
		{
			target: '.otter-step-four',
			content: __( 'Here you can set API keys that various blocks need in order to work.', 'otter-blocks' )
		},
		{
			target: '.otter-step-five',
			content: __( 'If you want to get an API key, you will find a help link after each API field.', 'otter-blocks' )
		},
		{
			target: '.otter-step-six',
			content: __( 'Help us in making our plugin better with anonymous data tracking.', 'otter-blocks' )
		},
		{
			target: '.otter-step-seven',
			content: __( 'If you ever need any help, we are a team of real Otter-lovers who would love to help you out.', 'otter-blocks' )
		},
		{
			target: '.otter-step-eight',
			content: __( 'And if you love what we do, please leave us a review at WordPress.org. Your review keeps us motivated to make awesome things.', 'otter-blocks' )
		},
		{
			target: '.otter-step-one',
			content: __( 'That\'s it for now! Hope you enjoy Otter and love it as much as we do.', 'otter-blocks' )
		}
	];

	const skipTour = useMemo( () => debounce( status => {
		if ( isOpen ) {
			setOpen( false );
		}

		if ( 'ready' !== status && 'finished' !== status && 'skipped' !== status ) {
			return;
		}

		const model = new api.models.Settings({
			// eslint-disable-next-line camelcase
			themeisle_blocks_settings_tour: false
		});

		const save = model.save();

		save.success( () => {
			settingsRef.current.fetch();
		});

		save.error( ( response ) => {
			console.warning( response.responseJSON.message );
		});
	}, 1000 ), [ status ]);

	return (
		<Fragment>
			{ isOpen && (
				<Modal
					title={ __( 'Welcome to Otter!', 'otter-blocks' ) }
					isDismissible={ false }
					className="otter-onboarding-modal"
				>
					<div className="otter-onboarding-modal-content">
						{ __( 'Would you like to start the onboarding wizard which will help you personalize the plugin for yourself?', 'otter-blocks' ) }
					</div>

					<div className="otter-onboarding-modal-action">
						<Button
							isPrimary
							onClick={ () => {
								setOpen( false );
								setRunTour( true );
							} }
						>
							{ __( 'Start', 'otter-blocks' ) }
						</Button>

						<Button
							isSecondary
							onClick={ () => skipTour( 'skipped' ) }
						>
							{ __( 'Skip', 'otter-blocks' ) }
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
					back: __( 'Back', 'otter-blocks' ),
					close: __( 'Close', 'otter-blocks' ),
					last: __( 'Finish', 'otter-blocks' ),
					next: __( 'Next', 'otter-blocks' ),
					skip: __( 'Skip', 'otter-blocks' )
				} }
				callback={ data => skipTour( data.status ) }
			/>
		</Fragment>
	);
};

export default Onboarding;
