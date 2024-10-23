/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType, createBlock } from '@wordpress/blocks';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { formFieldIcon as icon } from '../../../helpers/icons.js';
import edit from './edit.js';
import save from './save.js';
import deprecated from './deprecated.js';

const { name } = metadata;

if ( ! window.themeisleGutenberg.isAncestorTypeAvailable ) {
	metadata.parent = [ 'themeisle-blocks/form' ];
}

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
			icon,
			title: __( 'Email Field', 'otter-blocks' ),
			attributes: {
				type: 'email'
			}
		},
		{
			name: 'themeisle-blocks/form-input-date',
			description: __( 'Insert a date field', 'otter-blocks' ),
			icon,
			title: __( 'Date Field', 'otter-blocks' ),
			attributes: {
				type: 'date'
			}
		},
		{
			name: 'themeisle-blocks/form-input-number',
			description: __( 'Insert a number field', 'otter-blocks' ),
			icon,
			title: __( 'Number Field', 'otter-blocks' ),
			attributes: {
				type: 'number'
			}
		},
		{
			name: 'themeisle-blocks/form-input-url',
			description: __( 'Insert an URL field', 'otter-blocks' ),
			icon,
			title: __( 'URL Field', 'otter-blocks' ),
			attributes: {
				type: 'url',
				placeholder: 'https://'
			}
		}
	],
	edit,
	save,
	transforms: {
		to: [
			{
				type: 'block',
				blocks: [ 'themeisle-blocks/form-textarea' ],
				transform: ( attributes ) => {
					const attrs = omit( attributes, [ 'type' ]);
					return createBlock( 'themeisle-blocks/form-textarea', {
						...attrs
					});
				}
			},
			{
				type: 'block',
				blocks: [ 'themeisle-blocks/form-multiple-choice' ],
				transform: ( attributes ) => {
					const attrs = omit( attributes, [ 'type' ]);
					return createBlock( 'themeisle-blocks/form-multiple-choice', {
						...attrs
					});
				}
			},
			{
				type: 'block',
				blocks: [ 'themeisle-blocks/form-file' ],
				transform: ( attributes ) => {
					const attrs = omit( attributes, [ 'type' ]);
					return createBlock( 'themeisle-blocks/form-file', {
						...attrs
					});
				}
			},
			{
				type: 'block',
				blocks: [ 'themeisle-blocks/form-hidden-field' ],
				transform: ( attributes ) => {
					const attrs = omit( attributes, [ 'type' ]);
					return createBlock( 'themeisle-blocks/form-hidden-field', {
						...attrs
					});
				}
			},
			{
				type: 'block',
				blocks: [ 'themeisle-blocks/form-stripe-field' ],
				transform: ( attributes ) => {
					const attrs = omit( attributes, [ 'type' ]);
					return createBlock( 'themeisle-blocks/form-stripe-field', {
						...attrs
					});
				}
			}
		]
	}
});
