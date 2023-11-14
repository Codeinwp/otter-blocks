/**
 * Internal dependencies
 */
import { domReady, rgb2hsl, debounce } from '../../helpers/frontend-helper-functions.js';
import { page, post, product, generic } from './icons';

type ResultsEntry = {
	id: number,
	link: string,
	title: string,
	type: string,
	date: string,
	author: string,
	parent?: string,
	price?: string
}

type ResultsContainer = Element | null | undefined;

/**
 * Returns an icon component based on the post type.
 * @param type - The post type.
 * @returns The icon component.
 */
const getPostIcon = ( type: string ) => {
	switch ( type ) {
	case 'post': return post();
	case 'page': return page();
	case 'product': return product();
	default: return generic();
	}
};

/**
 * Returns a div element containing meta information for a given ResultsEntry object.
 * @param entry - The ResultsEntry object to generate meta information for.
 * @returns A div element containing the meta information.
 */
const getMeta = ( entry: ResultsEntry ) => {
	const meta = document.createElement( 'div' );

	switch ( entry.type ) {
	case 'post': {
		meta.innerHTML = `${entry.date} / by ${entry.author}${ entry.parent ? ' / ' + entry.parent : '' }`;
		break;
	}
	case 'page': {
		meta.innerHTML = entry.parent ?? '';
		break;
	}
	case 'product': {
		meta.innerHTML = entry.price ?? '';
		break;
	}
	default: return null;
	}

	meta.classList.add( 'meta' );
	return meta;
};

