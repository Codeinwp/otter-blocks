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
import Onboarding from './components/Onboarding.js';
import Notices from './components/Notices';
import Header from './components/Header.js';
import Main from './components/Main.js';
import Footer from './components/Footer.js';

const App = () => {
	return (
		<Fragment>
			{ Boolean( window.otterObj.showTour ) && <Onboarding /> }
			<Notices />
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
