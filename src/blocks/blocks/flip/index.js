/**
 * External dependencies
 */
import { rotateRight as icon } from '@wordpress/icons';

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
	title: __( 'Flip Card', 'otter-blocks' ),
	description: __( 'Make a card with a flip effect. Powered by Otter.', 'otter-blocks' ),
	icon,
	keywords: [
		'flip card',
		'container',
		'animation'
	],
	edit,
	save
});
