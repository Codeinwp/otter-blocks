/**
 * Internal dependencies
 */
import { domReady, scrollIntoViewIfNeeded } from '../../helpers/frontend-helper-functions.js';

domReady( () => {
	const tabs = document.querySelectorAll( '.wp-block-themeisle-blocks-tabs' );
	const hash = window.location.hash.substring(1);

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

			if ( item?.id ) {
				headerItem.setAttribute( 'for', item.id );
			}

			if ( 'true' === item.dataset.defaultOpen && ! openedTab ) {
				headerItem.classList.add( 'active' );
				content.classList.add( 'active' );
				headerMobile.classList.add( 'active' );
				openedTab = true;
			} else {
				closedTabs.push({ headerItem, content, headerMobile });
			}

			const toggleTabs = ( tabItem, tabIndex ) => {
				const tabContent = tabItem.querySelector( ':scope > .wp-block-themeisle-blocks-tabs-item__content' );
				const tabHeaderMobile = tabItem.querySelector( ':scope > .wp-block-themeisle-blocks-tabs-item__header' );

				tabContent.classList.toggle( 'active', tabIndex === index );
				tabContent.classList.toggle( 'hidden', tabIndex !== index );

				tabHeaderMobile.classList.toggle( 'active', tabIndex === index );
				tabHeaderMobile.setAttribute( 'aria-selected', tabIndex === index );

				const headerItems = Array.from( header.childNodes );

				headerItems.forEach( ( headerElement, headerIndex ) => {
					headerElement.classList.toggle( 'active', headerIndex === index );
					headerElement.classList.toggle( 'hidden', headerIndex !== index );
					headerElement.setAttribute( 'aria-selected', headerIndex === index );
				});

				if ( tabIndex === index && tabHeaderMobile ) {
					scrollIntoViewIfNeeded( tabHeaderMobile );
				}
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


			if ( hash ) {
				const targetTab = item.id === hash;

				if ( targetTab ) {
					toggleTabs( item, index );
					openedTab = true;
					scrollIntoViewIfNeeded( headerItem );
				}
			}
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
