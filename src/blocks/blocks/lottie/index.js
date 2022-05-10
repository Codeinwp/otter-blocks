/**
 * External dependencies
 */
import { video as icon } from '@wordpress/icons';

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

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Lottie Animation', 'otter-blocks' ),
	description: __( 'Add Lottie animations to your WordPress.', 'otter-blocks' ),
	icon,
	keywords: [
		'media',
		'lottie',
		'animation'
	],
	edit,
	save
});
