/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	Button,
	PanelBody,
	Placeholder,
	Spinner
} from '@wordpress/components';

import {
	Fragment,
	useEffect,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies.
 */
import useSettings from './../hooks/settings.js';
import Dashboard from './pages/Dashboard.js';
import Integrations from './pages/Integrations.js';

const Main = ({
	currentTab
}) => {
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

	const LeftContent = () => {
		switch ( currentTab ) {
		case 'integrations':
			return (
				<Integrations
					status={ status }
					updateOption={ updateOption }
					googleMapsAPI={ googleMapsAPI }
					setGoogleMapsAPI={ setGoogleMapsAPI }
					googleCaptchaAPISiteKey={ googleCaptchaAPISiteKey }
					setGoogleCaptchaAPISiteKey={ setGoogleCaptchaAPISiteKey }
					googleCaptchaAPISecretKey={ googleCaptchaAPISecretKey }
					setGoogleCaptchaAPISecretKey={ setGoogleCaptchaAPISecretKey }
				/>
			);
		default:
			return (
				<Dashboard
					status={ status }
					getOption={ getOption }
					updateOption={ updateOption }
				/>
			);
		}
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
					<LeftContent/>
				</div>

				<div className="otter-right">
					<PanelBody>
						<div className="otter-info">
							<h2>{ __( 'Got a question for us?', 'otter-blocks' ) }</h2>

							<p>{ __( 'We would love to help you out if you need any help with Otter.', 'otter-blocks' ) }</p>

							<div className="otter-info-button-group">
								<Button
									isSecondary
									target="_blank"
									href="https://wordpress.org/support/plugin/otter-blocks"
								>
									{ __( 'Ask a question', 'otter-blocks' ) }
								</Button>

								<Button
									isSecondary
									target="_blank"
									href="https://wordpress.org/support/plugin/otter-blocks/reviews/#new-post"
								>
									{ __( 'Leave a review', 'otter-blocks' ) }
								</Button>
							</div>
						</div>
					</PanelBody>
				</div>
			</div>
		</Fragment>
	);
};

export default Main;
