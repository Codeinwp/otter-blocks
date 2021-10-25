/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './editor.scss';
import './style.scss';
import { authorIcon as icon } from '../../helpers/icons.js';
import edit from './edit.js';

registerBlockType( 'themeisle-blocks/about-author', {
	title: __( 'About Author', 'otter-blocks' ),
	description: __( 'About Author block is the easiest way to add a author bio below your posts.', 'otter-blocks' ),
	icon,
	category: 'themeisle-blocks',
	keywords: [
		'about',
		'author',
		'profile'
	],
	supports: {
		html: false
	},
	edit,
	save: () => null
});
