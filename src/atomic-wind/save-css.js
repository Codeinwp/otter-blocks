import { subscribe, select } from '@wordpress/data';

let wasSaving = false;

subscribe( () => {
	const isSaving = select( 'core/editor' ).isSavingPost();
	const isAutoSave = select( 'core/editor' ).isAutosavingPost();

	if ( wasSaving && ! isSaving && ! isAutoSave ) {
		saveCss();
	}

	wasSaving = isSaving;
} );

function saveCss() {
	const styleTag = document.getElementById( 'atomic-wind-tailwind' );
	if ( ! styleTag ) {
		return;
	}

	const css = styleTag.textContent;
	if ( ! css ) {
		return;
	}

	const postId = select( 'core/editor' ).getCurrentPostId();
	if ( ! postId || ! window.atomicWindEditor ) {
		return;
	}

	fetch( `${ window.atomicWindEditor.restUrl }/style`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-WP-Nonce': window.atomicWindEditor.nonce,
		},
		body: JSON.stringify( { css, postId } ),
	} ).catch( () => {} );
}
