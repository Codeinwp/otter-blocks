/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { columnIcon as icon } from '../../../helpers/icons.js';
import deprecated from './deprecated.js';
import edit from './edit.js';
import save from './save.js';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Section Column', 'otter-blocks' ),
	description: __( 'A single column within a Section block.', 'otter-blocks' ),
	icon,
	deprecated,
	edit,
	save
});
