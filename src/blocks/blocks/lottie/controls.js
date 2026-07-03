/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	Dashicon,
	ToolbarButton,
	ToolbarGroup
} from '@wordpress/components';

import { BlockControls } from '@wordpress/block-editor';

const Controls = ({
	isEditing,
	setEditing
}) => {
	return (
		<BlockControls>
			<ToolbarGroup>
				<ToolbarButton
					label={ isEditing ? __( 'Save', 'otter-blocks' ) : __( 'Edit', 'otter-blocks' ) }
					showTooltip={ true }
					onClick={ () => setEditing( ! isEditing ) }
				>
					<Dashicon icon={ isEditing ? 'yes' : 'edit' } />
				</ToolbarButton>
			</ToolbarGroup>
		</BlockControls>
	);
};

export default Controls;
