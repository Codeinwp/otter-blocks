/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import domReady from '@wordpress/dom-ready';

domReady( () => {
	const tabs = document.querySelectorAll( '.wp-block-themeisle-blocks-tabs' );

	tabs.forEach( tab => {
		const items = Array.from( tab.querySelectorAll( ':scope > .wp-block-themeisle-blocks-tabs__content > .wp-block-themeisle-blocks-tabs-item' ) );
		const header = document.createElement( 'div' );
		header.classList.add( 'wp-block-themeisle-blocks-tabs__header' );
		tab.prepend( header );

		items.forEach( ( item, index ) => {
			const headerItem = document.createElement( 'div' );
			headerItem.classList.add( 'wp-block-themeisle-blocks-tabs__header_item' );
			const content = item.querySelector( ':scope > .wp-block-themeisle-blocks-tabs-item__content' );

			if ( 0 === index ) {
				headerItem.classList.add( 'active' );
				content.classList.add( 'active' );
			}

			headerItem.innerHTML = item.dataset.title || __( 'Untitled Tab' );
			headerItem.tabIndex = 0;

			const headerMobile = item.querySelector( '.wp-block-themeisle-blocks-tabs-item__header' );

			const toggleTabs = ( i, idx ) => {
				const content = i.querySelector( ':scope > .wp-block-themeisle-blocks-tabs-item__content' );
				const headerMobile = i.querySelector( ':scope > .wp-block-themeisle-blocks-tabs-item__header' );

				content.classList.toggle( 'active', idx === index );
				content.classList.toggle( 'hidden', idx !== index );

				headerMobile.classList.toggle( 'active', idx === index );
				headerMobile.classList.toggle( 'hidden', idx !== index );

				const headerItems = Array.from( header.childNodes );

				headerItems.forEach( ( h, idx ) => {
					h.classList.toggle( 'active', idx === index );
					h.classList.toggle( 'hidden', idx !== index );
				});
			};

			headerItem.addEventListener( 'click', () => items.forEach( toggleTabs ) );
			headerItem.addEventListener( 'keyup', event => {
				if ( 'Enter' === event.code ) {
					event.preventDefault();
					items.forEach( toggleTabs );
				}
			});

			headerMobile.addEventListener( 'click', () => items.forEach( toggleTabs ) );
			headerMobile.addEventListener( 'keyup', event => {
				if ( 'Enter' === event.code ) {
					event.preventDefault();
					items.forEach( toggleTabs );
				}
			});

			header.appendChild( headerItem );
		});
	});
});
