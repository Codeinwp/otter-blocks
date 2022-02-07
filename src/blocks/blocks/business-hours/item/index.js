/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { mapIcon as icon } from '../../../helpers/icons.js';
import edit from './edit.js';
import save from './save.js';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Business Hours Item', 'otter-blocks' ),
	description: __( 'Item used by Business Hours block to display the time.', 'otter-blocks' ),
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
