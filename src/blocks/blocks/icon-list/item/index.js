/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { faIcon as icon } from '../../../helpers/icons.js';
import attributes from './attributes.js';
import edit from './edit.js';
import save from './save.js';

registerBlockType( 'themeisle-blocks/icon-list-item', {
	title: __( 'Icon List Item', 'otter-blocks' ),
	description: __( 'Display an item for the icon list.', 'otter-blocks' ),
	icon,
	attributes,
	category: 'themeisle-blocks',
	parent: [ 'themeisle-blocks/icon-list' ],
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
