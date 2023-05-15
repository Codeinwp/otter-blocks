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
import save from './save.js';
import deprecated from './deprecated.js';

const { name } = metadata;

if ( ! window.themeisleGutenberg.isAncestorTypeAvailable ) {
	metadata.parent = [ 'themeisle-blocks/form' ];
}

registerBlockType( name, {
	...metadata,
	title: __( 'Textarea Field', 'otter-blocks' ),
	description: __( 'Display a contact form for your clients.', 'otter-blocks' ),
	icon,
	deprecated,
	keywords: [
		'textarea',
		'message',
		'input'
	],
	edit,
	save,
	transforms: {
		to: [
			{
				type: 'block',
				blocks: [ 'themeisle-blocks/form-input' ],
				transform: ( attributes ) => {

					return createBlock( 'themeisle-blocks/form-input', {
						...attributes
					});
				}
			},
			{
				type: 'block',
				blocks: [ 'themeisle-blocks/form-multiple-choice' ],
				transform: ( attributes ) => {

					return createBlock( 'themeisle-blocks/form-multiple-choice', {
						...attributes
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
			}
		]
	}
});
