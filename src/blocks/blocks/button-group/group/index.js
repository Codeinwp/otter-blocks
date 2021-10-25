/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { buttonsIcon as icon } from '../../../helpers/icons.js';
import attributes from './attributes.js';
import deprecated from './deprecated.js';
import edit from './edit.js';
import save from './save.js';

registerBlockType( 'themeisle-blocks/button-group', {
	title: __( 'Button Group', 'otter-blocks' ),
	description: __( 'Prompt visitors to take action with a button group.', 'otter-blocks' ),
	icon,
	category: 'themeisle-blocks',
	keywords: [
		'button',
		'buttons',
		'button group'
	],
	attributes,
	deprecated,
	edit,
	save
});
