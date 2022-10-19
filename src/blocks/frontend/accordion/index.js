/**
 * Internal dependencies
 */
import { domReady } from '../../helpers/frontend-helper-functions.js';

domReady( () => {
	const accordions = document.querySelectorAll( '.wp-block-themeisle-blocks-accordion' );

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
			});
		});
	};

	const addFAQSchema = accordion => {
		if ( ! accordion.dataset.hasSchema ) {
			return;
		}

		const mainEntity = [];
		const items = Array.from( accordion.children );

		// build the JSON object for structured data
		items.forEach( item => {
			const question = item.querySelectorAll( '.wp-block-themeisle-blocks-accordion-item__title' )[0].innerText;
			const textElements = item.querySelectorAll( '.wp-block-themeisle-blocks-accordion-item__content' )[0].querySelectorAll( 'p, h1, h2, h3, h4, h5, h6' );
			const answer = Array.from( textElements ).reduce( ( acc, elem ) => `${acc} ${elem.innerHTML}`, '' );

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
		script.textContent = JSON.stringify( structuredData );
		document.head.appendChild( script );
	};

	accordions.forEach( accordion => {
		handleItemOpening( accordion );
		addFAQSchema( accordion );
	});
});
