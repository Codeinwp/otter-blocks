/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { registerFormatType } from '@wordpress/rich-text';

/**
 * Internal dependencies.
 */
import edit from './edit.js';

export const name = 'themeisle-blocks/dynamic-link';

export const format = {
	name,
	title: __( 'Dynamic link', 'otter-blocks' ),
	tagName: 'o-dynamic-link',
	className: null,
	attributes: {
		type: 'data-type',
		target: 'data-target'
	},
	edit
};

registerFormatType( name, format );
