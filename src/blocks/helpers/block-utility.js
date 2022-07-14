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

/**
 * Internal dependencies.
 */
import globalDefaultsBlocksAttrs from '../plugins/options/global-defaults/defaults.js';
import {useEffect, useMemo, useRef, useState} from '@wordpress/element';

/**
 * Initiate the global id tracker with an empty list if it is the case.
 */
window.themeisleGutenberg.blockIDs ??= [];

/**
 * Utiliy function for creating a function that add the gobal defaults values to the block's attribute value.
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
 * @param {string}   name              The block's name provided by WordPress
 * @param {string}   field             Name of the value to be returned
 * @param {Object}   defaultAttributes The default attributes of the block.
 */
export const getDefaultValue = ( name, field, defaultAttributes ) => {
	const blockDefaults = window.themeisleGutenberg.globalDefaults?.[name];
	const value = blockDefaults?.[field] ? blockDefaults?.[field] : defaultAttributes[field]?.default;

	return value;
};

/**
 * Utiliy function for getting the default value of the attribute by value.
 *
 * @param {string}   name              The block's name provided by WordPress
 * @param {string}   field             Name of the value to be returned
 * @param {Object}   defaultAttributes The default attributes of the block.
 * @param {Object}   attributes        The attributes of the block.
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
 * Check if the ID is inside a reusable block.
 * @param {string} clientId
 * @returns {boolean}
 */
const isInReusableBlock = ( clientId ) => {
	return getBlockParents( clientId )
		?.some( id => getBlock( id )?.attributes?.ref );
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
 * @returns An uniq id instance
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
 * @returns {string}
 */
const generatePrefix = ( name ) => {
	return `wp-block-${ name.replace( '/', '-' ) }-`;
};

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

	/**
	 * Create an alias for the global id tracker
	 *
	 * @type {Array.<string>}
	 */
	const blockIDs = window.themeisleGutenberg.blockIDs || [];

	if ( attributes === undefined || setAttributes === undefined ) {
		return ( savedId ) => {
			localIDs[name]?.delete( savedId );
		};
	}

	// Initialize with an empty array the id list for the given block
	localIDs[name] ??= new Set();

	// Check if the ID is already used. EXCLUDE the one that come from reusable blocks.
	const idIsAlreadyUsed = Boolean( attributes.id && localIDs[name].has( attributes.id ) );

	if ( attributes.id === undefined || idIsAlreadyUsed ) {

		// Auto-generate idPrefix if not provided
		const prefix = idPrefix || generatePrefix( name );
		const instanceId = generateUniqIdInstance( prefix, clientId, localIDs[name]);

		if ( attributes.id === undefined ) {

			// If the id is undefined, then the block is newly created, and so we need to apply the Global Defaults
			addGlobalDefaults( attributes, setAttributes, name, defaultAttributes );

			// Save the id in all methods
			localIDs[name].add( instanceId );
			blockIDs.push( instanceId );
			setAttributes({ id: instanceId });

		} else if ( idIsAlreadyUsed ) {

			// The block must be a copy and its is already used
			// Generate a new one and save it to `localIDs` to keep track of it in local mode.
			localIDs[name].add( instanceId );
			setAttributes({ id: instanceId });
		}
		return ( savedId ) => {
			localIDs[name].delete( instanceId || savedId );
		};
	} else {

		// No conflicts, save the current id only to keep track of it both in local and global mode.
		localIDs[name].add( attributes.id );
		blockIDs.push( attributes.id );
	}

	return ( savedId ) => {
		localIDs[name].delete( attributes?.id || savedId );
	};
};

const getBlock = select( 'core/block-editor' ).getBlock;
const getBlockParents = select( 'core/block-editor' ).getBlockParents;
const updateBlockAttributes = dispatch( 'core/block-editor' ).updateBlockAttributes;
const getSelectedBlockClientId = select( 'core/block-editor' ).getSelectedBlockClientId;

/**
 * Create the function that behaves like `setAttributes` using the client id
 *
 * @param {*} clientId The block's client id provided by WordPress
 * @returns {Function} Function that mimics `setAttributes`
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
 * @returns {BlockData}
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
	return addBlockId({
		clientId,
		defaultAttributes,
		setAttributes: ( ! isInReusableBlock( clientId ) || getSelectedBlockClientId() === clientId ) ? updateAttrs( clientId ) : undefined,
		...extractBlockData( clientId )
	});
};


/**
 * Create a Style node for handling `head` Node change when working in a Tablet, Mobile mode or in FSE Editor.
 *
 * @param {OtterNodeCSSOptions?} options The options.
 * @returns {OtterNodeCSSReturn} The name of the node and function handler.
 */
export const useCSSNode = options => {
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
	 * @param {string[]} css A list with CSS code.
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
	 * 				${ attributes.customTitleFontSize && `--titleTextSize: ${ attributes.customTitleFontSize }px;` }
	 * 				${ attributes.customDescriptionFontSize && `--descriptionTextSize: ${ attributes.customDescriptionFontSize }px;` }
	 * 			}`,
	 * 			`{
	 * 				${ attributes.customTitleFontSizeTablet && `--titleTextSize: ${ attributes.customTitleFontSizeTablet }px;` }
	 * 				${ attributes.customDescriptionFontSizeTablet && `--descriptionTextSize: ${ attributes.customDescriptionFontSizeTablet }px;` }
	 * 			}`,
	 * 			`{
	 * 				${ attributes.customTitleFontSizeMobile && `--titleTextSize: ${ attributes.customTitleFontSizeMobile }px;` }
	 * 				${ attributes.customDescriptionFontSizeMobile && `--descriptionTextSize: ${ attributes.customDescriptionFontSizeMobile }px;` }
	 * 			}`
	 * 		], [
	 * 			'@media ( min-width: 960px )',
	 * 			'@media ( min-width: 600px ) and ( max-width: 960px )',
	 * 			'@media ( max-width: 600px )'
	 * 		]
	 * );
	 *
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
						return `${media} { \n\t .${settings.cssNodeName} ${css} }`;
					}
					return `.${settings.cssNodeName} ${css}`;
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

/**
 * Copy the JS node asset from main document to the iframe.
 *
 * @param {string} assetSelectorId The id of the asset.
 * @param {Function} callback The callback.
 */
export const copyScriptAssetToIframe = ( assetSelectorId, callback ) => {
	const iframe = getEditorIframe();
	callback ??= () => {};
	if ( Boolean( iframe ) ) {
		if ( Boolean( iframe?.contentWindow?.document.querySelector( assetSelectorId ) ) ) {
			callback?.();
		} else {
			const original = document.querySelector( assetSelectorId );

			if ( ! Boolean( original ) ) {
				console.warn( `Selector: ${ assetSelectorId } is invalid.` );
				return;
			}

			const n = iframe.contentWindow.document.createElement( 'script' );
			n.onload = callback;
			n.id = original.id;
			n.type = 'text/javascript';
			iframe.contentWindow.document?.head.appendChild( n );
			n.src = original.src;
		}
	}
};
