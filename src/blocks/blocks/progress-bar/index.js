/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import attributes from './attributes.js';
import edit from './edit.js';
import save from './save.js';
import transforms from './transforms.js';

registerBlockType( 'themeisle-blocks/progress-bar', {
	apiVersion: 2,
	title: __( 'Progress Bar', 'otter-blocks' ),
	description: __( 'Show your progress with a beautiful Progress Bar block.', 'otter-blocks' ),
	icon: 'minus',
	category: 'themeisle-blocks',
	keywords: [
		'progress',
		'bar',
		'skills'
	],
	attributes,
	transforms,
	edit,
	save
});
