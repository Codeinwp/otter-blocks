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
import './style.scss';
import './editor.scss';
import attributes from './attributes.js';
import edit from './edit.js';
import save from './save.js';

registerBlockType( 'themeisle-blocks/countdown', {
	title: __( 'Countdown', 'otter-blocks' ),
	description: __( 'Set a countdown for a date.', 'otter-blocks' ),
	icon,
	category: 'themeisle-blocks',
	keywords: [
		'countdown',
		'time',
		'counter'
	],
	supports: {
		align: [ 'wide', 'full' ]
	},
	attributes,
	edit,
	save
});

