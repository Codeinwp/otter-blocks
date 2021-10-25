/**
 * External dependencies
 */
import { edit } from '@wordpress/icons';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { BlockControls } from '@wordpress/block-editor';

import {
	ToolbarGroup,
	ToolbarButton
} from '@wordpress/components';

const Controls = ({
	onEdit
}) => {
	return (
		<BlockControls>
			<ToolbarGroup>
				<ToolbarButton
					label={ __( 'Edit', 'otter-blocks' ) }
					icon={ edit }
					onClick={ onEdit }
				/>
			</ToolbarGroup>
		</BlockControls>
	);
};

export default Controls;
