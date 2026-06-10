/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	ExternalLink,
	TextControl
} from '@wordpress/components';

import { createInterpolateElement } from '@wordpress/element';

const AltTextControl = ({
	label,
	value,
	onChange
}) => {
	return (
		<TextControl
			label={ label || __( 'Alt text (alternative text)', 'otter-blocks' ) }
			value={ value || '' }
			onChange={ onChange }
			help={ createInterpolateElement(
				__( '<a>Describe the purpose of the image.</a> Leave empty if the image is purely decorative.', 'otter-blocks' ),
				{
					a: <ExternalLink href={ __( 'https://www.w3.org/WAI/tutorials/images/decision-tree/', 'otter-blocks' ) } />
				}
			) }
		/>
	);
};

export default AltTextControl;
