/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	Dashicon,
	Button,
	ToolbarGroup,
	Tooltip
} from '@wordpress/components';

import { BlockControls } from '@wordpress/block-editor';

const Controls = ({ setAttributes }) => {
	return (
		<BlockControls>
			<ToolbarGroup>
				<Tooltip text={ __( 'Edit', 'otter-blocks' ) }>
					<Button
						className="components-icon-button components-toolbar__control wp-block-themeisle-blocks-plugin-cards-edit-plugin-card"
						onClick={ () => setAttributes({ slug: undefined }) }
					>
						<Dashicon icon="edit" />
					</Button>
				</Tooltip>
			</ToolbarGroup>
		</BlockControls>
	);
};

export default Controls;
