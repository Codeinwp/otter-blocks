/**
 * WordPress dependencies
 */
import { getBlockType, getSaveContent, validateBlock } from '@wordpress/blocks';

import { dispatch, select, subscribe } from '@wordpress/data';

import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import {
	GENERATED_MARKUP,
	HTML_FIELDS,
	getAttributesFromHTML,
	restoreGeneratedMarkup,
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

/**
 * Sync the stale copies of duplicated values and restore the generated markup in an edited block.
 *
 * @param {{name: string, attributes: Record<string, unknown>, originalContent: string}} block The block.
 * @return {string} The repaired markup.
 */
const repairMarkup = ( block ) => {
	const blockType = getBlockType( block.name );
	const synced = syncDuplicateValues( block.attributes, blockType, block.originalContent ) ?? block.originalContent;

	return restoreGeneratedMarkup( block.name, synced, getSaveContent( blockType, block.attributes ) ) ?? synced;
};

// An HTML edit of one copy of a duplicated value, or of generated markup, leaves the block invalid; repair it.
subscribe( () => {
	const blockEditor = select( 'core/block-editor' );
	const block = blockEditor?.getSelectedBlock();

	if (
		! block ||
		block.isValid ||
		( ! HTML_FIELDS[ block.name ] && ! GENERATED_MARKUP[ block.name ]) ||
		lastChecked === block.originalContent ||
		'html' !== blockEditor.getBlockMode( block.clientId )
	) {
		return;
	}

	lastChecked = block.originalContent;

	const repaired = repairMarkup( block );

	if ( repaired === block.originalContent || ! validateBlock({ ...block, originalContent: repaired })[0]) {
		return;
	}

	// The same edit can come back after the repair and must be repaired again.
	lastChecked = null;

	dispatch( 'core/block-editor' ).updateBlock( block.clientId, {
		originalContent: repaired,
		isValid: true,
		validationIssues: []
	});
});
