/**
 * Warm the atomic-wind CSS cache after a successful editor save.
 */
import { select, subscribe } from '@wordpress/data';

const IFRAME_ID = 'atomic-wind-css-warm-frame';

// Safety net: drop the iframe even if the in-iframe "done" message never
// arrives (e.g. the generator errored before persisting).
const DONE_TIMEOUT = 20000;

function removeFrame() {
	const existing = document.getElementById( IFRAME_ID );
	if ( existing?.parentNode ) {
		existing.parentNode.removeChild( existing );
	}
}

function warm() {
	const config = window.atomicWindEditor;
	const editor = select( 'core/editor' );

	if ( ! config?.warmUrl || ! config?.warmNonce || ! editor ) {
		return;
	}

	const postId = editor.getCurrentPostId();
	const content = editor.getEditedPostContent();
	if ( ! postId || ! content || ! content.includes( 'wp:atomic-wind/' ) ) {
		return;
	}

	let url;
	try {
		url = new URL( config.warmUrl );
	} catch {
		return;
	}
	url.searchParams.set( 'atomic_wind_css_warm', config.warmNonce );
	url.searchParams.set( 'post_id', String( postId ) );
	// Cache-bust so each save re-renders the latest content.
	url.searchParams.set( 'v', String( Date.now() ) );

	// Only one warm pass in flight at a time.
	removeFrame();

	const frame = document.createElement( 'iframe' );
	frame.id = IFRAME_ID;
	frame.setAttribute( 'aria-hidden', 'true' );
	frame.tabIndex = -1;
	frame.style.cssText =
		'position:fixed;left:-9999px;top:0;width:1024px;height:768px;border:0;opacity:0;pointer-events:none;';

	const { origin } = url;
	// Held in an object so cleanup() can clear it without a reassigned binding.
	const handle = { timer: 0 };

	const cleanup = () => {
		window.removeEventListener( 'message', onMessage );
		clearTimeout( handle.timer );
		removeFrame();
	};

	const onMessage = ( event ) => {
		if ( event.origin !== origin || event.source !== frame.contentWindow ) {
			return;
		}
		if (
			event.data?.type === 'atomic-wind:css-warmed' &&
			Number( event.data.postId ) === Number( postId )
		) {
			cleanup();
		}
	};

	window.addEventListener( 'message', onMessage );
	handle.timer = setTimeout( cleanup, DONE_TIMEOUT );

	frame.src = url.toString();
	document.body.appendChild( frame );
}

let wasSaving = false;

subscribe( () => {
	const editor = select( 'core/editor' );
	if ( ! editor ) {
		return;
	}

	const isSaving = editor.isSavingPost() && ! editor.isAutosavingPost();

	// Edge: a real save just transitioned from in-flight to finished.
	if ( wasSaving && ! isSaving && ! editor.didPostSaveRequestFail() ) {
		warm();
	}

	wasSaving = isSaving;
} );
