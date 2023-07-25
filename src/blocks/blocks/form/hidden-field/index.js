/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { createBlock, registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { formFieldIcon as icon } from '../../../helpers/icons.js';
import Inspector from './inspector';
import { omit } from 'lodash';

const { name } = metadata;

if ( ! window.themeisleGutenberg.isAncestorTypeAvailable ) {
	metadata.parent = [ 'themeisle-blocks/form' ];
}

if ( ! Boolean( window.themeisleGutenberg.hasPro ) ) {

	registerBlockType( name, {
		...metadata,
		title: __( 'Hidden Field (PRO)', 'otter-blocks' ),
		description: __( 'A field used for adding extra metadata to the Form via URL params.', 'otter-blocks' ),
		icon,
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

}
