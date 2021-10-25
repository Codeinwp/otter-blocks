/**
 * WordPress dependencies
 */

import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { servicesIcon as icon } from '../../../helpers/icons.js';
import edit from './edit.js';
import save from './save.js';

registerBlockType( 'themeisle-blocks/service', {
	title: __( 'Service', 'otter-blocks' ),
	description: __( 'Use this Service block to showcase services your website offers.', 'otter-blocks' ),
	icon,
	category: 'themeisle-blocks',
	keywords: [
		'services',
		'icon',
		'features'
	],
	edit,
	save
});
