/**
 * Wordpress dependencies
 */

// @ts-ignore
import { debounce } from 'lodash';

/**
 * Internal dependencies
 */
import { domReady } from '../../helpers/frontend-helper-functions.js';

type ResultsEntry = {
	link: string,
	title: string
}

type ResultsContainer = Element | null | undefined;

domReady( () => {
	const CONTAINER_CLASS = 'search-results';

	// @ts-ignore
	const { nonce, restUrl, strings } = liveSearchData;
	const liveSearch = document.querySelectorAll( '.o-live-search' );
	const loadingIcon = '<svg class="spinner" viewBox="0 0 100 100" width="16" height="16" xmlns="http://www.w3.org/2000/svg" focusable="false" style="width: calc(16px); height: calc(16px);"><circle cx="50" cy="50" r="50" vector-effect="non-scaling-stroke" class="main-circle"></circle><path d="m 50 0 a 50 50 0 0 1 50 50" vector-effect="non-scaling-stroke" class="moving-circle"></path></svg>';

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

		// Create this variable to cache the results
		let resultsContainer: ResultsContainer;

		inputElement?.setAttribute( 'autocomplete', 'off' );

		const debouncedRequest = debounce( ( searchValue: string ) => {
			addLoadingIcon( resultsContainer );
			requestData( searchValue ).then( r => {
				removeLoadingIcon( block );

				if ( ! r.success ) {
					console.error( r.message );
					return;
				}

				const { results } = r;
				updateResults( searchValue, block, results );
			});
		}, 300 );

		// Fires when the input value is changed
		inputElement?.addEventListener( 'input', ( event: Event ) => {
			const searchValue = ( event.target as HTMLInputElement )?.value;

			if ( 0 === searchValue.length ) {
				resultsContainer =  removeResultsContainer( block, resultsContainer, false );
				return;
			}

			if ( ! block?.querySelector( `.${CONTAINER_CLASS}` ) ) {
				resultsContainer = createResultsContainer( resultsContainer, block, inputElement as HTMLElement );
			}

			debouncedRequest( searchValue );
		});

		// Open the results container when the input is focused
		inputElement?.addEventListener( 'focusin', () => {
			if ( 0 !== ( inputElement as HTMLInputElement ).value.length ) {
				resultsContainer = createResultsContainer( resultsContainer, block, inputElement as HTMLElement );
			}
		});

		// Detect clicks outside the search block and close the results container
		window.addEventListener( 'click', ( event: MouseEvent ) => {
			if ( null === ( event?.target as Element )?.closest( '.wp-block-search__inside-wrapper' ) ) {

				// if the click was outside .wp-block-search__inside-wrapper
				resultsContainer = removeResultsContainer( block, resultsContainer );
			}
		});
	};

	liveSearch.forEach( handleLiveSearch );

	const createResultsContainer = ( resultsContainer: ResultsContainer, block: Element | null, inputElement: HTMLElement ) => {
		if ( resultsContainer && ! block?.querySelector( '.search_results' ) ) {
			block?.appendChild( resultsContainer );
			return resultsContainer ;
		}

		const { height, fontSize } = getComputedStyle( inputElement );
		const parentStyle = inputElement.parentElement ? getComputedStyle( inputElement.parentElement ) : null;

		const container = document.createElement( 'div' );

		container.classList.add( CONTAINER_CLASS );
		container.style.width = inputElement.offsetWidth + 'px';
		container.style.top = `calc( ${height} + ${parentStyle?.paddingTop} + ${parentStyle?.paddingBottom} + ${parentStyle?.borderBottomWidth} )`;
		container.style.fontSize = `calc( ${fontSize} - 4px )`;

		addLoadingIcon( container );
		block?.appendChild( container );

		return container;
	};

	const removeResultsContainer = ( block: Element | null, resultsContainer: ResultsContainer, cache = true ) => {
		const tmpResultsContainer = block?.querySelector( `.${CONTAINER_CLASS}` );
		if ( ! tmpResultsContainer ) {
			return;
		}

		if ( cache ) {
			return block?.removeChild( tmpResultsContainer as Node ) as ResultsContainer;
		}

		block?.removeChild( tmpResultsContainer as Node );
		return null;
	};

	const updateResults = ( searchValue: string, block: Element | null, results: Array<ResultsEntry> ) => {
		const container = block?.querySelector( `.${CONTAINER_CLASS}` );
		if ( ! container ) {
			return;
		}

		// Delete previous content
		container.innerHTML = '';

		if ( 0 === results.length ) {
			const option = document.createElement( 'div' );

			option.classList.add( `${CONTAINER_CLASS}__row`, 'no-results' );
			option.innerHTML = strings.noResults + ` "<b>${ searchValue }</b>"`;

			container?.appendChild( option );
			return;
		}

		results.forEach( ({ link, title }) => {
			const option = document.createElement( 'div' );
			option.classList.add( `${CONTAINER_CLASS}__row` );

			const optionLink = document.createElement( 'a' );
			optionLink.href = link;
			optionLink.innerText = title;

			option.appendChild( optionLink );
			container?.appendChild( option );
		});
	};

	const addLoadingIcon = ( container: ResultsContainer ) => {
		if ( ! container || container.querySelector( '.spinner-container' ) ) {
			return;
		}

		const loading = document.createElement( 'div' );
		loading.classList.add( 'spinner-container', 'search-results__row' );
		loading.innerHTML = loadingIcon;

		container.innerHTML = '';
		container?.appendChild( loading );
	};

	const removeLoadingIcon = ( block: Element | null ) => {
		const container = block?.querySelector( `.${CONTAINER_CLASS}` );
		if ( ! container ) {
			return;
		}

		const loading = container?.querySelector( '.spinner-container' );
		loading && container.removeChild( loading as Node );
	};
});
