/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { columnsIcon as icon } from '../../../helpers/icons.js';
import attributes from './attributes.js';
import deprecated from './deprecated.js';
import edit from './edit.js';
import save from './save.js';
import variations from './variations.js';

registerBlockType( 'themeisle-blocks/advanced-columns', {
	title: __( 'Section', 'otter-blocks' ),
	description: __( 'Add a Section block that displays content in multiple columns, then add whatever content blocks you’d like.', 'otter-blocks' ),
	icon,
	category: 'themeisle-blocks',
	keywords: [
		'advanced columns',
		'layout',
		'grid'
	],
	attributes,
	supports: {
		align: [ 'wide', 'full' ],
		html: false
	},
	deprecated,
	variations,
	edit,
	save
});
