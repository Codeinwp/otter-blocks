/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
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
import Sidebar from './Sidebar.js';
import Dashboard from './pages/Dashboard.js';
import Upsell from './pages/Upsell.js';
import Integrations from './pages/Integrations.js';

const Main = ({
	currentTab,
	setTab
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

	if ( 'loading' === status ) {
		return (
			<Placeholder>
				<Spinner />
			</Placeholder>
		);
	}

	const Content = () => {
		switch ( currentTab ) {
		case 'integrations':
			return (
				<Fragment>
					<div className="otter-left">
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
					</div>

					<div className="otter-right">
						<Sidebar setTab={ setTab }/>
					</div>
				</Fragment>
			);
		case 'upsell':
			return (
				<Upsell />
			);
		default:
			return (
				<Fragment>
					<div className="otter-left">
						<Dashboard
							status={ status }
							getOption={ getOption }
							updateOption={ updateOption }
						/>
					</div>

					<div className="otter-right">
						<Sidebar setTab={ setTab }/>
					</div>
				</Fragment>
			);
		}
	};

	return (
		<Fragment>
			<div className={ `otter-main is-${ currentTab}`}>
				<Content />
			</div>
		</Fragment>
	);
};

export default Main;
