
/**
 * WordPress dependencies.
 */
import {
	flattenDeep,
	isEqual
} from 'lodash';

import { parse } from '@wordpress/blocks';

import {
	select,
	subscribe
} from '@wordpress/data';

let isInitialCall = true;

const addStyle = style => {
	const iFrame = window.parent.document.querySelector( 'iframe[name="editor-canvas"]' )?.contentWindow;
	let anchor = iFrame?.document.head || document.head;
	let element = anchor.querySelector( '#o-css-editor-styles' );

	if ( isInitialCall && iFrame ) {
		iFrame.addEventListener( 'DOMContentLoaded', function() {
			setTimeout( () => {

				// A small delay for the iFrame to properly initialize.
				addStyle( style );
			}, 500 );
		});

		isInitialCall = false;
		return;
	}

	if ( null === element ) {
		element = document.createElement( 'style' );
		element.setAttribute( 'type', 'text/css' );
		element.setAttribute( 'id', 'o-css-editor-styles' );
		anchor?.appendChild( element );
	}

	if ( element.textContent === style ) {
		return null;
	}

	return element.textContent = style;
};

/*
	This function will get the `customCss` value from all the blocks and its children
*/
const getCustomCssFromBlocks = ( blocks, reusableBlocks ) => {
	if ( ! blocks ) {
		return '';
	}

	// Return the children of the block. The result is an array deeply nested that match the structure of the block in the editor.
	const getChildrenFromBlock = ( block ) => {
		const children = [];
		if ( 'core/block' === block.name && null !== reusableBlocks ) {
			const reBlocks = reusableBlocks.find( i => block.attributes.ref === i.id );
			if ( reBlocks && reBlocks.content ) {
				const content = reBlocks.content.hasOwnProperty( 'raw' ) ? reBlocks.content.raw : reBlocks.content;
				children.push(  parse( content ).map( ( child ) => [ child, getChildrenFromBlock( child ) ])  );
			}
		}

		if ( undefined !== block.innerBlocks && 0 < ( block.innerBlocks ).length ) {
			children.push( block.innerBlocks.map( ( child ) => [ child, getChildrenFromBlock( child ) ]) );
		}

		return children;
	};

	// Get all the blocks and their children
	const allBlocks = blocks.map( ( block ) => {
		return [ block, getChildrenFromBlock( block ) ];
	});

	// Transform the deply nested array in a simple one and then get the `customCss` value where it is the case
	const extractCustomCss = flattenDeep( allBlocks ).map( ( block ) => {
		if ( block.attributes && block.attributes.hasCustomCSS ) {
			if ( block.attributes.customCSS && ( null !== block.attributes.customCSS ) ) {
				return block.attributes.customCSS + '\n';
			}
		}
		return '';
	});

	// Build the global style
	const style = extractCustomCss.reduce( ( acc, localStyle ) => acc + localStyle, '' );

	return style;
};

let previousBlocks = [];
let previewView = false;

export const onDeselect = () => {
	const { getBlocks } = select( 'core/block-editor' );
	const blocks = getBlocks();
	const reusableBlocks = select( 'core' ).getEntityRecords( 'postType', 'wp_block', { context: 'view' });
	const blocksStyle = getCustomCssFromBlocks( blocks, reusableBlocks );
	addStyle( blocksStyle );
};

subscribe( () => {
	const { getBlocks } = select( 'core/block-editor' );
	const __experimentalGetPreviewDeviceType = select( 'core/edit-post' ) ? select( 'core/edit-post' ).__experimentalGetPreviewDeviceType() : false;
	const blocks = getBlocks();
	const reusableBlocks = select( 'core' ).getEntityRecords( 'postType', 'wp_block', { context: 'view' });

	if ( ! isEqual( previousBlocks, blocks ) || previewView !== __experimentalGetPreviewDeviceType ) {
		const blocksStyle = getCustomCssFromBlocks( blocks, reusableBlocks );

		if ( blocksStyle ) {
			if ( previewView !== __experimentalGetPreviewDeviceType && 'Desktop' === previewView ) {
				setTimeout( () => {

					// A small delay for the iFrame to properly initialize.
					addStyle( blocksStyle );
				}, 500 );
			} else {
				addStyle( blocksStyle );
			}
		}

		previousBlocks = blocks;
		previewView = __experimentalGetPreviewDeviceType;
	}
});
