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
import './editor.scss';
import './style.scss';
import attributes from './attributes.js';
import edit from './edit.js';
import save from './save.js';

registerBlockType( 'themeisle-blocks/popup', {
	title: __( 'Popup', 'otter-blocks' ),
	description: __( 'Display your content in beautiful popup with many customization options..', 'otter-blocks' ),
	icon,
	category: 'themeisle-blocks',
	keywords: [
		'popup',
		'modal',
		'lightbox'
	],
	attributes,
	edit,
	save
});
