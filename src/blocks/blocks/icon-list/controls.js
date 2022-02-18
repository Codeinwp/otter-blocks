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
	const value = {
		'flex-start': 'left',
		'center': 'center',
		'flex-end': 'right'
	};

	return (
		<BlockControls>
			<AlignmentToolbar
				value={ value[ attributes.horizontalAlign ] }
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
					default:
						setAttributes({ horizontalAlign: undefined });
					}
				} }
			/>
		</BlockControls>
	);
};

export default Controls;
