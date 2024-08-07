/**
 * Internal dependencies
 */
import { domReady } from '../../helpers/frontend-helper-functions.js';

import Popup from './popup';

domReady( () => {
	const popups = document.querySelectorAll( '.wp-block-themeisle-blocks-popup, .wp-block-themeisle-blocks-modal' );

	if ( ! popups.length ) {
		return;
	}

	popups.forEach( block => new Popup( block ) );
});
