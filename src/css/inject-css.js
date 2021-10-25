
/**
 * WordPress dependencies.
 */
import { flattenDeep } from 'lodash';

import { parse } from '@wordpress/blocks';

import {
	select,
	subscribe
} from '@wordpress/data';

const addStyle = style => {
	let element = document.getElementById( 'otter-css-editor-styles' );

	if ( null === element ) {
		element = document.createElement( 'style' );
		element.setAttribute( 'type', 'text/css' );
		element.setAttribute( 'id', 'otter-css-editor-styles' );
		document.getElementsByTagName( 'head' )[0].appendChild( element );
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
			};
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

const subscribed = subscribe( () => {
	const { getBlocks } = select( 'core/block-editor' );
	const blocks = getBlocks();
	const reusableBlocks = select( 'core' ).getEntityRecords( 'postType', 'wp_block' );
	const blocksStyle = getCustomCssFromBlocks( blocks, reusableBlocks );
	addStyle( blocksStyle );
});
