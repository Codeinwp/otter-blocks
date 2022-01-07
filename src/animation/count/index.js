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

registerFormatType( name, {
	title: __( 'Count Animation', 'otter-blocks' ),
	tagName: 'o-anim-count',
	className: null,

	edit: ({ isActive, value, onChange }) => {
		const onToggle = () => onChange( toggleFormat( value, { type: name }) );

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
