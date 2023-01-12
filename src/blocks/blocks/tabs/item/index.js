/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { tabsItemIcon as icon } from '../../../helpers/icons.js';
import edit from './edit.js';
import save from './save.js';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Tab Item', 'otter-blocks' ),
	description: __( 'Organize and allow navigation between groups of content with Tabs block. Powered by Otter.', 'otter-blocks' ),
	icon,
	keywords: [
		'media',
		'tab',
		'item'
	],
	edit,
	save
});

