/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { inputIcon as icon } from '../../../helpers/icons.js';
import edit from './edit.js';
import save from './save.js';
import deprecated from './deprecated.js';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Text Field', 'otter-blocks' ),
	description: __( 'Display a contact form for your clients.', 'otter-blocks' ),
	icon,
	deprecated,
	keywords: [
		'input',
		'text',
		'email'
	],
	variations: [
		{
			name: 'themeisle-blocks/form-input-email',
			description: __( 'Insert an email field', 'otter-blocks' ),
			icon: 'email',
			title: __( 'Email Field', 'otter-blocks' ),
			attributes: {
				type: 'email'
			}
		},
		{
			name: 'themeisle-blocks/form-input-number',
			description: __( 'Insert a number field', 'otter-blocks' ),
			icon: 'calculator',
			title: __( 'Number Field', 'otter-blocks' ),
			attributes: {
				type: 'number'
			}
		},
		{
			name: 'themeisle-blocks/form-input-date',
			description: __( 'Insert a date field', 'otter-blocks' ),
			icon: 'calendar-alt',
			title: __( 'Date Field', 'otter-blocks' ),
			attributes: {
				type: 'date'
			}
		}
	],
	edit,
	save
});
