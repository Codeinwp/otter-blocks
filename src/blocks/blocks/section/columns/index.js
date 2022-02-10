/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { columnsIcon as icon } from '../../../helpers/icons.js';
import deprecated from './deprecated.js';
import edit from './edit.js';
import save from './save.js';
import variations from './variations.js';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Section', 'otter-blocks' ),
	description: __( 'Add a Section block that displays content in multiple columns, then add whatever content blocks you’d like.', 'otter-blocks' ),
	icon,
	keywords: [
		'advanced columns',
		'layout',
		'section'
	],
	deprecated,
	variations,
	edit,
	save
});
