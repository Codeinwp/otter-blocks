/**
 * External dependencies
 */
import { stack as icon } from '@wordpress/icons';

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
	title: __( 'Popup', 'otter-blocks' ),
	description: __( 'Display your content in beautiful popup with many customization options.', 'otter-blocks' ),
	icon,
	keywords: [
		'popup',
		'modal',
		'lightbox'
	],
	edit,
	save
});
