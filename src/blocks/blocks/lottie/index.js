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
import './editor.scss';
import edit from './edit.js';
import save from './save.js';
import attributes from './attributes.js';

registerBlockType( 'themeisle-blocks/lottie', {
	title: __( 'Lottie Animation', 'otter-blocks' ),
	description: __( 'Add Lottie animations to your WordPress.', 'otter-blocks' ),
	icon,
	category: 'themeisle-blocks',
	keywords: [
		'media',
		'lottie',
		'animation'
	],
	attributes,
	supports: {
		align: [ 'left', 'center', 'right' ]
	},
	edit,
	save
});
