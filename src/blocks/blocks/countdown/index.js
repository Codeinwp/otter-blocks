/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { countdownIcon as icon } from '../../helpers/icons.js';
import edit from './edit';
import save from './save';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Countdown', 'otter-blocks' ),
	description: __( 'Set a countdown for a date. Powered by Otter.', 'otter-blocks' ),
	icon,
	keywords: [
		'countdown',
		'time',
		'counter'
	],
	edit,
	save,
	example: {
		attributes: {
			date: '2024-07-15T15:03:00'
		}
	}
});

