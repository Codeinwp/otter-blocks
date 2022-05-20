/**
 * WordPress dependencies.
 */
import {
	BlockAlignmentToolbar,
	BlockControls
} from '@wordpress/block-editor';

const Controls = ({
	attributes,
	setAttributes
}) => {
	return (
		<BlockControls>
			<BlockAlignmentToolbar
				value={ attributes.align }
				onChange={ e => setAttributes({ align: e }) }
				controls={ [ 'none', 'left', 'center', 'right', 'full' ] }
			/>
		</BlockControls>
	);
};

export default Controls;
