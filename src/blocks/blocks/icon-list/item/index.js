/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { iconListItemIcon as icon } from '../../../helpers/icons.js';
import edit from './edit.js';
import save from './save.js';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Icon List Item', 'otter-blocks' ),
	description: __( 'Display an item for the icon list. Powered by Otter.', 'otter-blocks' ),
	icon,
	keywords: [
		'item',
		'icon',
		'list'
	],
	merge( attributes, attributesToMerge ) {
		return {
			content: ( attributes.content || '' ) + ( attributesToMerge.content || '' )
		};
	},
	edit,
	save
});
