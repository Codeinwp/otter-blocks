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

const getPostIcon = ( type: string ) => {
	switch ( type ) {
	case 'post': return post();
	case 'page': return page();
	case 'product': return product();
	default: return generic();
	}
};

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

		const response = await fetch( `${restUrl}?${params}`, options ).catch( error => {
			console.error( error.message );
			return error;
		});

		return response.json();
	};

	const handleLiveSearch = ( element: Element ) => {
		const inputElement = element.querySelector( 'input.wp-block-search__input' ) as HTMLInputElement;
		if ( ! inputElement ) {
			return;
		}

		const form = element.querySelector( 'form' );
		const block = element.querySelector( '.wp-block-search__inside-wrapper' );

		const inputStyle = getComputedStyle( inputElement );
		const parentStyle = inputElement.parentElement ? getComputedStyle( inputElement.parentElement ) : null;

		inputElement.value = '';

		const wrap = document.createElement( 'div' );
		wrap.classList.add( 'container-wrap' );
		wrap.style.width = inputElement.offsetWidth + 'px';
		wrap.style.borderRadius = inputStyle.borderRadius;
		wrap.style.backgroundColor = inputStyle.backgroundColor;

		const inputEndPageDistance = document.documentElement.scrollHeight - ( inputElement.getBoundingClientRect().bottom + window.scrollY );
		let inputEdgeDistance = inputEndPageDistance;

		if ( 300 > inputEndPageDistance ) {
			wrap.style.top = `calc( ${inputStyle.height} + ${parentStyle?.paddingTop} + ${parentStyle?.paddingBottom} + ${parentStyle?.borderBottomWidth} )`;
		} else {
			wrap.style.bottom = `calc( ${inputStyle.height} + ${parentStyle?.paddingTop} + ${parentStyle?.paddingBottom} + ${parentStyle?.borderBottomWidth} )`;
			inputEdgeDistance = inputElement.getBoundingClientRect().top + window.scrollY;
		}

		wrap.style.maxHeight = Math.min( 500, inputEdgeDistance - 20 ) + 'px';

		// Create this variable to cache the results
		let resultsContainer: ResultsContainer;

		const { postTypes } = ( element as HTMLElement ).dataset;
		const postTypesArray: Array<string> = postTypes ? JSON.parse( postTypes ) : [];

		inputElement.setAttribute( 'autocomplete', 'off' );

		const debouncedRequest = debounce( ( searchValue: string ) => {
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

			debouncedRequest( searchValue );
		});

		// Open the results container when the input is focused
		inputElement.addEventListener( 'focusin', () => {
			const searchValue = ( inputElement as HTMLInputElement ).value;
			if ( 0 !== searchValue.length ) {
				resultsContainer = createResultsContainer( wrap, resultsContainer, block, inputStyle );

				if ( resultsContainer && ! resultsContainer.querySelector( '.search-results > :not(.spinner-container):not(.no-results)' ) ) {
					debouncedRequest( ( inputElement as HTMLInputElement ).value );
				}
			}
		});

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

	liveSearch.forEach( handleLiveSearch );

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

	const highlight = ( element: HTMLElement, input: Element ) => {

		// Determine the background color for a light/dark theme
		const inputBackground = getComputedStyle( input ).backgroundColor;
		const [ ,, lightness ] = rgb2hsl( inputBackground );
		const isDark = 50 >= lightness;

		element.classList.add( 'highlight' );
		element.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(49, 50, 51, 0.12)';
	};

	const removeHighlight = ( element: Element ) => {
		element.classList.remove( 'highlight' );
		element.removeAttribute( 'style' );
	};

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
