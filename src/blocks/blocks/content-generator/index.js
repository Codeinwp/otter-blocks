/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { aiGeneration as icon, formAiGeneration } from '../../helpers/icons.js';
import edit from './edit.js';
import './editor.scss';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	icon,
	keywords: [
		'content',
		'ai',
		'layout'
	],
	edit,
	save: () => null,
	variations: [
		{
			name: 'themeisle-blocks/content-generator-form',
			description: __( 'Generate Form with OpenAI.', 'otter-blocks' ),
			icon: formAiGeneration,
			title: __( 'AI Form Generator', 'otter-blocks' ),
			scope: [ 'block' ],
			attributes: {
				promptID: 'form'
			}
		}
	]
});
