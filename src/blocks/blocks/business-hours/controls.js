/**
 * WordPress dependencies.
 */
import {
	AlignmentControl,
	AlignmentToolbar,
	BlockControls
} from '@wordpress/block-editor';

const Controls = ({
	attributes,
	setAttributes
}) => {
	const Alignment = AlignmentControl || AlignmentToolbar;

	return (
		<BlockControls>
			<Alignment
				value={ attributes.titleAlignment }
				onChange={ titleAlignment => setAttributes({ titleAlignment }) }
			/>
		</BlockControls>
	);
};

export default Controls;
