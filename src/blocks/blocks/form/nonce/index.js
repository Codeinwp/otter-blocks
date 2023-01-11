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
import edit from './edit.js';

const { name } = metadata;

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
	edit,
	save: () => null
});
