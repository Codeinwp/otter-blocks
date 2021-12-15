/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	createBlock,
	registerBlockType
} from '@wordpress/blocks';

import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies.
 */
import Exporter from './exporter.js';
import edit from './importer.js';

registerBlockType( 'themeisle-blocks/importer', {
	apiVersion: 2,
	title: __( 'Import Blocks from JSON', 'otter-blocks' ),
	description: __(
		'Allows you import blocks from a JSON file.',
		'blocks-export-import'
	),
	icon: 'category',
	category: 'widgets',
	keywords: [
		__( 'JSON', 'otter-blocks' ),
		__( 'Importer', 'otter-blocks' ),
		__( 'Import', 'blocks-export-import' )
	],
	attributes: {
		file: {
			type: 'object'
		}
	},
	transforms: {
		from: [
			{
				type: 'files',
				isMatch: ( file ) => 'application/json' === file[ 0 ].type,
				transform: ( file ) =>
					createBlock( 'themeisle-blocks/importer', { file })
			}
		]
	},
	edit,
	save: () => null
});

registerPlugin( 'blocks-export-import', {
	render: Exporter
});
