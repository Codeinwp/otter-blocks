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
	description: __( 'Add a Section block that displays content in multiple columns, then add whatever content blocks you’d like. Powered by Otter.', 'otter-blocks' ),
	icon,
	keywords: [
		'advanced columns',
		'layout',
		'section'
	],
	deprecated,
	variations,
	edit,
	save,
	example: {
		viewportWidth: 1000,
		attributes: {},
		innerBlocks: [
			{
				name: 'themeisle-blocks/advanced-column',
				attributes: {
					margin: {
						right: '10px'
					}
				},
				innerBlocks: [
					{
						name: 'core/paragraph',
						attributes: {
							content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent et eros eu felis.',
							
						}
					},
					{
						name: 'core/image',
						attributes: {
							url: 'https://s.w.org/images/core/5.3/Windbuchencom.jpg'
						}
					},
					{
						name: 'core/paragraph',
						attributes: {
							content: 'Suspendisse commodo neque lacus, a dictum orci interdum et.'
						}
					}
				]
			},
			{
				name: 'themeisle-blocks/advanced-column',
				attributes: {
					margin: {
						left: '10px'
					}
				},
				innerBlocks: [
					{
						name: 'core/paragraph',
						attributes: {
							content: 'Etiam et egestas lorem. Vivamus sagittis sit amet dolor quis lobortis. Integer sed fermentum arcu, id vulputate lacus. Etiam fermentum sem eu quam hendrerit.'
						}
					},
					{
						name: 'core/paragraph',
						attributes: {
							content: 'Nam risus massa, ullamcorper consectetur eros fermentum, porta aliquet ligula. Sed vel mauris nec enim.'
						}
					}
				]
			}
		]
	}
});
