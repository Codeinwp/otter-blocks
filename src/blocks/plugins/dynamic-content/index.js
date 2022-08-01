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
import './media/media-library.js';

const name = 'themeisle-blocks/dynamic-value';

export const format = {
	name,
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
		timeCustom: 'data-time-custom',
		termType: 'data-term-type',
		termSeparator: 'data-term-separator',
		metaKey: 'data-meta-key'
	},
	edit
};

registerFormatType( name, format );
