/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { buttonsIcon as icon } from '../../../helpers/icons.js';
import edit from './edit.js';
import save from './save.js';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Button', 'otter-blocks' ),
	description: __( 'Prompt visitors to take action with a button group. Powered by Otter.', 'otter-blocks' ),
	icon,
	keywords: [
		'button',
		'buttons',
		'button group'
	],
	styles: [
		{
			name: 'fill',
			label: __( 'Fill', 'otter-blocks' ),
			isDefault: true
		},
		{
			name: 'outline',
			label: __( 'Outline', 'otter-blocks' )
		},
		... window.themeisleGutenberg.hasNeve ? [
			{
				name: 'primary',
				label: __( 'Primary', 'otter-blocks' )
			},
			{
				name: 'secondary',
				label: __( 'Secondary', 'otter-blocks' )
			}
		] : []
	],
	edit,
	save,
	example: {
		attributes: {}
	}
});
