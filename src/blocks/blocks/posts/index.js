/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './style.scss';
import './editor.scss';
import { postsIcon as icon } from '../../helpers/icons.js';
import attributes from './attributes.js';
import deprecated from './deprecated.js';
import edit from './edit.js';

registerBlockType( 'themeisle-blocks/posts-grid', {
	title: __( 'Posts', 'otter-blocks' ),
	description: __( 'Display a list of your most recent posts in a beautiful layout.', 'otter-blocks' ),
	icon,
	category: 'themeisle-blocks',
	keywords: [
		'posts',
		'grid',
		'news'
	],
	attributes,
	supports: {
		align: [ 'wide', 'full' ],
		html: false
	},
	deprecated,
	edit,
	save: () => null
});
