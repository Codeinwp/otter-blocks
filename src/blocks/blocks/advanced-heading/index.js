/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './editor.scss';
import './style.scss';
import './registerHeadingHighlight.js';
import { headingIcon as icon } from '../../helpers/icons.js';
import attributes from './attributes.js';
import deprecated from './deprecated.js';
import transforms from './transforms.js';
import edit from './edit.js';
import save from './save.js';

registerBlockType( 'themeisle-blocks/advanced-heading', {
	title: __( 'Advanced Heading', 'otter-blocks' ),
	description: __( 'Advanced Heading gives a spin to editor\'s Heading block with much needed customization options.', 'otter-blocks' ),
	icon,
	category: 'themeisle-blocks',
	keywords: [
		'heading',
		'title',
		'advanced Heading'
	],
	attributes,
	deprecated,
	transforms,
	edit,
	save
});
