/**
 * Internal dependencies
 */
import { domReady, scrollIntoViewIfNeeded } from '../../helpers/frontend-helper-functions.js';

domReady( () => {
	const accordions = document.querySelectorAll( '.wp-block-themeisle-blocks-accordion' );

	/**
	 *	Handle the opening of the accordion items.
	 *
	 * @param {HTMLDetailsElement} accordion The accordion root element.
	 * @returns
	 */
	const handleItemOpening = accordion => {
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

				const title = item.querySelector( ':scope > .wp-block-themeisle-blocks-accordion-item__title' );
				scrollIntoViewIfNeeded( title );
			});
		});
	};

	/**
	 * Generate FAQPage schema for the accordion.
	 *
	 * @param {HTMLDivElement} accordion The accordion root element.
	 * @returns {void}
	 */
	const addFAQSchema = accordion => {
		if ( ! accordion.dataset.hasSchema || 'false' === accordion.dataset.hasSchema ) {
			return;
		}

		const mainEntity = [];
		const items = Array.from( accordion.children );

		// build the JSON object for structured data
		items.forEach( item => {
			const questionElem = item.querySelector( ':scope > .wp-block-themeisle-blocks-accordion-item__title > *' );
			const question = questionElem?.innerText ?? questionElem?.innerHTML?.replace( /<[^>]*>?/gm, '' );
			const textElements = item.querySelectorAll( ':scope > .wp-block-themeisle-blocks-accordion-item__content :is(p, h1, h2, h3, h4, h5, h6)' );
			const answer = Array.from( textElements ).map( elem => elem.innerHTML ).join( ' ' );

			mainEntity.push({
				'@type': 'Question',
				'name': question,
				'acceptedAnswer': {
					'@type': 'Answer',
					'text': answer
				}
			});
		});

		const structuredData = {
			'@context': 'https://schema.org',
			'@type': 'FAQPage',
			'mainEntity': mainEntity
		};

		// add the structured data to the page
		const script = document.createElement( 'script' );
		script.setAttribute( 'type', 'application/ld+json' );
		script.setAttribute( 'data-o-acc-id', accordion.id );
		script.textContent = JSON.stringify( structuredData );
		document.head.appendChild( script );
	};

	accordions.forEach( accordion => {
		handleItemOpening( accordion );
		addFAQSchema( accordion );
	});
});
