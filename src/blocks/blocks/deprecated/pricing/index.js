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
	title: __( 'Pricing', 'otter-blocks' ),
	description: __( 'Pricing tables are a critical part in showcasing your services, prices and overall offerings. Powered by Otter.', 'otter-blocks' ),
	keywords: [
		'pricing',
		'table',
		'money'
	],
	edit,
	save,
	example: {
		attributes: {}
	}
});
