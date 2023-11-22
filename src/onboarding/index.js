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

registerPlugin( 'otter-onboarding', {
	render: Render
});
