/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './style.scss';
import './editor.scss';
import { faIcon as icon } from '../../helpers/icons.js';
import attributes from './attributes.js';
import edit from './edit.js';
import save from './save.js';

registerBlockType( 'themeisle-blocks/icon-list', {
	title: __( 'Icon List', 'otter-blocks' ),
	description: __( 'Display an icon list in a beautiful layout.', 'otter-blocks' ),
	icon,
	category: 'themeisle-blocks',
	keywords: [
		'icon',
		'list',
		'items'
	],
	attributes,
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
	save
});
