/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { faIcon as icon } from '../../helpers/icons.js';
import edit from './edit.js';
import save from './save.js';
import './item/index.js';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Icon List', 'otter-blocks' ),
	description: __( 'Display an icon list in a beautiful layout. Powered by Otter.', 'otter-blocks' ),
	icon,
	keywords: [
		'icon',
		'list',
		'items'
	],
	styles: [
		{
			name: 'vertical',
			label: __( 'Vertical', 'otter-blocks' ),
			isDefault: true
		},
		{
			name: 'horizontal',
			label: __( 'Horizontal', 'otter-blocks' )
		}
	],
	edit,
	save,
	example: {
		innerBlocks: [
			{
				name: 'themeisle-blocks/icon-list-item',
				attributes: {
					content: __( 'List Item 1', 'otter-blocks' )
				}
			},
			{
				name: 'themeisle-blocks/icon-list-item',
				attributes: {
					content: __( 'List Item 2', 'otter-blocks' )
				}
			},
			{
				name: 'themeisle-blocks/icon-list-item',
				attributes: {
					content: __( 'List Item 3', 'otter-blocks' )
				}
			}
		]
	}
});
