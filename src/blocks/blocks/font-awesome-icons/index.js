/**
 * WordPress dependencies...
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { faIcon as icon } from '../../helpers/icons.js';
import deprecated from './deprecated.js';
import edit from './edit.js';
import save from './save.js';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Icon', 'otter-blocks' ),
	description: __( 'Add icons from Font Awesome or ThemeIsle Icons library to your website.', 'otter-blocks' ),
	icon,
	keywords: [
		'font awesome',
		'dashicons',
		'icons'
	],
	deprecated,
	edit,
	save
});
