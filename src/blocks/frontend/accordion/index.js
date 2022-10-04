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

		const items = accordion.querySelectorAll( '.wp-block-themeisle-blocks-accordion-item' );

		// todo: open/close issue in nested accordions
		items.forEach( item => {
			item.addEventListener( 'click', () => {
				const isOpened = ! item.open;

				if ( ! isOpened ) {
					return;
				}

				const openedSibling = accordion.querySelectorAll( '[open]' );
				openedSibling.forEach( sibling => {
					sibling.removeAttribute( 'open' );
				});
			});
		});
	});
});
