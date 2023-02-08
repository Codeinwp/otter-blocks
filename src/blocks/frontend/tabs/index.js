/**
 * Internal dependencies
 */
import { domReady } from '../../helpers/frontend-helper-functions.js';

domReady( () => {
	const tabs = document.querySelectorAll( '.wp-block-themeisle-blocks-tabs' );

	tabs.forEach( tab => {
		const items = Array.from( tab.querySelectorAll( ':scope > .wp-block-themeisle-blocks-tabs__content > .wp-block-themeisle-blocks-tabs-item' ) );
		const header = document.createElement( 'div' );
		header.classList.add( 'wp-block-themeisle-blocks-tabs__header' );
		tab.prepend( header );

		let openedTab = false;
		const closedTabs = [];

		items.forEach( ( item, index ) => {
			const content = item.querySelector( ':scope > .wp-block-themeisle-blocks-tabs-item__content' );
			content.setAttribute( 'role', 'tabpanel' );

			const headerMobile = item.querySelector( ':scope > .wp-block-themeisle-blocks-tabs-item__header' );
			headerMobile.setAttribute( 'role', 'tab' );

			const headerItem = document.createElement( 'div' );
			headerItem.classList.add( 'wp-block-themeisle-blocks-tabs__header_item' );
			headerItem.tabIndex = 0;

			const tabTitle = headerMobile.cloneNode( true );
			tabTitle.classList.remove( 'wp-block-themeisle-blocks-tabs-item__header' );
			headerItem.appendChild( tabTitle );

			if ( 'true' === item.dataset.defaultOpen && ! openedTab ) {
				headerItem.classList.add( 'active' );
				content.classList.add( 'active' );
				openedTab = true;
			} else {
				closedTabs.push({ headerItem, content, headerMobile });
			}

			const toggleTabs = ( i, idx ) => {
				const content = i.querySelector( ':scope > .wp-block-themeisle-blocks-tabs-item__content' );
				const headerMobile = i.querySelector( ':scope > .wp-block-themeisle-blocks-tabs-item__header' );

				content.classList.toggle( 'active', idx === index );
				content.classList.toggle( 'hidden', idx !== index );

				headerMobile.classList.toggle( 'active', idx === index );
				headerMobile.classList.toggle( 'hidden', idx !== index );
				headerMobile.setAttribute( 'aria-selected', idx === index );

				const headerItems = Array.from( header.childNodes );

				headerItems.forEach( ( h, idx ) => {
					h.classList.toggle( 'active', idx === index );
					h.classList.toggle( 'hidden', idx !== index );
					h.setAttribute( 'aria-selected', idx === index );
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

		/**
		 * If no tab is set to open, open the first closed tab.
		 */
		if ( ! openedTab ) {
			closedTabs?.[0]?.headerItem.classList.add( 'active' );
			closedTabs?.[0]?.content.classList.add( 'active' );
			closedTabs?.[0]?.headerMobile.classList.add( 'active' );
		}
	});
});
