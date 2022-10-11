/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	BlockVerticalAlignmentToolbar,
	BlockControls
} from '@wordpress/block-editor';

const Controls = ({
	attributes,
	setAttributes
}) => {
	const BlockAlignmentControl = BlockVerticalAlignmentToolbar;

	return (
		<BlockControls>
			<BlockAlignmentControl
				label={ __( 'Change Vertical Alignment', 'otter-blocks' ) }
				value={ attributes.verticalAlign }
				onChange={ verticalAlign => setAttributes({ verticalAlign }) }
			/>
		</BlockControls>
	);
};

export default Controls;
