/**
 * WordPress dependencies
 */

import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { servicesIcon as icon } from '../../../helpers/icons.js';
import edit from './edit.js';
import save from './save.js';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Service', 'otter-blocks' ),
	description: __( 'Use this Service block to showcase services your website offers.', 'otter-blocks' ),
	icon,
	keywords: [
		'services',
		'icon',
		'features'
	],
	edit,
	save
});
