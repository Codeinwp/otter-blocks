/**
 * Persist the compiled atomic-wind CSS to post meta, and as the combined
 * stylesheet when the page mixes several cached ones.
 */
function signalDone() {
	document.dispatchEvent( new CustomEvent( 'atomic-wind:css-saved' ) );
}

/**
 * @param {string}                  route REST route under the atomic-wind namespace.
 * @param {Record<string, unknown>} body  Request body.
 * @return {Promise<Response|void>} Settled request.
 */
function save( route, body ) {
	return fetch( `${ window.atomicWindStyleBuilder.restUrl }/${ route }`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-WP-Nonce': window.atomicWindStyleBuilder.nonce,
		},
		body: JSON.stringify( body ),
	} ).catch( () => {} );
}

document.addEventListener( 'atomic-wind:css-ready', () => {
	const styleTag = document.getElementById( 'atomic-wind-tailwind' );
	const css = styleTag ? styleTag.textContent : '';

	if ( ! css || ! window.atomicWindStyleBuilder ) {
		signalDone();
		return;
	}

	const postId = parseInt( window.atomicWindStyleBuilder.postId, 10 );
	const saves = [];

	if ( postId ) {
		saves.push( save( 'style', { css, postId } ) );
	}

	if ( window.atomicWindCombinedStyle ) {
		const { postIds, tokensHash, signature } = window.atomicWindCombinedStyle;
		saves.push( save( 'combined-style', { css, postIds, tokensHash, signature } ) );
	}

	Promise.all( saves ).finally( signalDone );
} );
