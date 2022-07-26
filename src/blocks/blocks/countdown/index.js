/**
 * External dependencies
 */
import { calendar as icon } from '@wordpress/icons';

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

