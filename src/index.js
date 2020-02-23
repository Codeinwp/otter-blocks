/**
 * Internal dependencies.
 */
import ReactNotification from 'react-notifications-component';

import './style.scss';

import Onboarding from './Components/Onboarding.js';

import Header from './Components/Header.js';

import Main from './Components/Main.js';

import Footer from './Components/Footer.js';

/**
 * WordPress dependencies.
 */
const {
	render,
	Fragment
} = wp.element;

const App = () => {
	return (
		<Fragment>
			{ Boolean( otterObj.showTour ) && <Onboarding /> }
			<ReactNotification/>
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
