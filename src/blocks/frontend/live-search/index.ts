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

	const { nonce, restUrl, strings } = window.liveSearchData;
	const liveSearch = document.querySelectorAll( '.o-live-search' );
	const loadingIcon = '<svg class="spinner" viewBox="0 0 100 100" width="16" height="16" xmlns="http://www.w3.org/2000/svg" focusable="false" style="width: calc(16px); height: calc(16px);"><circle cx="50" cy="50" r="50" vector-effect="non-scaling-stroke" class="main-circle"></circle><path d="m 50 0 a 50 50 0 0 1 50 50" vector-effect="non-scaling-stroke" class="moving-circle"></path></svg>';

	const requestData = async( search: string, postTypes: Array<string> ) => {
		const options = {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'x-wp-nonce': nonce
			}
		};

		const params = postTypes.reduce( ( p, type ) => p + `&post_types[]=${type}`, `s=${search}` );

		return await fetch( `${restUrl}?${params}`, options ).then( ( response ) => {
			return response.json();
		}).catch( error => {
			console.error( error.message );
			return error;
		});
	};

	const handleLiveSearch = ( element: Element ) => {
		const form = element.querySelector( 'form' );
		const block = element.querySelector( '.wp-block-search__inside-wrapper' );
		const inputElement = element.querySelector( 'input.wp-block-search__input' );

		// Create this variable to cache the results
		let resultsContainer: ResultsContainer;

		const { postTypes } = ( element as HTMLElement ).dataset;
		const postTypesArray: Array<string> = postTypes ? JSON.parse( postTypes ) : [];

		inputElement?.setAttribute( 'autocomplete', 'off' );

		const debouncedRequest = debounce( ( searchValue: string ) => {
			addLoadingIcon( resultsContainer );
			requestData( searchValue, postTypesArray ).then( r => {
				removeLoadingIcon( block );

				if ( ! r.success ) {
					console.error( r.message );
					return;
				}

				const { results } = r;
				updateResults( searchValue, block, results );
			});
		}, 300 );

		// When pressing the Enter key, the default behavior should pe prevented
		// so that the page can get redirected to the highlighted result
		form?.addEventListener( 'keypress', ( event: KeyboardEvent ) => {
			if ( 'Enter' === event.key && resultsContainer ) {
				event.preventDefault();

				const highlighted = resultsContainer.querySelector( '.highlight > a' );
				window.location = ( highlighted as HTMLAnchorElement )?.href as unknown as Location;
			}
		});

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
			const searchValue = ( inputElement as HTMLInputElement ).value;
			if ( 0 !== searchValue.length ) {
				resultsContainer = createResultsContainer( resultsContainer, block, inputElement as HTMLElement );

				if ( resultsContainer && ! resultsContainer.querySelector( '.search-results > :not(.spinner-container):not(.no-results)' ) ) {
					debouncedRequest( ( inputElement as HTMLInputElement ).value );
				}
			}
		});

		inputElement?.addEventListener( 'keydown', ( event: Event ) => {
			const keyEvent = event as KeyboardEvent;
			if ( 'ArrowDown' !== keyEvent.key && 'ArrowUp' !== keyEvent.key && 'Enter' !== keyEvent.key ) {
				return;
			}

			const highlighted = resultsContainer?.querySelector( '.highlight' );
			if ( ! highlighted ) {
				return;
			}

			if ( 'ArrowDown' === keyEvent.key && highlighted.nextElementSibling ) {
				highlighted.classList.remove( 'highlight' );
				highlighted.nextElementSibling.classList.add( 'highlight' );
				return;
			}

			if ( 'ArrowUp' === keyEvent.key && highlighted.previousElementSibling ) {
				highlighted.classList.remove( 'highlight' );
				highlighted.previousElementSibling.classList.add( 'highlight' );
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

		results.forEach( ({ link, title }, index ) => {
			const option = document.createElement( 'div' );
			const optionLink = document.createElement( 'a' );

			option.classList.add( `${CONTAINER_CLASS}__row` );
			( 0 === index ) && option.classList.add( 'highlight' );

			optionLink.href = link;
			optionLink.innerText = title;

			option.appendChild( optionLink );
			option.addEventListener( 'mouseover', () => {
				const highlighted = container.querySelector( '.highlight' );
				highlighted?.classList.remove( 'highlight' );
				option.classList.add( 'highlight' );
			});

			container?.appendChild( option );
		});
	};

	const addLoadingIcon = ( container: ResultsContainer ) => {
		if ( ! container || container.querySelector( '.spinner-container' ) ) {
			return;
		}

		const loading = document.createElement( 'div' );
		loading.classList.add( `${CONTAINER_CLASS}__row`, 'spinner-container' );
		loading.innerHTML = loadingIcon;

		container.innerHTML = '';
		container?.appendChild( loading );
	};

	const removeLoadingIcon = ( block: Element | null ) => {
		const container = block?.querySelector( `.${CONTAINER_CLASS}` );
		if ( ! container ) {
			return;
		}

		const loading = container.querySelector( '.spinner-container' );
		if ( loading ) {
			container.removeChild( loading as Node );
		}
	};
});
