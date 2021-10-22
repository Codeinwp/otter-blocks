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

registerBlockType( 'themeisle-blocks/flip-item', {
	title: __( 'Flip Item Block', 'otter-blocks' ),
	description: __( 'Make a container with for the Flip effect.', 'otter-blocks' ),
	parent: [ 'themeisle-blocks/flip' ],
	icon,
	category: 'themeisle-blocks',
	keywords: [
		'flip',
		'container',
		'animation'
	],
	attributes,
	edit,
	save
});
