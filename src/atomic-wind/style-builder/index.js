/**
 * Persist the compiled atomic-wind CSS to post meta.
 */
function signalDone() {
	document.dispatchEvent( new CustomEvent( 'atomic-wind:css-saved' ) );
}

document.addEventListener( 'atomic-wind:css-ready', () => {
	const styleTag = document.getElementById( 'atomic-wind-tailwind' );
	const css = styleTag ? styleTag.textContent : '';

	if ( ! css || ! window.atomicWindStyleBuilder ) {
		signalDone();
		return;
	}

	fetch( `${ window.atomicWindStyleBuilder.restUrl }/style`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-WP-Nonce': window.atomicWindStyleBuilder.nonce,
		},
		body: JSON.stringify( {
			css,
			postId: parseInt( window.atomicWindStyleBuilder.postId, 10 ),
		} ),
	} ).catch( () => {} ).finally( signalDone );
} );
