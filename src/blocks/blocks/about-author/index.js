/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { authorIcon as icon } from '../../helpers/icons.js';
import edit from './edit.js';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'About Author', 'otter-blocks' ),
	description: __( 'About Author block is the easiest way to add a author bio below your posts. Powered by Otter.', 'otter-blocks' ),
	icon,
	keywords: [
		'about',
		'author',
		'profile'
	],
	edit,
	save: () => null,
	example: {}
});
