/**
 * WordPress dependencies.
 */
import { createPortal } from '@wordpress/element';

import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies.
 */
import './style.scss';
import './store';
import App from './components/App';

const Render = () => {
	return createPortal(
		<App />,
		document.body
	);
};

// Check the URL for the onboarding query string.
const urlParams = new URLSearchParams( window.location.search );
const onboarding = urlParams.get( 'onboarding' );

// If the onboarding query string is present, render the onboarding modal.
if ( 'true' === onboarding ) {
	registerPlugin( 'otter-onboarding', {
		render: Render
	});
}
