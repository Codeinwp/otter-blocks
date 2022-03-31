/**
 * External dependencies.
 */
import { globe } from '@wordpress/icons';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { registerFormatType } from '@wordpress/rich-text';

/**
 * Internal dependencies.
 */
import './autocompleter.js';
import edit from './edit.js';

const name = 'themeisle-blocks/dynamic-value';

registerFormatType( name, {
	title: __( 'Dynamic Value', 'otter-blocks' ),
	tagName: 'o-dynamic',
	className: null,
	attributes: {
		type: 'data-type'
	},
	edit
});
