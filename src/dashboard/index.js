/**
 * External dependencies.
 */
import ReactNotification from 'react-notifications-component';

/**
 * WordPress dependencies.
 */
import {
	render,
	Fragment
} from '@wordpress/element';

/**
 * Internal dependencies.
 */
import './style.scss';
import Onboarding from './Components/Onboarding.js';
import Header from './Components/Header.js';
import Main from './Components/Main.js';
import Footer from './Components/Footer.js';

const App = () => {
	return (
		<Fragment>
			{ Boolean( window.otterObj.showTour ) && <Onboarding /> }
			<ReactNotification />
			<Header />
			<Main />
			<Footer />
		</Fragment>
	);
};

render(
	<App />,
	document.getElementById( 'otter' )
);
