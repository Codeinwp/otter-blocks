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

if( ! window.themeisleGutenberg.isAncestorTypeAvailable ) {
	metadata['parent'] = [ "themeisle-blocks/form" ];
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
	save
});
