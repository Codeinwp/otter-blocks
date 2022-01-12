/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	AlignmentToolbar,
	BlockControls
} from '@wordpress/block-editor';

const Controls = ({
	attributes,
	setAttributes
}) => {
	return (
		<BlockControls>
			<AlignmentToolbar
				value={ attributes.horizontalAlign }
				onChange={ align => {
					switch ( align ) {
					case 'left':
						setAttributes({ horizontalAlign: 'flex-start' });
						break;
					case 'center':
						setAttributes({ horizontalAlign: 'center' });
						break;
					case 'right':
						setAttributes({ horizontalAlign: 'flex-end' });
						break;
					}
				} }
			/>
		</BlockControls>
	);
};

export default Controls;
