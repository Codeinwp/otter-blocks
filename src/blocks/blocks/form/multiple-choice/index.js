/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

import { createBlock } from '@wordpress/blocks';

import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { formFieldIcon as icon } from '../../../helpers/icons.js';
import edit from './edit.js';

const { name } = metadata;

if ( ! window.themeisleGutenberg.isAncestorTypeAvailable ) {
	metadata.parent = [ 'themeisle-blocks/form' ];
}

registerBlockType( name, {
	...metadata,
	title: __( 'Multiple Choice Field', 'otter-blocks' ),
	description: __( 'Display a checkbox or radio list.', 'otter-blocks' ),
	icon,
	variations: [
		{
			name: 'themeisle-blocks/form-input-checkbox',
			description: __( 'Insert a checkbox list field', 'otter-blocks' ),
			icon: icon,
			title: __( 'Checkbox Field', 'otter-blocks' ),
			attributes: {
				type: 'checkbox'
			}
		},
		{
			name: 'themeisle-blocks/form-input-radio',
			description: __( 'Insert a radio list field', 'otter-blocks' ),
			icon: icon,
			title: __( 'Radio Field', 'otter-blocks' ),
			attributes: {
				type: 'radio'
			}
		},
		{
			name: 'themeisle-blocks/form-input-select',
			description: __( 'Insert a select field', 'otter-blocks' ),
			icon: icon,
			title: __( 'Select Field', 'otter-blocks' ),
			attributes: {
				type: 'select'
			}
		}
	],
	edit,
	save: () => null,
	transforms: {
		to: [
			{
				type: 'block',
				blocks: [ 'themeisle-blocks/form-input' ],
				transform: ( attributes ) => {
					const attrs = omit( attributes, [ 'type', 'multipleChoice', 'options' ]);
					return createBlock( 'themeisle-blocks/form-input', {
						...attrs
					});
				}
			},
			{
				type: 'block',
				blocks: [ 'themeisle-blocks/form-textarea' ],
				transform: ( attributes ) => {
					const attrs = omit( attributes, [ 'type', 'multipleChoice', 'options' ]);
					return createBlock( 'themeisle-blocks/form-textarea', {
						...attrs
					});
				}
			}
		]
	}
});
