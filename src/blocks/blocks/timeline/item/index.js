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
import { timelineIcon } from '../../../helpers/icons';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Timeline Item', 'otter-blocks' ),
	description: __( 'Organize your events in a timeline with the Timeline block. Powered by Otter.', 'otter-blocks' ),
	icon: timelineIcon,
	edit,
	save,
	example: {
		viewportWidth: 1000,
		attributes: {},
		innerBlocks: [

		]
	}
});
