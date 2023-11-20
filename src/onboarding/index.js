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
import { generateStylesheet } from './utils';
import App from './components/App';

const Render = () => {
	generateStylesheet();

	return createPortal(
		<App />,
		document.body
	);
};

registerPlugin( 'otter-onboarding', {
	render: Render
});
