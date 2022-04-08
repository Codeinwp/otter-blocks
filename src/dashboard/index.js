/**
 * WordPress dependencies.
 */
import {
	render,
	Fragment,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies.
 */
import './style.scss';
import Notices from './components/Notices.js';
import Header from './components/Header.js';
import Main from './components/Main.js';
import Footer from './components/Footer.js';

const App = () => {
	const [ currentTab, setTab ] = useState( 'dashboard' );

	return (
		<Fragment>
			<Notices />

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

render(
	<App />,
	document.getElementById( 'otter' )
);
