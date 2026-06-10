/**
 * External dependencies.
 */
import { v4 as uuidv4 } from 'uuid';

/**
 * WordPress dependencies.
 */
import {
	isEqual,
	zip
} from 'lodash';

import {
	dispatch,
	select
} from '@wordpress/data';

import {
	parse
} from '@wordpress/blocks';

/**
 * Internal dependencies.
 */
import globalDefaultsBlocksAttrs from '../plugins/options/global-defaults/defaults.js';
import { useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { useRefEffect } from '@wordpress/compose';

/**
 * Initiate the global id tracker with an empty list if it is the case.
 */
window.themeisleGutenberg ??= {};
window.themeisleGutenberg.blockIDs ??= [];

/**
 * Utility function for creating a function that add the global defaults values to the block's attribute value.
 *
 * @param {Object}   attributes        The block's attributes provided by WordPress
 * @param {Function} setAttributes     The block's attributes update function provided by WordPress
 * @param {string}   name              The block's name provided by WordPress
 * @param {Object}   defaultAttributes The default attributes of the block.
 */
export const addGlobalDefaults = ( attributes, setAttributes, name, defaultAttributes ) => {

	// Check if the globals default are available and its values are different from the base values.
	if ( undefined !== window.themeisleGutenberg?.globalDefaults && ! isEqual( globalDefaultsBlocksAttrs[name], window.themeisleGutenberg.globalDefaults[name]) ) {
		const defaultGlobalAttrs = { ...window.themeisleGutenberg.globalDefaults[name] };

		const attrs = Object.keys( defaultGlobalAttrs )
			.filter( attr => isEqual( attributes[ attr ], defaultAttributes[ attr ]?.default ) ) // Keep only the properties with the default value.
			// Build an attribute object with the properties that are gone take the Global Defaults values.
			.reduce( ( attrs, attr ) => {
				attrs[ attr ] = defaultGlobalAttrs[ attr ];
				return attrs;
			}, {});
		setAttributes({ ...attrs });
	}
};

/**
 * Utiliy function for getting the default value of the attribute.
 *
 * @param {string} name              The block's name provided by WordPress
 * @param {string} field             Name of the value to be returned
 * @param {Object} defaultAttributes The default attributes of the block.
 */
export const getDefaultValue = ( name, field, defaultAttributes ) => {
	const blockDefaults = window.themeisleGutenberg.globalDefaults?.[name];
	const value = blockDefaults?.[field] ? blockDefaults?.[field] : defaultAttributes[field]?.default;

	return value;
};

/**
 * Utiliy function for getting the default value of the attribute by value.
 *
 * @param {Object} params                   - The parameters object.
 * @param {string} params.name              The block's name provided by WordPress
 * @param {string} params.field             Name of the value to be returned
 * @param {Object} params.defaultAttributes The default attributes of the block.
 * @param {Object} params.attributes        The attributes of the block.
 */
export const getDefaultValueByField = ({ name, field, defaultAttributes, attributes }) => {
	if ( attributes.isSynced?.includes( field ) ) {
		return getDefaultValue( name, field, defaultAttributes );
	}

	return attributes[field];
};

/**
 * An object that keep tracking of the block instances. Is used for preventing id duplication on action like: create, duplicate, copy on editor page.
 *
 * @type {Object.<string, Set.<string>>}
 */
const localIDs = {};

/**
 * Check if the ID is inside a reusable block or a Query Loop.
 * @param {string} clientId The client id of the block.
 * @return {boolean}
 */
const isSharedBlock = ( clientId ) => getBlockParents( clientId )?.some( id => {
	const { attributes, name } = getBlock( id ) ?? {};
	return 'core/query' === name || attributes?.ref;
});

/**
 * Check if the ID is empty.
 * @param {string} clientId The client id of the block.
 * @return {boolean}
 */
const isEmptyId = ( clientId ) => {
	const { attributes } = getBlock( clientId ) ?? {};
	return attributes?.id === undefined || '' === attributes?.id;
};

/**
 * Generate an Id based on the client id of the block. If the new id is also already used, create a new one using the `uuid`.
 * This might problem of duplicated new ids can be observed in the `Template Library` of the `Section` block when using Neve
 * Reference: https://github.com/Codeinwp/neve/blob/master/gutenberg/blocks/blog/template.json
 * The created block will share the same client Id at the beginning, after refresh a new will be generated and thus the problem will fix itself
 * by creating new id based on the new uniq `clientId`
 *
 * @param {string}       idPrefix The prefix used for generating the block id
 * @param {string}       clientId The block's client id provided by WordPress
 * @param {Set.<string>} idsList  The ids list for the current type of block
 * @return An uniq id instance
 */
const generateUniqIdInstance = ( idPrefix, clientId, idsList ) => {

	const instanceId = `${ idPrefix }${ clientId.slice( 0, 8 ) }`;
	if ( idsList.has( instanceId ) ) {
		let newInstanceId = `${ idPrefix }${ uuidv4().slice( 0, 8 ) }`;
		while ( idsList.has( newInstanceId ) ) {
			newInstanceId = `${ idPrefix }${ uuidv4().slice( 0, 8 ) }`;
		}
		return newInstanceId;
	}
	return instanceId;
};

/**
 * Generate the id prefix based on the name of the block
 *
 * @param {string} name Name of the block
 * @return {string}
 */
const generatePrefix = ( name ) => {
	return `wp-block-${ name.replace( '/', '-' ) }-`;
};

const idGenerationStatus = {};

/**
 * THe args definition for the block id generator
 *
 * @typedef {Object} AddBlockIdProps
 * @property {Object}             attributes        The block's attributes provided by WordPress
 * @property {Function}           setAttributes     The block's attributes update function provided by WordPress
 * @property {string}             name              The block's name provided by WordPress
 * @property {string}             clientId          The block's client id provided by WordPress
 * @property {Object}             defaultAttributes The default attributes of the block.
 * @property {(string|undefined)} idPrefix          (Optional) The prefix used for generating the block id
 */

/**
 * Generate an Id for block so that it will create a conlfict with the others.
 * Prevent the duplicate Id for actions like: duplicate, copy
 *
 * @param {AddBlockIdProps} args Block informatin about clientId, attributes, etc
 * @return {Function} A function that clean up the id from the internal list tracking
 * @external addBlockId
 */
export const addBlockId = ( args ) => {

	const { attributes, setAttributes, clientId, idPrefix, name, defaultAttributes } = args;
	idGenerationStatus[clientId] = 'busy';

	/**
	 * Create an alias for the global id tracker
	 *
	 * @type {Array.<string>}
	 */
	const blockIDs = window.themeisleGutenberg?.blockIDs ?? [];

	if ( attributes === undefined || setAttributes === undefined ) {
		return ( savedId ) => {
			localIDs[name]?.delete( savedId );
		};
	}

	// Initialize with an empty array the id list for the given block
	localIDs[name] ??= new Set();

	// Check if the ID is already used. EXCLUDE the one that come from reusable blocks.
	const idIsAlreadyUsed = Boolean( attributes.id && localIDs[name].has( attributes.id ) );

	if ( ! attributes.id || idIsAlreadyUsed ) {

		// Auto-generate idPrefix if not provided
		const prefix = idPrefix || generatePrefix( name );
		const instanceId = generateUniqIdInstance( prefix, clientId, localIDs[name]);

		if ( undefined === attributes.id ) {

			// If the id is undefined, then the block is newly created, and so we need to apply the Global Defaults
			addGlobalDefaults( attributes, setAttributes, name, defaultAttributes );
		}

		// Save the id in all methods
		localIDs[name].add( instanceId );
		blockIDs.push( instanceId );
		setAttributes({ id: instanceId });

		return ( savedId ) => {
			return ( savedId ) => {};
		};
	} 

	// No conflicts, save the current id only to keep track of it both in local and global mode.
	localIDs[name].add( attributes.id );
	blockIDs.push( attributes.id );
	

	return ( savedId ) => {
		idGenerationStatus[clientId] = 'free';
		localIDs[name].delete( savedId || attributes?.id );
	};
};

const { getBlock } = select( 'core/block-editor' );
const { getBlockParents } = select( 'core/block-editor' );
const { updateBlockAttributes } = dispatch( 'core/block-editor' );
const { getSelectedBlockClientId } = select( 'core/block-editor' );

/**
 * Create the function that behaves like `setAttributes` using the client id
 *
 * @param {*} clientId The block's client id provided by WordPress
 * @return {Function} Function that mimics `setAttributes`
 */
const updateAttrs = ( clientId ) => ( attr ) => {
	updateBlockAttributes( clientId, attr );
};

/**
 * THe args definition for the block id generator
 *
 * @typedef {Object} BlockData
 * @property {Object}   attributes    The block's attributes provided by WordPress
 * @property {Function} setAttributes The block's attributes update function provided by WordPress
 * @property {string}   name          The block's name provided by WordPress
 */

/**
 * Extract the attributes, setAttributes, and the name of the block using the data api
 *
 * @param {string} clientId The block's client id provided by WordPress
 * @return {BlockData}
 */
const extractBlockData = ( clientId ) => {
	const block = getBlock( clientId );
	return { attributes: block?.attributes, name: block?.name };
};


/**
 * Generate the id attribute for the given block.
 * This function is a simple wrapper around {@link addBlockId}
 *
 * @param {string} clientId          The block's client id provided by WordPress
 * @param {Object} defaultAttributes The default attributes of the block.
 * @return {Function} A function that clean up the id from the internal list tracking
 * @example
 * import defaultAttributes from './attributes'
 * const Block = ({ clientId }) => {
 * 		useEffect(() => {
 * 			const unsubscribe = blockInit(clientId, defaultAttributes);
 * 			return () => unsubscribe( attributes.id );
 * 		}, [ attributes.id ])
 * }
 */
export const blockInit = ( clientId, defaultAttributes ) => {
	if ( undefined === idGenerationStatus[clientId] || isEmptyId( clientId ) ) {
		idGenerationStatus[clientId] = 'free';
	}

	return (
		'busy' !== idGenerationStatus[clientId] &&
		( ! isSharedBlock( clientId ) || getSelectedBlockClientId() === clientId )
	) ?
		addBlockId({
			clientId,
			defaultAttributes,
			setAttributes: updateAttrs( clientId ),
			...extractBlockData( clientId )
		}) : () => {};
};


/**
 * Create a Style node for handling `head` Node change when working in a Tablet, Mobile mode or in FSE Editor.
 *
 * @param {import('./blocks.js').OtterNodeCSSOptions } options The options.
 * @return {import('./blocks.js').OtterNodeCSSReturn} The name of the node and function handler.
 */
export const useCSSNode = ( options = {}) => {
	const [ cssList, setCSSProps ] = useState({
		css: [],
		media: []
	});
	const [ settings, setSettings ] = useState({
		node: null,
		cssNodeName: ''
	});

	/**
	 *	Set CSS of the node.
	 *
	 * The `css` and `media` have a 1-1 relationship.
	 *
	 * @param {string[]} css   A list with CSS code.
	 * @param {string[]} media A list CSS media options. One for each CSS item.
	 *
	 * @example Simple usage.
	 *
	 * setNodeCSS([
	 * 			`.o-review-comparison_buttons span {
	 * 				background: ${ attributes.buttonColor } !important;
	 * 				color: ${ attributes.buttonText } !important;
	 * 			}`
	 * ]);
	 *
	 * @example CSS with Media.
	 * setNodeCSS([
	 * 			`{
	 * 				${ attributes.customTitleFontSize && `--title-text-size: ${ attributes.customTitleFontSize }px;` }
	 * 				${ attributes.customDescriptionFontSize && `--description-text-size: ${ attributes.customDescriptionFontSize }px;` }
	 * 			}`,
	 * 			`{
	 * 				${ attributes.customTitleFontSizeTablet && `--title-text-size: ${ attributes.customTitleFontSizeTablet }px;` }
	 * 				${ attributes.customDescriptionFontSizeTablet && `--description-text-size: ${ attributes.customDescriptionFontSizeTablet }px;` }
	 * 			}`,
	 * 			`{
	 * 				${ attributes.customTitleFontSizeMobile && `--title-text-size: ${ attributes.customTitleFontSizeMobile }px;` }
	 * 				${ attributes.customDescriptionFontSizeMobile && `--description-text-size: ${ attributes.customDescriptionFontSizeMobile }px;` }
	 * 			}`
	 * 		], [
	 * 			'@media ( min-width: 960px )',
	 * 			'@media ( min-width: 600px ) and ( max-width: 960px )',
	 * 			'@media ( max-width: 600px )'
	 * 		]
	 * );
	 */
	const setNodeCSS = ( css = [], media = []) => {
		setCSSProps({
			css,
			media
		});
	};

	useEffect( () => {

		let anchor;

		// Create the CSS node.
		const n = document.createElement( 'style' );
		n.type = 'text/css';
		n.setAttribute( 'data-generator', 'otter-blocks' );

		setTimeout( () => {

			// A small delay for the iFrame to properly initialize.
			anchor = parent.document.querySelector( 'iframe[name="editor-canvas"]' )?.contentWindow.document.head || document.head;
			anchor?.appendChild( n );
		}, 500 );

		setSettings({
			node: n,
			cssNodeName: options?.selector ?? `o-node-${uuidv4()}`
		});

		return () => {
			anchor?.removeChild( n );
		};
	}, [ ]);

	useEffect( () => {
		if ( settings.node && settings.cssNodeName && cssList.media !== undefined ) {

			// Create the CSS text by combining the list of CSS items with their media..
			const text =  zip( cssList.css, cssList.media )
				.map( x => {
					const [ css, media ] = x;
					if ( media ) {
						return `${media} { \n\t .${settings.cssNodeName}${options?.appendToRoot ? '' : ' '}${css} }`;
					}
					return `.${settings.cssNodeName}${options?.appendToRoot ? '' : ' '}${css}`;
				})
				.join( '\n' ) || '';
			settings.node.textContent = text;
		}
	}, [ cssList.css, cssList.media, settings.node, settings.cssNodeName ]);

	return [ settings.cssNodeName, setNodeCSS, setSettings ];
};

/**
 * Get the iframe of the editor. Use in FSE or Mobile/Tablet Preview for Page/Post.
 */
export const getEditorIframe = () => ( document.querySelector( 'iframe[name^="editor-canvas"]' ) );

const pendingIframeScriptCallbacks = new Map();
const pendingIframeScriptInflight = new Set();

/**
 * Run all queued callbacks for a script copied into the editor iframe.
 *
 * @param {string} assetSelectorId The id selector of the asset.
 */
const flushIframeScriptCallbacks = ( assetSelectorId ) => {
	const queue = pendingIframeScriptCallbacks.get( assetSelectorId );

	if ( ! queue?.length ) {
		return;
	}

	pendingIframeScriptCallbacks.delete( assetSelectorId );
	queue.forEach( ( cb ) => cb() );
};

/**
 * Queue a callback until an iframe script asset has finished loading.
 *
 * @param {string}   assetSelectorId The id selector of the asset.
 * @param {Function} callback        The callback.
 */
const queueIframeScriptCallback = ( assetSelectorId, callback ) => {
	if ( ! pendingIframeScriptCallbacks.has( assetSelectorId ) ) {
		pendingIframeScriptCallbacks.set( assetSelectorId, [] );
	}

	pendingIframeScriptCallbacks.get( assetSelectorId ).push( callback );
};

/**
 * Whether a copied iframe script node has finished loading.
 *
 * @param {HTMLScriptElement} scriptEl The script element.
 * @return {boolean} True when the script is ready.
 */
const isIframeScriptLoaded = ( scriptEl ) => {
	return Boolean(
		scriptEl.complete ||
		'complete' === scriptEl.readyState ||
		'loaded' === scriptEl.readyState
	);
};

/**
 * Whether a copied iframe script has finished executing in the iframe window.
 *
 * @param {Window}              iframeWindow    The iframe window.
 * @param {string}              assetSelectorId The id selector of the asset.
 * @param {HTMLScriptElement|null} scriptEl     The copied script element.
 * @return {boolean} True when the asset is ready to use.
 */
const isIframeScriptReady = ( iframeWindow, assetSelectorId, scriptEl ) => {
	if ( '#leaflet-js' === assetSelectorId ) {
		return Boolean( iframeWindow?.L );
	}

	return Boolean( scriptEl && isIframeScriptLoaded( scriptEl ) );
};

/**
 * Wait until a copied iframe script is ready, then flush queued callbacks.
 *
 * @param {string}              assetSelectorId The id selector of the asset.
 * @param {Window}              iframeWindow    The iframe window.
 * @param {HTMLScriptElement|null} scriptEl     The copied script element.
 */
const waitForIframeScriptReady = ( assetSelectorId, iframeWindow, scriptEl ) => {
	const tryFlush = () => {
		if ( isIframeScriptReady( iframeWindow, assetSelectorId, scriptEl ) ) {
			flushIframeScriptCallbacks( assetSelectorId );
			return true;
		}

		return false;
	};

	if ( tryFlush() ) {
		return;
	}

	if ( scriptEl && ! scriptEl.dataset.otterIframeCallbackBound ) {
		scriptEl.dataset.otterIframeCallbackBound = 'true';
		scriptEl.addEventListener( 'load', tryFlush );
	}

	let attempts = 0;
	const poll = () => {
		if ( ! pendingIframeScriptCallbacks.has( assetSelectorId ) ) {
			return;
		}

		if ( tryFlush() || 300 < attempts++ ) {
			return;
		}

		requestAnimationFrame( poll );
	};

	requestAnimationFrame( poll );
};

/**
 * Copy the JS node asset from main document to the iframe.
 *
 * WordPress can inject scripts into the canvas iframe natively: anything
 * enqueued on the `enqueue_block_assets` hook is collected by
 * `_wp_get_iframed_editor_assets()` and printed inside the iframe at boot
 * (see the `is_admin()` branch in `inc/class-registration.php`, which already
 * uses this for editor styles). We deliberately do NOT use that for the heavy
 * third-party scripts (Leaflet ~150KB, Lottie player ~280KB, Glide): the
 * iframe assets are resolved once, server-side, on editor load, so the native
 * route would ship them in every editor session even when no such block is
 * used. Copying on demand from the parent document keeps them lazy, at the
 * cost of the load/readiness tracking below. If that trade-off ever flips,
 * delete this machinery and enqueue the scripts on `enqueue_block_assets`.
 *
 * @param {string}   assetSelectorId The id of the asset.
 * @param {Function} callback        The callback.
 */
export const copyScriptAssetToIframe = ( assetSelectorId, callback ) => {
	const iframe = getEditorIframe();
	callback ??= () => {};

	if ( ! iframe?.contentWindow?.document ) {
		return;
	}

	const iframeWindow = iframe.contentWindow;
	const iframeDocument = iframeWindow.document;
	const existing = iframeDocument.querySelector( assetSelectorId );

	if ( existing ) {
		if ( isIframeScriptReady( iframeWindow, assetSelectorId, existing ) ) {
			callback?.();
		} else {
			queueIframeScriptCallback( assetSelectorId, callback );
			waitForIframeScriptReady( assetSelectorId, iframeWindow, existing );
		}

		return;
	}

	if ( pendingIframeScriptInflight.has( assetSelectorId ) ) {
		queueIframeScriptCallback( assetSelectorId, callback );
		return;
	}

	const original = document.querySelector( assetSelectorId );

	if ( ! Boolean( original ) ) {
		console.warn( `Selector: ${ assetSelectorId } is invalid.` );
		return;
	}

	pendingIframeScriptInflight.add( assetSelectorId );
	queueIframeScriptCallback( assetSelectorId, callback );

	const script = iframeDocument.createElement( 'script' );
	script.onload = () => {
		pendingIframeScriptInflight.delete( assetSelectorId );
		waitForIframeScriptReady( assetSelectorId, iframeWindow, script );
	};
	script.onerror = () => {
		pendingIframeScriptInflight.delete( assetSelectorId );
		pendingIframeScriptCallbacks.delete( assetSelectorId );
	};
	script.id = original.id;
	script.type = 'text/javascript';
	iframeDocument.head.appendChild( script );
	script.src = original.src;
};

/**
 * Mount the shared Otter icon gradient definition into a document.
 *
 * Block icons in the iframed editor (`apiVersion: 3`) reference
 * `fill: url(#o-icon-fill)` from CSS, so the gradient must live in the same
 * document as the SVG icons.
 *
 * @param {Document} ownerDocument The document that should own the gradient.
 */
export const mountIconGradient = ( ownerDocument ) => {
	if ( ! ownerDocument?.body || ownerDocument.querySelector( 'svg.o-icon-gradient' ) ) {
		return;
	}

	const gradient = ownerDocument.createElement( 'div' );
	gradient.setAttribute( 'style', 'height: 0; width: 0; overflow: hidden;' );
	gradient.setAttribute( 'aria-hidden', 'true' );
	gradient.innerHTML = `
		<svg xmlns="http://www.w3.org/2000/svg" class="o-icon-gradient" height="0" width="0" style="opacity: 0">
			<defs>
				<linearGradient id="o-icon-fill">
					<stop offset="0%" stop-color="#ED6F57" stop-opacity="1"></stop>
					<stop offset="100%" stop-color="#F22B6C" stop-opacity="1"></stop>
				</linearGradient>
			</defs>
		</svg>
	`.trim();
	ownerDocument.body.appendChild( gradient );
};

/**
 * Ensure the Otter icon gradient exists in the editor and canvas iframe.
 */
export const mountIconGradientForEditor = () => {
	mountIconGradient( document );

	const iframe = getEditorIframe();

	if ( iframe?.contentDocument ) {
		mountIconGradient( iframe.contentDocument );
	}
};

/**
 * Keep the icon gradient available when the editor canvas iframe appears.
 */
export const watchEditorIframeIconGradient = () => {
	mountIconGradientForEditor();

	const observer = new MutationObserver( () => {
		mountIconGradientForEditor();
	});

	observer.observe( document.body, {
		childList: true,
		subtree: true
	});

	document.addEventListener( 'load', ( event ) => {
		if ( event.target?.name?.startsWith?.( 'editor-canvas' ) ) {
			mountIconGradientForEditor();
		}
	}, true );
};

/**
 * Get the document that owns a block's DOM element.
 *
 * In the iframed editor (`apiVersion: 3`) the block lives inside the editor
 * canvas iframe, so its `ownerDocument` is the iframe document — not the
 * top-level `document`. Reading from the element's `ownerDocument` is the
 * pattern recommended by the WordPress block migration guide and is correct in
 * nested, FSE and Tablet/Mobile preview contexts too. Falls back to the
 * top-level `document` when no element is available yet (e.g. before the ref is
 * attached) or when the editor is not iframed.
 *
 * @param {HTMLElement|{current: ?HTMLElement}|null} [refOrElement] The block element or a ref to it.
 * @return {Document} The document that owns the element.
 */
export const getBlockDocument = ( refOrElement ) => {
	const element = refOrElement?.current ?? refOrElement;
	return element?.ownerDocument ?? document;
};

/**
 * Get the window that owns a block's DOM element.
 *
 * Companion to {@link getBlockDocument}. Use this to read editor globals (e.g.
 * `themeisleGutenberg`), browser APIs (`location`, `getComputedStyle`) or
 * third-party libraries from within the iframed editor instead of reaching for
 * the top-level `window`.
 *
 * @param {HTMLElement|{current: ?HTMLElement}|null} [refOrElement] The block element or a ref to it.
 * @return {Window} The window that owns the element.
 */
export const getBlockWindow = ( refOrElement ) => {
	return getBlockDocument( refOrElement ).defaultView ?? window;
};

/**
 * Run an effect against a block's DOM element and its owning document/window.
 *
 * Thin wrapper over `useRefEffect` that hands the callback the element plus the
 * `ownerDocument`/`defaultView` it belongs to, so third-party libraries (Glide,
 * Leaflet, Google Maps, …) initialise against the iframed editor's document
 * rather than the top-level one. Return a cleanup function as usual. Spread the
 * returned ref callback onto the target element (it can be merged with other
 * refs via `@wordpress/compose`'s `useMergeRefs`).
 *
 * @param {(element: HTMLElement, ownerDocument: Document, ownerWindow: Window) => (void | (() => void))} callback     The setup callback.
 * @param {Array}                                                                                         dependencies Effect dependencies, forwarded to `useRefEffect`.
 * @return {Function} A ref callback to attach to the target element.
 */
export const useBlockElementEffect = ( callback, dependencies ) => {
	return useRefEffect( ( element ) => {
		const ownerDocument = element?.ownerDocument ?? document;
		const ownerWindow = ownerDocument.defaultView ?? window;
		return callback( element, ownerDocument, ownerWindow );
	}, dependencies );
};

export const buildGetSyncValue = ( name, attributes, defaultAttributes ) => {
	return ( field ) => {
		if ( attributes?.isSynced?.includes( field ) ) {
			return getDefaultValueByField({ name, field, defaultAttributes, attributes });
		}
		return attributes?.[field];
	};
};

/**
 * Get the reusable block content by id.
 *
 * @param {string} id The id of the reusable block.
 * @return {BlockInstance[]|*[]} The reusable block content.
 */
export function pullReusableBlockContentById( id ) {
	const reusableBlocks = select( 'core' ).getEntityRecords( 'postType', 'wp_block' );

	if ( ! reusableBlocks ) {
		return [];
	}

	const reusableBlock = reusableBlocks.find( block => block.id === id );

	if ( ! reusableBlock || undefined === reusableBlock.content ) {
		return [];
	}

	return parse( reusableBlock.content.raw ?? reusableBlock.content );
}

/**
 * Insert a block below the given block.
 *
 * @param {string} clientId The client id of the reference block.
 * @param {any}    block    The block to insert.
 * @see https://github.com/WordPress/gutenberg/blob/e448fa70163ce936eae9aec454ca99f5a6287f15/packages/block-editor/src/store/actions.js#L1604-L1622
 */
export function insertBlockBelow( clientId, block ) {
	const {
		getBlockRootClientId,
		getTemplateLock,
		getBlockIndex
	} = select( 'core/block-editor' );

	const {
		insertBlock,
		insertBlocks
	} = dispatch( 'core/block-editor' );

	const rootClientId = getBlockRootClientId( clientId );
	const isLocked = getTemplateLock( rootClientId );

	if ( isLocked ) {
		return;
	}

	const index = getBlockIndex( clientId, rootClientId );

	// If the block is an array of blocks, insert them all.
	if ( Array.isArray( block ) ) {
		return insertBlocks( block, index + 1, rootClientId );
	}

	insertBlock( block, index + 1, rootClientId );
}

export class GlobalStateMemory {
	constructor() {
		this.states = {};
		window.addEventListener( 'message', this.handleMessage.bind( this ) );
	}

	/**
	 * Handle the message event.
	 *
	 * @param {MessageEvent} event The message event.
	 */
	handleMessage( event ) {
		if ( 'object' === typeof event.data && null !== event.data && 'otterMemoryState' in event.data ) {
			const { key, value, location, action } = event.data.otterMemoryState;

			if ( 'set' === action ) {
				if ( this.states[location] === undefined ) {
					this.states[location] = {};
				}

				this.states[location][key] = value;
			}

			if ( 'get' === action ) {
				( window.parent !== undefined ? window?.parent : window )
					.postMessage?.({
						otterMemoryState: {
							key,
							location,
							value: this.getState( location, key ),
							action: 'value'
						}
					});
			}
		}
	}

	/**
	 * Get the state value.
	 * @param {string} location The location of the state.
	 * @param {string} key      The key of the state.
	 * @return {undefined|*}
	 */
	getState( location, key ) {
		if ( this.states[location] === undefined ) {
			return undefined;
		}
		return this.states[location][key];
	}
}

/**
 * The global state memory.
 *
 * @param {string} key          The key of the state.
 * @param {any}    defaultValue The default value of the state.
 * @return {unknown[]}
 */
export function useTabSwitch( key, defaultValue ) {
	const location = 'tab';
	const [ tab, setTab ] = useState( defaultValue );

	useEffect( () => {

		/**
		 * Retrieve the initial state from the parent via bi-directional communication.
		 * @param event
		 */
		const listener = ( event ) => {
			if ( 'object' === typeof event.data && null !== event.data && 'otterMemoryState' in event.data ) {
				const { key: componentKey, value, location, action } = event.data.otterMemoryState;
				if ( 'tab' === location && key === componentKey && 'value' === action ) {
					setTab( value ?? defaultValue );
				}
			}
		};
		window.addEventListener( 'message', listener );


		// Request the state from the parent.
		( window.parent !== undefined ? window?.parent : window )
			.postMessage({
				otterMemoryState: {
					key,
					location,
					action: 'get'
				}
			});


		return () => {
			window.removeEventListener( 'message', listener );
		};
	}, []);

	return [ tab, ( value ) => {

		/**
		 * Update the state in the parent.
		 */
		( window.parent !== undefined ? window?.parent : window )
			.postMessage?.({
				otterMemoryState: {
					key,
					location,
					value,
					action: 'set'
				}
			});
		setTab( value );
	} ];
}

/**
 * Get all registered patterns.
 *
 * @return {Array.<{name: string, title: string, content: string, categories: string[], source: string | undefined, blockTypes: string[]|undefined}>}
 */
export function pullPatterns() {
	return select( 'core' )?.getBlockPatterns() ?? [];
}

/**
 * Get all registered patterns that are part of the Otter Blocks category.
 *
 * @return {{name: string, title: string, content: string, categories: string[], source: (string|undefined), blockTypes: (string[]|undefined)}[]}
 */
export function pullOtterPatterns() {
	return pullPatterns().filter( pattern => pattern?.name?.startsWith( 'otter-blocks/' ) || pattern?.name?.startsWith( 'otter-pro/' ) );
}


