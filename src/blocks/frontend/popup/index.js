/**
 * WordPress dependencies
 */
import domReady from '@wordpress/dom-ready';

/**
 * Internal dependencies
 */
import Popup from './popup.js';

domReady( () => {
	const popups = document.querySelectorAll( '.wp-block-themeisle-blocks-popup' );

	if ( ! popups.length ) {
		return;
	}

	popups.forEach( block => new Popup( block ) );
});
