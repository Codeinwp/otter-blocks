/**
 * External dependencies.
 */
import { v4 as uuidv4 } from 'uuid';

/**
 * WordPress dependencies.
 */
import { isEqual } from 'lodash';

import {
	dispatch,
	select
} from '@wordpress/data';

/**
 * Internal dependencies.
 */
import globalDefaultsBlocksAttrs from '../plugins/options/global-defaults/defaults.js';

/**
 * Initiate the global id tracker with an empty list if it is the case.
 */
window.themeisleGutenberg.blockIDs ??= [];

/**
 * Utiliy function for creating a function that add the gobal defaults values to the block's attribute value.
 * @param {Object} attributes The block's attributes provided by WordPress
 * @param {function} setAttributes The block's attributes update function provided by WordPress
 * @param {string} name The block's name provided by WordPress
 * @param {Object} defaultAttributes The default attributes of the block.
 */
export const addGlobalDefaults = ( attributes, setAttributes, name, defaultAttributes ) => {

	// Check if the globals default are available and its values are different from the base values.
	if ( undefined !== window.themeisleGutenberg?.globalDefaults && ! isEqual( globalDefaultsBlocksAttrs[name], window.themeisleGutenberg.globalDefaults[name]) ) {
		const defaultGlobalAttrs = { ...window.themeisleGutenberg.globalDefaults[name] };

		const attrs = Object.keys( defaultGlobalAttrs )
			.filter( attr => attributes[ attr ] === defaultAttributes[ attr ]?.default ) // Keep only the properties with the default value.
			// Build an attribute object with the properties that are gone take the Global Defaults values.
			.reduce( ( attrs, attr ) => {
				attrs[ attr ] = defaultGlobalAttrs[ attr ];
				return attrs;
			}, {});
		setAttributes({ ...attrs });
	}
};

/**
 * An object that keep tracking of the block instances. Is used for preventing id duplication on action like: create, duplicate, copy on editor page.
 * @type {Object.<string, Set.<string>>}
 */
const localIDs = {};

/**
 * Generate an Id based on the client id of the block. If the new id is also already used, create a new one using the `uuid`.
 * This might problem of duplicated new ids can be observed in the `Template Library` of the `Section` block when using Neve
 * Reference: https://github.com/Codeinwp/neve/blob/master/gutenberg/blocks/blog/template.json
 * The created block will share the same client Id at the beggining, after refresh a new will be generated and thus the problem will fix itself
 * by creating new id based on the new uniq `clientId`
 * @param {string} idPrefix The prefix used for generating the block id
 * @param {string} clientId The block's client id provided by WordPress
 * @param {Set.<string>} idsList The ids list for the current type of block
 * @returns An uniq id instance
 */
const generateUniqIdInstance = ( idPrefix, clientId, idsList ) => {
	const instanceId = `${ idPrefix }${ clientId.substr( 0, 8 ) }`;
	if ( idsList.has( instanceId ) ) {
		let newInstanceId = `${ idPrefix }${ uuidv4().substr( 0, 8 ) }`;
		while ( idsList.has( newInstanceId ) ) {
			newInstanceId = `${ idPrefix }${ uuidv4().substr( 0, 8 ) }`;
		}
		return newInstanceId;
	}
	return instanceId;
};

/**
 * Generate the id prefix based on the name of the block
 * @param {string} name Name of the block
 * @returns {string}
 */
const generatePrefix = ( name ) => {
	return `wp-block-${ name.replace( '/', '-' ) }-`;
};

/**
 * THe args definition for the block id generator
 * @typedef {Object} AddBlockIdProps
 * @property {Object} attributes The block's attributes provided by WordPress
 * @property {function} setAttributes The block's attributes update function provided by WordPress
 * @property {string} name The block's name provided by WordPress
 * @property {string} clientId The block's client id provided by WordPress
 * @property {Object} defaultAttributes The default attributes of the block.
 * @property {(string|undefined)} idPrefix (Optional) The prefix used for generating the block id
 */


/**
 * Generate an Id for block so that it will create a conlfict with the others.
 * Prevent the duplicate Id for actions like: duplicate, copy
 * @param {AddBlockIdProps} args Block informatin about clientId, attributes, etc
 * @return {Function} A function that clean up the id from the internal list tracking
 * @external addBlockId
 */
export const addBlockId = ( args ) => {

	const { attributes, setAttributes, clientId, idPrefix, name, defaultAttributes } = args;

	/**
	 * Create an alias for the global id tracker
	 * @type {Array.<string>}
	 */
	const blockIDs = window.themeisleGutenberg.blockIDs;

	if ( attributes === undefined || setAttributes === undefined ) {
		return ( savedId ) => {
			localIDs[name]?.delete( savedId );
		};
	}

	// Initialize with an empty array the id list for the given block
	localIDs[name] ??= new Set();

	// Auto-generate idPrefix if not provided
	const prefix = idPrefix || generatePrefix( name );

	const instanceId = generateUniqIdInstance( prefix, clientId, localIDs[name]);
	const idIsAlreadyUsed = attributes.id && localIDs[name].has( attributes.id );

	if ( attributes.id === undefined ) {

		// If the id is undefined, then the block is newly created, and so we need to apply the Global Defaults
		addGlobalDefaults( attributes, setAttributes, name, defaultAttributes );

		// Save the id in all methods
		setAttributes({ id: instanceId });
		localIDs[name].add( instanceId );
		blockIDs.push( instanceId );
	} else if ( idIsAlreadyUsed ) {

		// The block must be a copy and its is already used
		// Generate a new one and save it to `localIDs` to keep track of it in local mode.
		setAttributes({ id: instanceId });
		localIDs[name].add( instanceId );
	} else {

		// No conflicts, save the current id only to keep track of it both in local and global mode.
		localIDs[name].add( attributes.id );
		blockIDs.push( attributes.id );
	}

	const deleteBlockIdFromRegister = ( savedId ) => {
		if ( attributes.id !== undefined && ! idIsAlreadyUsed ) {
			localIDs[name].delete( attributes?.id || savedId );
		} else {
			localIDs[name].delete( instanceId || savedId );
		}
	};

	return deleteBlockIdFromRegister;
};


const getBlock = select( 'core/block-editor' ).getBlock;
const updateBlockAttributes = dispatch( 'core/block-editor' ).updateBlockAttributes;

/**
 * Create the function that behaves like `setAttributes` using the client id
 * @param {*} clientId The block's client id provided by WordPress
 * @returns {Function} Function that mimics `setAttributes`
 */
const updateAttrs = ( clientId ) => ( attr ) => {
	updateBlockAttributes( clientId, attr );
};

/**
 * THe args definition for the block id generator
 * @typedef {Object} BlockData
 * @property {Object} attributes The block's attributes provided by WordPress
 * @property {function} setAttributes The block's attributes update function provided by WordPress
 * @property {string} name The block's name provided by WordPress
 */


/**
 * Extract the attributes, setAttributes, and the name of the block using the data api
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
 * @param {string} clientId The block's client id provided by WordPress
 * @param {Object} defaultAttributes The default attributes of the block.
 * @return {Function} A function that clean up the id from the internal list tracking
 * @example
 * import defaultAttributes from './attributes'
 * const Block = ({ cliendId }) => {
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
		setAttributes: updateAttrs( clientId ),
		...extractBlockData( clientId )
	});
};
