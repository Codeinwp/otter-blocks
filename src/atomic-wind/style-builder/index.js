document.addEventListener( 'atomic-wind:css-ready', () => {
	const styleTag = document.getElementById( 'atomic-wind-tailwind' );
	if ( ! styleTag ) {
		return;
	}

	const css = styleTag.textContent;
	if ( ! css || ! window.atomicWindStyleBuilder ) {
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
	} ).catch( () => {} );
} );
