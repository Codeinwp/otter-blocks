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
import './style.scss';
import './editor.scss';
import attributes from './attributes.js';
import edit from './edit.js';
import save from './save.js';
import transforms from './transforms.js';

registerBlockType( 'themeisle-blocks/circle-counter', {
	title: __( 'Circle Counter', 'otter-blocks' ),
	description: __( 'Show your progress with a beautiful Circle Counter block.', 'otter-blocks' ),
	icon,
	category: 'themeisle-blocks',
	keywords: [
		'progress',
		'circle',
		'counter'
	],
	attributes,
	transforms,
	edit,
	save
});
