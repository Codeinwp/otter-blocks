/**
 * Internal dependencies
 */
import { domReady } from '../../helpers/frontend-helper-functions.js';

type ResultsEntry = {
	link: string,
	title: string
}

domReady( () => {

	// @ts-ignore
	const { nonce, restUrl, strings } = liveSearchData;
	const liveSearch = document.querySelectorAll( '.o-live-search' );

	const requestData = async( search: string ) => {
		const options = {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'x-wp-nonce': nonce
			}
		};

		return await fetch( `${restUrl}?s=${search}`, options ).then( ( response ) => {
			return response.json();
		}).catch( error => {
			console.error( error.message );
			return error;
		});
	};

	const handleLiveSearch = ( element: Element ) => {
		const block = element.querySelector( '.wp-block-search__inside-wrapper' );
		const inputElement = element.querySelector( 'input.wp-block-search__input' );

		// Create this variable so the results are kept when the input gets unfocused
		let resultsContainer: Element | null | undefined;

		inputElement?.setAttribute( 'autocomplete', 'off' );

		// Fires when the input value is changed
		inputElement?.addEventListener( 'input', ( event: Event ) => {
			const searchValue = ( event.target as HTMLInputElement )?.value;

			if ( 0 !== searchValue.length ) {
				requestData( searchValue ).then( r => {
					if ( ! r.success ) {
						console.error( r.message );
						return;
					}

					const { results } = r;
					updateResults( searchValue, block, results );
				});

				if ( ! block?.querySelector( '.search-results' ) ) {
					createResultsContainer( resultsContainer, block, inputElement as HTMLElement );
				}
			} else {
				resultsContainer = block?.querySelector( '.search-results' );
				if ( resultsContainer ) {
					block?.removeChild( resultsContainer as Node );
				}
			}
		});

		// Open the results container when the input is focused
		inputElement?.addEventListener( 'focus', ( event: Event ) => {
			if ( 0 !== ( inputElement as HTMLInputElement ).value.length ) {
				createResultsContainer( resultsContainer, block, inputElement as HTMLElement );
			}
		});

		// Remove the results container when the input is unfocused
		inputElement?.addEventListener( 'focusout', ( event: Event ) => {
			resultsContainer = block?.querySelector( '.search-results' );
			if ( resultsContainer ) {
				block?.removeChild( resultsContainer as Node );
			}
		});
	};

	const createResultsContainer = ( resultsContainer: Element | null | undefined, block: Element | null, inputElement: HTMLElement ) => {
		if ( resultsContainer ) {
			block?.appendChild( resultsContainer );
			return;
		}

		const { height, fontSize } = getComputedStyle( inputElement );
		const { paddingTop, paddingBottom, borderBottomWidth } = inputElement.parentElement ? getComputedStyle( inputElement.parentElement ) : { paddingTop: 0, paddingBottom: 0, borderBottomWidth: 0 };

		const container = document.createElement( 'div' );

		container.classList.add( 'search-results' );
		container.style.width = inputElement.offsetWidth + 'px';
		container.style.top = `calc( ${height} + ${paddingTop} + ${paddingBottom} + ${borderBottomWidth} )`;
		container.style.fontSize = `calc( ${fontSize} - 4px )`;

		block?.appendChild( container );
	};

	const updateResults = ( searchValue: string, block: Element | null, results: Array<ResultsEntry> ) => {
		const container = block?.querySelector( '.search-results' );
		if ( ! container ) {
			return;
		}

		// Delete previous results
		container.innerHTML = '';

		if ( 0 === results.length ) {
			const option = document.createElement( 'div' );

			option.classList.add( 'search-results__row', 'no-results' );
			option.innerHTML = strings.noResults + ` "<b>${ searchValue }</b>"`;

			container?.appendChild( option );
			return;
		}

		results.forEach( ({ link, title }) => {
			const option = document.createElement( 'div' );
			option.classList.add( 'search-results__row' );

			const optionLink = document.createElement( 'a' );
			optionLink.href = link;
			optionLink.innerText = title;

			option.appendChild( optionLink );
			container?.appendChild( option );
		});
	};

	liveSearch.forEach( handleLiveSearch );
});
