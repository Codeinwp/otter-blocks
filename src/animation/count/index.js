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
	RichTextShortcut,
	RichTextToolbarButton
} from '@wordpress/block-editor';

import { Fragment } from '@wordpress/element';
import './editor.scss';

const name = 'themeisle-blocks/count-animation';

/**
 *
 * @param {string} text
 */
const isValidNumberFormat = ( text ) => {
	return Array.from( text ).every( x => '0123456789.,-+$%'.includes( x ) );
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
