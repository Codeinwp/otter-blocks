/**
 * WordPress dependencies.
 */
import {
	AlignmentControl,
	BlockControls
} from '@wordpress/block-editor';

const Controls = ({
	attributes,
	setAttributes
}) => {
	return (
		<BlockControls>
			<AlignmentControl
				value={ attributes.titleAlignment }
				onChange={ titleAlignment => setAttributes({ titleAlignment }) }
			/>
		</BlockControls>
	);
};

export default Controls;
