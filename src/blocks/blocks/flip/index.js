/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { flipIcon as icon } from '../../helpers/icons.js';
import edit from './edit';
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
	save,
	example: {
		attributes: {}
	}
});
