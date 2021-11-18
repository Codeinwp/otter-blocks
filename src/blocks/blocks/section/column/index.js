/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { columnIcon as icon } from '../../../helpers/icons.js';
import attributes from './attributes.js';
import deprecated from './deprecated.js';
import edit from './edit.js';
import save from './save.js';

registerBlockType( 'themeisle-blocks/advanced-column', {
	title: __( 'Section Column', 'otter-blocks' ),
	description: __( 'A single column within a Section block.', 'otter-blocks' ),
	parent: [ 'themeisle-blocks/advanced-columns' ],
	icon,
	category: 'themeisle-blocks',
	attributes,
	deprecated,
	supports: {
		inserter: false,
		html: false
	},
	edit,
	save
});
