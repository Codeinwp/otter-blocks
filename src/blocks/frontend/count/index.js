/**
 * WordPress dependencies
 */
import domReady from '@wordpress/dom-ready';


domReady( () => {
	const anims = document.querySelectorAll( 'o-anim-count' );
	console.log( anims );
});
