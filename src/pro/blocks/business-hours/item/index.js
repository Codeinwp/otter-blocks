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

const { mapIcon: icon } = window.otterUtils.icons;

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Business Hours Item', 'otter-blocks' ),
	description: __( 'Item used by Business Hours block to display the time. Powered by Otter.', 'otter-blocks' ),
	icon,
	parent: [ 'themeisle-blocks/business-hours' ],
	category: 'themeisle-blocks',
	keywords: [
		'business',
		'time',
		'schedule'
	],
	supports: {
		align: [ 'wide', 'full' ]
	},
	edit,
	save
});
