/**
 * WordPress dependencies
 */
import { getBlockType, validateBlock } from '@wordpress/blocks';

import { dispatch, select, subscribe } from '@wordpress/data';

import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import {
	HTML_FIELDS,
	getAttributesFromHTML,
	syncDuplicateValues
} from './attributes.js';

addFilter( 'blocks.getBlockAttributes', 'themeisle-gutenberg/html-edit-attributes', ( attributes, blockType, innerHTML ) => {

	// Deprecated definitions come with their own markup.
	if ( blockType?.save && getBlockType( blockType.name )?.save !== blockType.save ) {
		return attributes;
	}

	return getAttributesFromHTML( attributes, blockType, innerHTML );
});

let lastChecked = null;

// An HTML edit of one copy of a duplicated value leaves the block invalid; sync the other copies.
subscribe( () => {
	const blockEditor = select( 'core/block-editor' );
	const block = blockEditor?.getSelectedBlock();

	if (
		! block ||
		block.isValid ||
		! HTML_FIELDS[ block.name ] ||
		lastChecked === block.originalContent ||
		'html' !== blockEditor.getBlockMode( block.clientId )
	) {
		return;
	}

	lastChecked = block.originalContent;

	const synced = syncDuplicateValues( block.attributes, getBlockType( block.name ), block.originalContent );

	if ( ! synced || ! validateBlock({ ...block, originalContent: synced })[0]) {
		return;
	}

	dispatch( 'core/block-editor' ).updateBlock( block.clientId, {
		originalContent: synced,
		isValid: true,
		validationIssues: []
	});
});
