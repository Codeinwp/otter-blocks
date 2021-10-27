/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	Dashicon,
	Button,
	Toolbar,
	Tooltip
} from '@wordpress/components';

import { BlockControls } from '@wordpress/block-editor';

const Controls = ({
	isEditing,
	setEditing
}) => {
	return (
		<BlockControls>
			<Toolbar>
				<Tooltip text={ isEditing ? __( 'Save', 'otter-blocks' ) : __( 'Edit', 'otter-blocks' ) }>
					<Button
						onClick={ () => setEditing( ! isEditing ) }
					>
						<Dashicon icon={ isEditing ? 'yes' : 'edit' } />
					</Button>
				</Tooltip>
			</Toolbar>
		</BlockControls>
	);
};

export default Controls;
