/**
 * External dependencies
 */
import { video as icon } from '@wordpress/icons';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import edit from './edit.js';
import save from './save.js';
import attributes from './attributes.js';

registerBlockType( 'themeisle-blocks/tabs', {
	title: __( 'Tabs', 'otter-blocks' ),
	description: __( 'Organize and allow navigation between groups of content with Tabs block.', 'otter-blocks' ),
	icon,
	category: 'themeisle-blocks',
	keywords: [
		'media',
		'tabs',
		'select'
	],
	attributes,
	supports: {
		align: [ 'left', 'center', 'right' ]
	},
	edit,
	save
});

