/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { buttonsIcon as icon } from '../../../helpers/icons.js';
import attributes from './attributes.js';
import edit from './edit.js';
import save from './save.js';

registerBlockType( 'themeisle-blocks/button', {
	title: __( 'Button', 'otter-blocks' ),
	description: __( 'Prompt visitors to take action with a button group.', 'otter-blocks' ),
	parent: [ 'themeisle-blocks/button-group' ],
	icon,
	category: 'themeisle-blocks',
	keywords: [
		'button',
		'buttons',
		'button group'
	],
	attributes,
	supports: {
		reusable: false
	},
	styles: [
		{
			name: 'fill',
			label: __( 'Fill', 'otter-blocks' ),
			isDefault: true
		},
		{
			name: 'outline',
			label: __( 'Outline', 'otter-blocks' )
		}
	],
	edit,
	save
});
