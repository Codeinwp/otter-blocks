/**
 * Internal dependencies.
 */
import './style.scss';

import Onboarding from './Components/Onboarding.js';

import Header from './Components/Header.js';

import Main from './Components/Main.js';

import Footer from './Components/Footer.js';

/**
 * WordPress dependencies.
 */
const {
	Component,
	Fragment
} = wp.element;

class App extends Component {
	constructor() {
		super( ...arguments );
	}

	render() {
		return (
			<Fragment>
				{ Boolean( otterObj.showTour ) && <Onboarding /> }
				<Header />
				<Main />
				<Footer />
			</Fragment>
		);
	}
}

ReactDOM.render(
	<App />,
	document.getElementById( 'otter' )
);
