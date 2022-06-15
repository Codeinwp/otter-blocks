/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { mapIcon as icon } from '../../helpers/icons.js';
import edit from './edit.js';
import transforms from './transforms.js';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Maps', 'otter-blocks' ),
	description: __( 'Display Open Street Maps on your website with Maps block. Powered by Otter.', 'otter-blocks' ),
	icon,
	keywords: [
		'map',
		'opeenstreetmap',
		'location'
	],
	transforms,
	edit,
	save: () => null
});
