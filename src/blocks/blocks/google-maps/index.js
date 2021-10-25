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
import { mapIcon as icon } from '../../helpers/icons.js';
import attributes from './attributes.js';
import edit from './edit.js';
import transforms from './transforms.js';

registerBlockType( 'themeisle-blocks/google-map', {
	title: __( 'Google Maps', 'otter-blocks' ),
	description: __( 'Display Google Maps on your website with Google Map block.', 'otter-blocks' ),
	icon,
	category: 'themeisle-blocks',
	keywords: [
		'map',
		'google',
		'orbitfox'
	],
	attributes,
	supports: {
		align: [ 'wide', 'full' ],
		html: false
	},
	transforms,
	edit,
	save: () => null
});
