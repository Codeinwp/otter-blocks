/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { createBlock, registerBlockType } from '@wordpress/blocks';

import { useBlockProps } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { formFieldIcon as icon } from '../../../blocks/helpers/icons.js';
import edit from './edit.js';
import { omit } from 'lodash';
import Inactive from '../../components/inactive';


const { name } = metadata;

if ( ! window.themeisleGutenberg.isAncestorTypeAvailable ) {
	metadata.parent = [ 'themeisle-blocks/form' ];
}

if ( ! ( Boolean( window.otterPro.isActive ) && ! Boolean( window.otterPro.isExpired ) ) ) {
	edit = () => <Inactive
		icon={ icon }
		label={ metadata.title }
		blockProps={ useBlockProps() }
	/>;
}


registerBlockType( name, {
	...metadata,
	title: __( 'Hidden Field', 'otter-blocks' ),
	description: __( 'A field used for adding extra metadata to the Form via URL params.', 'otter-blocks' ),
	icon,
	edit,
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
