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
import metadata from './block.json';
import edit from './edit.js';
import save from './save.js';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Tab Item', 'otter-blocks' ),
	description: __( 'Organize and allow navigation between groups of content with Tabs block.', 'otter-blocks' ),
	icon,
	keywords: [
		'media',
		'tab',
		'item'
	],
	edit,
	save
});

