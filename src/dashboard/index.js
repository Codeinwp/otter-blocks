/* eslint-disable camelcase */
/**
 * External dependencies.
 */
import formbricks from '@formbricks/js';

/**
 * WordPress dependencies.
 */
import {
	createRoot,
	Fragment,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies.
 */
import './style.scss';
import '../blocks/plugins/feedback';
import Notices from './components/Notices.js';
import Header from './components/Header.js';
import Main from './components/Main.js';
import Footer from './components/Footer.js';
import useSettings from '../blocks/helpers/use-settings.js';

if ( undefined === window.otterUtils ) {
	window.otterUtils = {};
}

window.otterUtils.useSettings = useSettings;

const getInitialStateFromURLQuery = () => {
	const hash = window.location.hash.slice( 1 ); // Remove the '#' at the start
	return hash;
};

const convertToCategory = ( number, scale = 1 ) => {
	const normalizedNumber = Math.round( number / scale );
	if ( 0 === normalizedNumber || 1 === normalizedNumber ) {
		return 0;
	} else if ( 1 < normalizedNumber && 8 > normalizedNumber ) {
		return 7;
	} else if ( 8 <= normalizedNumber && 31 > normalizedNumber ) {
		return 30;
	} else if ( 30 < normalizedNumber && 90 > normalizedNumber ) {
		return 90;
	} else if ( 90 < normalizedNumber ) {
		return 91;
	}
};

if ( 'undefined' !== typeof window ) {
	formbricks.init({
		environmentId: 'clp9hqm8c1osfdl2ixwd0k0iz',
		apiHost: 'https://app.formbricks.com',
		userId: 'otter_' + ( undefined !== window.otterObj?.license?.key ? window.otterObj.license.key : window.otterObj.rootUrl.replace( /[^\w\d]*/g, '' ) ),
		attributes: {
			plan: undefined !== window.otterObj?.license?.type ? window.otterObj.license.type : 'free',
			days_since_install: convertToCategory( window.otterObj.days_since_install )
		}
	});
}

const App = () => {
	const [ currentTab, setTab ] = useState( getInitialStateFromURLQuery() );

	return (
		<Fragment>
			{ undefined !== wp.notices.store && <Notices />}

			<Header
				isActive={ currentTab }
				setActive={ setTab }
			/>

			<Main
				currentTab={ currentTab }
				setTab={ setTab }
			/>

			<Footer />
		</Fragment>
	);
};

const root = createRoot( document.getElementById( 'otter' ) );

root.render( <App /> );
