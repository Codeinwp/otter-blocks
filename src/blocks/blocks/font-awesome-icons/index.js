/**
 * WordPress dependencies...
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './style.scss';
import './editor.scss';
import { faIcon as icon } from '../../helpers/icons.js';
import attributes from './attributes.js';
import deprecated from './deprecated.js';
import edit from './edit.js';
import save from './save.js';

registerBlockType( 'themeisle-blocks/font-awesome-icons', {
	title: __( 'Icon', 'otter-blocks' ),
	description: __( 'Add icons from Font Awesome or ThemeIsle Icons library to your website.', 'otter-blocks' ),
	icon,
	category: 'themeisle-blocks',
	keywords: [
		'font awesome',
		'dashicons',
		'icons'
	],
	attributes,
	deprecated,
	edit,
	save
});
