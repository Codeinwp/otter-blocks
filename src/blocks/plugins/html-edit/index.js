/**
 * WordPress dependencies
 */
import { getBlockType } from '@wordpress/blocks';

import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import { getAttributesFromHTML } from './attributes.js';

addFilter( 'blocks.getBlockAttributes', 'themeisle-gutenberg/html-edit-attributes', ( attributes, blockType, innerHTML ) => {

	// Deprecated definitions come with their own markup.
	if ( blockType?.save && getBlockType( blockType.name )?.save !== blockType.save ) {
		return attributes;
	}

	return getAttributesFromHTML( attributes, blockType, innerHTML );
});
