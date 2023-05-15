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
import Inspector from './inspector';

const { name } = metadata;

if ( ! window.themeisleGutenberg.isAncestorTypeAvailable ) {
	metadata.parent = [ 'themeisle-blocks/form' ];
}

if ( ! Boolean( window.themeisleGutenberg.hasPro ) ) {
	registerBlockType( name, {
		...metadata,
		title: __( 'File Field (Pro)', 'otter-blocks' ),
		description: __( 'Display a file field for uploading.', 'otter-blocks' ),
		icon,
		keywords: [
			'input',
			'field',
			'file'
		],
		edit: ( props ) => {
			return (
				<Inspector { ...props } />
			);
		},
		save: () => null,
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
				}
			]
		}
	});
}

