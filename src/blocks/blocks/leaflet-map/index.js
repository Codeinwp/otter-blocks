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

registerBlockType( 'themeisle-blocks/leaflet-map', {
	title: __( 'Maps', 'otter-blocks' ),
	description: __( 'Display Open Street Maps on your website with Maps block.', 'otter-blocks' ),
	icon,
	category: 'themeisle-blocks',
	keywords: [
		'map',
		'opeenstreetmap',
		'location'
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
