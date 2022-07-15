/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import './registerHeadingHighlight.js';
import { headingIcon as icon } from '../../helpers/icons.js';
import deprecated from './deprecated.js';
import transforms from './transforms.js';
import edit from './edit.js';
import save from './save.js';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Advanced Heading', 'otter-blocks' ),
	description: __( 'Advanced Heading gives a spin to editor\'s Heading block with much needed customization options. Powered by Otter.', 'otter-blocks' ),
	icon,
	keywords: [
		'heading',
		'title',
		'advanced heading'
	],
	deprecated,
	transforms,
	edit,
	save,
	example: {
		attributes: {
			content: 'Lorem ipsum dolor sit amet, eu liber saperet est.'
		}
	}
});
