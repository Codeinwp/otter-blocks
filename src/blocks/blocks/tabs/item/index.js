/**
 * External dependencies
 */
import { video as icon } from '@wordpress/icons';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import edit from './edit.js';
import save from './save.js';
import attributes from './attributes.js';

registerBlockType( 'themeisle-blocks/tabs-item', {
	title: __( 'Tab Item', 'otter-blocks' ),
	description: __( 'Organize and allow navigation between groups of content with Tabs block.', 'otter-blocks' ),
	icon,
	category: 'themeisle-blocks',
	keywords: [
		'media',
		'tab',
		'item'
	],
	attributes,
	parent: [ 'themeisle-blocks/tabs' ],
	edit,
	save
});

