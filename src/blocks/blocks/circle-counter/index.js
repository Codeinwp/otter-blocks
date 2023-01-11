/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { circleIcon as icon } from '../../helpers/icons.js';
import edit from './edit.js';
import save from './save.js';
import transforms from './transforms.js';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Circle Counter', 'otter-blocks' ),
	description: __( 'Show your progress with a beautiful Circle Counter block. Powered by Otter.', 'otter-blocks' ),
	icon,
	keywords: [
		'progress',
		'circle',
		'counter'
	],
	transforms,
	edit,
	save,
	example: {
		attributes: {
			title: 'Lorem ipsum'
		}
	}
});
