/**
 * External dependencies.
 */
import { brush } from '@wordpress/icons';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { RichTextToolbarButton } from '@wordpress/block-editor';

import { Fragment } from '@wordpress/element';

import {
	registerFormatType,
	toggleFormat
} from '@wordpress/rich-text';

/**
 * Internal dependencies.
 */
import InlineControls from './inline-controls.js';

const name = 'themeisle-blocks/count-animation';

export const format = {
	name,
	title: __( 'Count Animation', 'otter-blocks' ),
	tagName: 'o-anim-count',
	className: null,

	edit: ({
		isActive,
		value,
		onChange,
		contentRef
	}) => {
		const regex = /^\$?[\d,]+(\.\d*)?$/;

		const onToggle = () => {
			if ( isActive || ( ! isActive && null !== regex.exec( value.text.substring( value.start, value.end ) ) ) ) {
				onChange( toggleFormat( value, { type: name }) );
			}
		};

		return (
			<Fragment>
				<RichTextToolbarButton
					icon={ brush }
					title={ __( 'Count Animation', 'otter-blocks' ) }
					isDisabled={ ! isActive && null === regex.exec( value.text.substring( value.start, value.end ) ) }
					onClick={ onToggle }
					isActive={ isActive }
				/>

				{ isActive && (
					<InlineControls
						value={ value }
						contentRef={ contentRef }
					/>
				) }
			</Fragment>
		);
	}
};

registerFormatType( name, format );
