/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { formFieldIcon as icon } from '../../../helpers/icons.js';
import Inspector from '../file/inspector';

const { name } = metadata;

if ( ! window.themeisleGutenberg.isAncestorTypeAvailable ) {
	metadata.parent = [ 'themeisle-blocks/form' ];
}

if ( ! Boolean( window.themeisleGutenberg.hasPro ) ) {

	registerBlockType( name, {
		...metadata,
		title: __( 'Nonce Field', 'otter-blocks' ),
		description: __( 'Protect the form from CSRF.', 'otter-blocks' ),
		icon,
		keywords: [
			'protection',
			'csrf',
			'field'
		],
		edit: ( props ) => {
			return (
				<Inspector { ...props } />
			);
		},
		save: () => null
	});

}
