/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { pluginsIcon as icon } from '../../helpers/icons.js';
import edit from './edit.js';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Plugin Card', 'otter-blocks' ),
	description: __( 'Plugin Card block lets you display plugins data in your blog posts.', 'otter-blocks' ),
	icon,
	keywords: [
		'plugin',
		'card',
		'orbitfox'
	],
	edit,
	save: () => null
});
