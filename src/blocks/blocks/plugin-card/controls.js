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

const Controls = ({ setAttributes }) => {
	return (
		<BlockControls>
			<Toolbar>
				<Tooltip text={ __( 'Edit', 'otter-blocks' ) }>
					<Button
						className="components-icon-button components-toolbar__control wp-block-themeisle-blocks-plugin-cards-edit-plugin-card"
						onClick={ () => setAttributes({ slug: undefined }) }
					>
						<Dashicon icon="edit" />
					</Button>
				</Tooltip>
			</Toolbar>
		</BlockControls>
	);
};

export default Controls;
