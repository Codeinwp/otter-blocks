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
import Notices from './Components/Notices.js';
import Header from './Components/Header.js';
import Main from './Components/Main.js';
import Footer from './Components/Footer.js';

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
