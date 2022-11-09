/* global liveSearchData */
/**
 * Internal dependencies
 */
import { domReady } from '../../helpers/frontend-helper-functions.js';

domReady( () => {
	const liveSearch = document.querySelectorAll( '.otter-live-search' );

	const { nonce, restUrl } = liveSearchData;

	const requestData = async( data = {}) => {
		const options = {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			}
		};

		options.headers['x-wp-nonce'] = nonce;
		options.body = JSON.stringify( data );

		return await fetch( restUrl, options ).then( ( response ) => {
			return response.json();
		});
	};

	liveSearch.forEach( element => {
		const inputElement = element.querySelector( 'input.wp-block-search__input' );

		inputElement.addEventListener( 'keyup', event => {
			const search = event.target.value;
			requestData( restUrl ).then( r => console.log( r ) );
		});
	});
});
