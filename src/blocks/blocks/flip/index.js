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

registerBlockType( 'themeisle-blocks/flip', {
	apiVersion: 2,
	title: __( 'Flip Card', 'otter-blocks' ),
	description: __( 'Make a card with a flip effect.', 'otter-blocks' ),
	icon,
	category: 'themeisle-blocks',
	keywords: [
		'flip card',
		'container',
		'animation'
	],
	attributes,
	edit,
	save
});
