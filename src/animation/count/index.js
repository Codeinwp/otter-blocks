/**
 * External dependencies.
 */
import { brush } from '@wordpress/icons';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	registerFormatType,
	toggleFormat
} from '@wordpress/rich-text';

import {
	RichTextToolbarButton
} from '@wordpress/block-editor';

import { Fragment } from '@wordpress/element';
import './editor.scss';

const name = 'themeisle-blocks/count-animation';

// List to all characters that are in a number structure
const NUMERIC_FORMATS = new Set( Array.from( '0123456789,.' ) );
const OTHER_FORMATS = new Set( Array.from( '-+$%€' ) );

/**
 *
 * @param {string} text
 */
const isValidNumberFormat = ( text ) => {
	return Array.from( text ).every( x => NUMERIC_FORMATS.has( x ) || OTHER_FORMATS.has( x ) );
};


registerFormatType( name, {
	title: __( 'Count Animation', 'otter-blocks' ),
	tagName: 'o-anim-count',
	className: null,

	edit: ({ isActive, value, onChange }) => {
		const onToggle = () => onChange( toggleFormat( value, { type: name }) );

		if ( ! isValidNumberFormat( value.text.slice( value.start, value.end ) ) ) {
			return null;
		}

		return (
			<Fragment>
				<RichTextToolbarButton
					icon={ brush }
					title={ __( 'Apply Count Animation', 'otter-blocks' ) }
					onClick={ onToggle }
					isActive={ isActive }
				/>
			</Fragment>
		);
	}
});