domReady( () => {
	const CONTAINER_CLASS = 'search-results';

	const { nonce, restUrl, strings } = window.liveSearchData;
	const liveSearch = document.querySelectorAll( '.o-live-search' );
	const loadingIcon = '<svg class="spinner" viewBox="0 0 100 100" width="16" height="16" xmlns="http://www.w3.org/2000/svg" focusable="false" style="width: calc(16px); height: calc(16px);"><circle cx="50" cy="50" r="50" vector-effect="non-scaling-stroke" class="main-circle"></circle><path d="m 50 0 a 50 50 0 0 1 50 50" vector-effect="non-scaling-stroke" class="moving-circle"></path></svg>';

	/**
	 * Get the post search from our endpoint.
	 *
	 * @param search - The search query string.
	 * @param postTypes - An array of post types to search in.
	 * @returns A Promise that resolves to the JSON response from the REST API.
	 */
	const requestData = async( search: string, postTypes: Array<string> ) => {
		const options = {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'x-wp-nonce': nonce
			}
		};

		const params = postTypes.reduce( ( p, type ) => p + `&post_type[]=${type}`, `s=${search}` );

		// use '&' for plain permalinks
		const symbol = 0 < window.liveSearchData.permalinkStructure.length ? '?' : '&';
		const response = await fetch( `${restUrl}${symbol}${params}`, options ).catch( error => {
			console.error( error.message );
			return error;
		});

		return response.json();
	};

	const initializeLiveSearch = ( element: Element ) => {
		const inputElement = element.querySelector( 'input.wp-block-search__input' ) as HTMLInputElement;
		if ( ! inputElement ) {
			return;
		}

		inputElement.value = '';
		inputElement.setAttribute( 'autocomplete', 'off' );

		const form = element.querySelector( 'form' );
		const block = element.querySelector( '.wp-block-search__inside-wrapper' );

		// Create this variable to cache the results
		let resultsContainer: ResultsContainer;

		const { postTypes } = ( element as HTMLElement ).dataset;
		const postTypesArray: Array<string> = postTypes ? JSON.parse( postTypes ) : [];

		const inputStyle = getComputedStyle( inputElement );
		const parentStyle = inputElement.parentElement ? getComputedStyle( inputElement.parentElement ) : null;

		/**
		 * Create result search area.
		 */
		const wrap = document.createElement( 'div' );
		wrap.classList.add( 'container-wrap' );
		wrap.style.width = inputElement.offsetWidth + 'px';
		wrap.style.borderRadius = inputStyle.borderRadius;
		wrap.style.backgroundColor = inputStyle.backgroundColor;

		const inputEndPageDistance = document.documentElement.scrollHeight - ( inputElement.getBoundingClientRect().bottom + window.scrollY );
		let inputEdgeDistance = inputEndPageDistance;

		if ( 300 < inputEndPageDistance ) {
			wrap.style.top = `calc( ${inputStyle.height} + ${parentStyle?.paddingTop} + ${parentStyle?.paddingBottom} + ${parentStyle?.borderBottomWidth} )`;
		} else {
			wrap.style.bottom = `calc( ${inputStyle.height} + ${parentStyle?.paddingTop} + ${parentStyle?.paddingBottom} + ${parentStyle?.borderBottomWidth} )`;
			inputEdgeDistance = inputElement.getBoundingClientRect().top + window.scrollY;
		}

		wrap.style.maxHeight = Math.min( 500, inputEdgeDistance - 20 ) + 'px';

		/**
		 * Request data from the server. Debounce the request to avoid flooding the server.
		 */
		const debouncedSearchRequest = debounce( ( searchValue: string ) => {
			addLoadingIcon( resultsContainer );
			requestData( searchValue, postTypesArray ).then( r => {
				removeLoadingIcon( block );

				if ( ! r.success ) {
					console.error( r.message );
					resultsContainer = removeResultsContainer( block, resultsContainer, false );
					return;
				}

				const { results } = r;
				updateResults( searchValue, block, results, inputElement );
			});
		}, 300 );

		// When pressing the Enter key, the default behavior should pe prevented
		// so that the page can get redirected to the highlighted result
		form?.addEventListener( 'keypress', ( event: KeyboardEvent ) => {
			if ( 'Enter' === event.key && resultsContainer ) {
				const highlighted = resultsContainer.querySelector( '.highlight > a' );
				if ( ! highlighted ) {
					return;
				}

				event.preventDefault();
				window.location = ( highlighted as HTMLAnchorElement )?.href as unknown as Location;
			}
		});

		// Fires when the input value is changed
		inputElement.addEventListener( 'input', ( event: Event ) => {
			const searchValue = ( event.target as HTMLInputElement )?.value;

			if ( 0 === searchValue.length ) {
				resultsContainer = removeResultsContainer( block, resultsContainer, false );
				return;
			}

			if ( ! block?.querySelector( '.container-wrap' ) ) {
				resultsContainer = createResultsContainer( wrap, resultsContainer, block, inputStyle );
			}

			debouncedSearchRequest( searchValue );
		});

		// Open the results container when the input is focused
		inputElement.addEventListener( 'focusin', () => {
			const searchValue = ( inputElement as HTMLInputElement ).value;
			if ( 0 !== searchValue.length ) {
				resultsContainer = createResultsContainer( wrap, resultsContainer, block, inputStyle );

				if ( resultsContainer && ! resultsContainer.querySelector( '.search-results > :not(.spinner-container):not(.no-results)' ) ) {
					debouncedSearchRequest( ( inputElement as HTMLInputElement ).value );
				}
			}
		});

		// Navigate through the results with the arrow keys.
		inputElement.addEventListener( 'keydown', ( event: Event ) => {
			if ( ! resultsContainer || ! resultsContainer.parentElement ) {
				return;
			}

			const keyEvent = event as KeyboardEvent;
			const containerDimensions = resultsContainer.parentElement.getBoundingClientRect();
			const keys = [ 'ArrowDown', 'ArrowUp', 'Escape' ];

			if ( ! keys.includes( keyEvent.key ) ) {
				return;
			}

			if ( 'Escape' === keyEvent.key ) {
				inputElement.blur();
				resultsContainer = removeResultsContainer( block, resultsContainer );
				return;
			}

			const highlighted = resultsContainer?.querySelector( '.highlight' );
			if ( ! highlighted ) {
				highlight( resultsContainer.children[0] as HTMLElement, inputElement );
				return;
			}

			if ( 'ArrowDown' === keyEvent.key && highlighted.nextElementSibling ) {
				removeHighlight( highlighted );
				highlight( highlighted.nextElementSibling as HTMLElement, inputElement );

				const dimensions = highlighted.nextElementSibling.getBoundingClientRect();
				if ( dimensions.bottom > containerDimensions.bottom ) {
					resultsContainer.parentElement.scrollBy( 0, dimensions.height );
				}

				return;
			}

			if ( 'ArrowUp' === keyEvent.key && highlighted.previousElementSibling ) {
				removeHighlight( highlighted );
				highlight( highlighted.previousElementSibling as HTMLElement, inputElement );

				const dimensions = highlighted.previousElementSibling.getBoundingClientRect();
				if ( dimensions.top < containerDimensions.top ) {
					resultsContainer.parentElement.scrollBy( 0, -dimensions.height );
				}
			}
		});

		// Detect clicks outside the search block and close the results container
		window.addEventListener( 'click', ( event: MouseEvent ) => {
			if ( null === ( event?.target as Element )?.closest( `#${inputElement.id}` ) ) {

				// if the click was outside .wp-block-search__inside-wrapper
				resultsContainer = removeResultsContainer( block, resultsContainer );
			}
		});
	};

	// Initialize the live search for each block on the page when it becomes visible.
	let observer = new IntersectionObserver( ( entries, observer ) => {
		entries.forEach( entry => {
			if ( entry.isIntersecting ) {
				initializeLiveSearch( entry.target );
				observer.unobserve( entry.target );
			}
		});
	});

	liveSearch.forEach( element => observer.observe( element ) );

	/**
	 * Creates a container for search results and appends it to the provided wrap element.
	 * If a resultsContainer is provided and a search_results element is not found in the block, the resultsContainer is appended to the wrap element.
	 * Otherwise, a new container is created and appended to the wrap element.
	 * @param wrap - The element to which the results container will be appended.
	 * @param resultsContainer - The pre-existing results container to be appended to the wrap element if a search_results element is not found in the block.
	 * @param block - The block element to which the wrap element will be appended.
	 * @param inputStyle - The CSSStyleDeclaration object containing the style properties of the input element.
	 * @returns The created results container.
	 */
	const createResultsContainer = ( wrap: Element, resultsContainer: ResultsContainer, block: Element | null, inputStyle: CSSStyleDeclaration ) => {
		wrap.innerHTML = '';

		if ( resultsContainer && ! block?.querySelector( '.search_results' ) ) {
			wrap.appendChild( resultsContainer );
			block?.appendChild( wrap );
			return resultsContainer ;
		}

		const container = document.createElement( 'div' );
		container.classList.add( CONTAINER_CLASS );
		container.setAttribute( 'role', 'list' );

		container.style.fontSize = `max( calc( ${inputStyle.fontSize} - 4px ), 14px )`;
		container.style.color = inputStyle.color;

		addLoadingIcon( container );
		wrap.appendChild( container );

		block?.appendChild( wrap );

		return container;
	};

	/**
	 * Removes the results container from the given block element.
	 *
	 * @param block - The block element to remove the results container from.
	 * @param resultsContainer - The results container to remove.
	 * @param cache - Whether to cache the removed container for later use.
	 * @returns The removed container if `cache` is `true`, otherwise `null`.
	 */
	const removeResultsContainer = ( block: Element | null, resultsContainer: ResultsContainer, cache = true ) => {
		const tmpResultsContainer = block?.querySelector( '.container-wrap' );
		if ( ! tmpResultsContainer ) {
			return;
		}

		if ( cache ) {
			const wrap = block?.removeChild( tmpResultsContainer as Node ) as ResultsContainer;
			return wrap?.querySelector( `.${CONTAINER_CLASS}` );
		}

		block?.removeChild( tmpResultsContainer as Node );
		return null;
	};

	/**
	 * Updates the search results in the specified block with the given search value and results.
	 *
	 * @param searchValue - The search value to use for filtering the results.
	 * @param block - The block element to update the results in.
	 * @param results - The array of results to display.
	 * @param inputElement - The input element used for the search.
	 */
	const updateResults = ( searchValue: string, block: Element | null, results: Array<ResultsEntry>, inputElement: Element ) => {
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

		results.forEach( ( result, index ) => {
			const option = getResultElement( result, index, inputElement );

			option.addEventListener( 'mouseover', () => {
				const highlighted = container.querySelector( '.highlight' );
				if ( highlighted ) {
					removeHighlight( highlighted );
				}

				highlight( option, inputElement );
			});

			container?.appendChild( option );
		});
	};

	/**
	 * Adds a loading icon to the specified results container.
	 *
	 * @param container - The container to add the loading icon to.
	 */
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

	/**
	 * Removes the loading icon from the specified block element.
	 *
	 * @param block - The block element to remove the loading icon from.
	 */
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

	/**
	 * Highlights the given element with a background color based on the input element's background color.
	 * @param element - The element to highlight.
	 * @param input - The input element to get the background color from.
	 */
	const highlight = ( element: HTMLElement, input: Element ) => {

		// Determine the background color for a light/dark theme
		const inputBackground = getComputedStyle( input ).backgroundColor;
		const [ ,, lightness ] = rgb2hsl( inputBackground );
		const isDark = 50 >= lightness;

		element.classList.add( 'highlight' );
		element.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(49, 50, 51, 0.12)';
	};

	/**
	 * Removes the 'highlight' class and 'style' attribute from the given element.
	 * @param element - The element to remove the 'highlight' class and 'style' attribute from.
	 */
	const removeHighlight = ( element: Element ) => {
		element.classList.remove( 'highlight' );
		element.removeAttribute( 'style' );
	};

	/**
	 * Returns a DOM element representing a search result.
	 * @param entry - The search result entry.
	 * @param index - The index of the search result.
	 * @param inputElement - The input element used for the search.
	 * @returns A DOM element representing the search result.
	 */
	const getResultElement = ( entry: ResultsEntry, index: number, inputElement: Element ) => {
		const optionWrap = document.createElement( 'div' );
		const option = document.createElement( 'a' );

		optionWrap.classList.add( `${CONTAINER_CLASS}__row`,  `is-type-${ entry.type }`, `is-id-${ entry.id }` );
		optionWrap.setAttribute( 'role', 'option' );
		option.href = entry.link;

		const icon = document.createElement( 'div' );
		icon.classList.add( `${CONTAINER_CLASS}__row-left` );
		icon.innerHTML = getPostIcon( entry.type );

		const data = document.createElement( 'div' );
		data.classList.add( `${CONTAINER_CLASS}__row-right` );

		const title = document.createElement( 'p' );
		title.classList.add( 'post-title' );
		title.setAttribute( 'title', entry.title );
		title.innerText = 0 < entry.title.length ? entry.title : strings.noTitle;

		data.appendChild( title );

		const meta = getMeta( entry );
		if ( meta ) {
			const inputFontSize = getComputedStyle( inputElement ).fontSize;
			meta.style.fontSize = `max( calc( ${inputFontSize} - 6px ), 12px )`;
			data.appendChild( meta );
		}

		option.appendChild( icon );
		option.appendChild( data );

		optionWrap.appendChild( option );
		return optionWrap;
	};
});
