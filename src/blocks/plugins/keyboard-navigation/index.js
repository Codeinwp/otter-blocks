/**
 * WordPress dependencies
 */
import {
	dispatch,
	select
} from '@wordpress/data';

let isInitialized = false;
let lastHandledKeydownId = 0;
let hasIframeObserver = false;

const attachedDocuments = new WeakSet();

const attachKeydownListener = ( doc ) => {
	if ( ! doc || attachedDocuments.has( doc ) ) {
		return;
	}

	attachedDocuments.add( doc );
	doc.addEventListener( 'keydown', handleKeyDown, true );
};

const isTypingContext = ( element ) => {
	if ( ! element ) {
		return false;
	}

	const tagName = ( element.tagName || '' ).toLowerCase();
	if ( [ 'input', 'textarea', 'select' ].includes( tagName ) ) {
		return true;
	}

	if ( typeof element.closest !== 'function' ) {
		return false;
	}

	return Boolean(
		element.closest(
			[
				'input',
				'textarea',
				'select'
			].join( ',' )
		)
	);
};

const isTextSelectionActive = ( selectedClientId ) => {
	if ( ! selectedClientId ) {
		return false;
	}

	const store = select( 'core/block-editor' );

	const start = store?.getSelectionStart?.();
	const end = store?.getSelectionEnd?.();

	return Boolean(
		( start?.clientId === selectedClientId && start?.attributeKey ) ||
		( end?.clientId === selectedClientId && end?.attributeKey )
	);
};

const getSelectedThemeisleBlockClientId = () => {
	const store = select( 'core/block-editor' );

	const clientId = store?.getSelectedBlockClientId?.();
	if ( ! clientId ) {
		return null;
	}

	if ( store?.getSelectedBlockCount?.() && 1 < store.getSelectedBlockCount() ) {
		return null;
	}

	const block = store?.getBlock?.( clientId );
	if ( ! block?.name?.startsWith( 'themeisle-blocks/' ) ) {
		return null;
	}

	return clientId;
};

const getAdjacentSiblingClientId = ( clientId, direction ) => {
	const store = select( 'core/block-editor' );
	const getBlockOrder = store?.getBlockOrder;

	if ( typeof getBlockOrder !== 'function' ) {
		return null;
	}

	const rootClientId = store?.getBlockRootClientId?.( clientId );
	const order = getBlockOrder( rootClientId || undefined );

	if ( ! Array.isArray( order ) ) {
		return null;
	}

	const index = order.indexOf( clientId );
	if ( -1 === index ) {
		return null;
	}

	return order[ index + direction ] || null;
};

const handleKeyDown = ( event ) => {
	if ( event.defaultPrevented ) {
		return;
	}

	if ( event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ) {
		return;
	}

	if ( 'ArrowUp' !== event.key && 'ArrowDown' !== event.key ) {
		return;
	}

	if ( isTypingContext( event.target ) ) {
		return;
	}

	const selectedClientId = getSelectedThemeisleBlockClientId();
	if ( ! selectedClientId ) {
		return;
	}

	if ( isTextSelectionActive( selectedClientId ) ) {
		return;
	}

	const direction = 'ArrowDown' === event.key ? 1 : -1;
	const adjacentClientId = getAdjacentSiblingClientId( selectedClientId, direction );
	if ( ! adjacentClientId ) {
		return;
	}

	event.preventDefault();
	event.stopPropagation();

	// Ensure we win against any core selection logic which runs on the same key event.
	const keydownId = ++lastHandledKeydownId;
	requestAnimationFrame( () => {
		if ( keydownId !== lastHandledKeydownId ) {
			return;
		}

		dispatch( 'core/block-editor' )?.selectBlock?.( adjacentClientId );
	});
};

const init = () => {
	if ( isInitialized ) {
		return;
	}

	if ( 'undefined' === typeof document ) {
		return;
	}

	isInitialized = true;

	attachKeydownListener( document );

	// In iframe-canvas mode, the active element can live inside the editor canvas iframe,
	// so key events won't reach the parent document. Attach to the iframe document too.
	const attachToEditorCanvasIframe = () => {
		const iframe = document.querySelector( 'iframe[name="editor-canvas"]' );
		const iframeDoc = iframe?.contentDocument;

		if ( iframeDoc ) {
			attachKeydownListener( iframeDoc );
		}

		if ( iframe && ! iframe.dataset.otterKeyboardNavAttached ) {
			iframe.dataset.otterKeyboardNavAttached = '1';
			iframe.addEventListener( 'load', () => {
				attachKeydownListener( iframe.contentDocument );
			});
		}
	};

	attachToEditorCanvasIframe();

	if ( ! hasIframeObserver && 'undefined' !== typeof MutationObserver ) {
		hasIframeObserver = true;
		const observer = new MutationObserver( attachToEditorCanvasIframe );
		observer.observe( document.documentElement, { childList: true, subtree: true } );
	}
};

if ( Boolean( window.themeisleGutenberg?.isBlockEditor ) ) {
	init();
}
