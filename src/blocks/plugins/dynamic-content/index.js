/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { registerFormatType } from '@wordpress/rich-text';

/**
 * Internal dependencies.
 */
import './editor.scss';
import './autocompleter.js';
import edit from './edit.js';

registerFormatType( 'themeisle-blocks/dynamic-value', {
	title: __( 'Dynamic Value', 'otter-blocks' ),
	tagName: 'o-dynamic',
	className: null,
	attributes: {
		type: 'data-type',
		before: 'data-before',
		after: 'data-after',
		length: 'data-length',
		dateType: 'data-date-type',
		dateFormat: 'data-date-format',
		dateCustom: 'data-date-custom',
		timeType: 'data-time-type',
		timeFormat: 'data-time-format',
		timeCustom: 'data-time-custom'
	},
	edit
});
