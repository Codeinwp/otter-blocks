/**
 * External dependencies.
 */
import {
	alignCenter,
	alignLeft,
	alignRight
} from '@wordpress/icons';

/**
 * WordPress dependencies.
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
				value={ attributes.align }
				onChange={ e => setAttributes({ align: e }) }
				alignmentControls={ [
					{
						icon: alignLeft,
						title: __( 'Align left', 'otter-blocks' ),
						align: 'left'
					},
					{
						icon: alignCenter,
						title: __( 'Align center', 'otter-blocks' ),
						align: 'center'
					},
					{
						icon: alignRight,
						title: __( 'Align right', 'otter-blocks' ),
						align: 'right'
					}
				] }
			/>
		</BlockControls>
	);
};

export default Controls;
