/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import edit from './edit.js';
import save from './save.js';
import transforms from './transforms.js';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Progress Bar', 'otter-blocks' ),
	description: __( 'Show your progress with a beautiful Progress Bar block. Powered by Otter.', 'otter-blocks' ),
	icon: 'minus',
	keywords: [
		'progress',
		'bar',
		'skills'
	],
	transforms,
	edit,
	save,
	example: {}
});
