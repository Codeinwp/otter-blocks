/**
 * Internal dependencies
 */
import { domReady } from '../../helpers/frontend-helper-functions.js';

domReady( () => {

	// @ts-ignore
	const { nonce, restUrl } = liveSearchData;
	const liveSearch = document.querySelectorAll( '.otter-live-search' );

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

	liveSearch.forEach( element => {
		const inputElement = element.querySelector( 'input.wp-block-search__input' );

		inputElement?.addEventListener( 'input', ( event: Event ) => {
			requestData( ( event.target as HTMLInputElement )?.value ).then( r => {
				if ( ! r.success ) {
					console.error( r.message );
					return;
				}

				const { results } = r;
				console.log( results );
			});
		});
	});
});
