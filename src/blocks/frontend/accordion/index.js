/**
 * Internal dependencies
 */
import { domReady } from '../../helpers/frontend-helper-functions.js';

domReady( () => {
	const accordions = document.querySelectorAll( '.wp-block-themeisle-blocks-accordion' );

	accordions.forEach( accordion => {
		if ( ! accordion.classList.contains( 'exclusive' ) ) {
			return;
		}

		const items = Array.from( accordion.children );
		items.forEach( item => {
			item.addEventListener( 'click', () => {
				const isOpened = ! item.open;

				if ( ! isOpened ) {
					return;
				}

				const openSibling = Array.from( accordion.children ).filter( sibling => sibling.open );

				openSibling.forEach( sibling => {
					sibling.removeAttribute( 'open' );
				});
			});
		});
	});
});
