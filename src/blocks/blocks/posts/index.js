/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { postsIcon as icon } from '../../helpers/icons.js';
import deprecated from './deprecated.js';
import edit from './edit.js';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Posts', 'otter-blocks' ),
	description: __( 'Display a list of your most recent posts in a beautiful layout. Powered by Otter.', 'otter-blocks' ),
	icon,
	keywords: [
		'posts',
		'grid',
		'news'
	],
	deprecated,
	edit,
	save: () => null,
	example: {
		attributes: {}
	}
});
