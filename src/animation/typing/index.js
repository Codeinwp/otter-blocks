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

const name = 'themeisle-blocks/typing-animation';

export const format = {
	name,
	title: __( 'Typing Animation', 'otter-blocks' ),
	tagName: 'o-anim-typing',
	className: null,

	edit: ({
		isActive,
		value,
		onChange,
		contentRef
	}) => {
		const onToggle = () => {
			onChange( toggleFormat( value, { type: name }) );
		};

		return (
			<Fragment>
				<RichTextToolbarButton
					icon={ brush }
					title={ __( 'Typing Animation', 'otter-blocks' ) }
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
