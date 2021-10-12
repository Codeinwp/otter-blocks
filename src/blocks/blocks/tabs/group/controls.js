/**
 * External dependencies
*/
import { chevronLeft, chevronRight, edit } from '@wordpress/icons';

/**
 * WordPress dependencies
*/
import { __ } from '@wordpress/i18n';

import { BlockControls } from '@wordpress/block-editor';

import {
	ToolbarButton,
	ToolbarGroup
} from '@wordpress/components';

const Controls = ({
	children,
	selectedTab,
	moveTab,
	selectTab
}) => {

	/**
	 * @type {(number|undefined)} The position of the selected tab
	 */
	const index = children?.findIndex( ({ clientId }) => clientId === selectedTab );

	/**
	 * Move the tab to a given direction
	 * @param {('left'|'right')} direction
	 */
	const moveTabTo = ( direction ) => {
		switch ( direction ) {
		case 'left':
			moveTab( selectedTab, index - 1 );
			break;
		case 'right':
			moveTab( selectedTab, index + 1 );
			break;
		}
	};

	return (
		<BlockControls>
			<ToolbarGroup label={ __( 'Edit', 'otter-blocks' ) }>
				<ToolbarButton
					label={ __( 'Edit tab', 'otter-blocks' ) }
					icon={ edit }
					iconSize={ 24 }
					className="wp-block-themeisle-blocks-tabs-toolbar-edit"
					onClick={ () => selectTab( selectedTab ) }
				/>
			</ToolbarGroup>

			<ToolbarGroup label={ __( 'Movement', 'otter-blocks' ) }>
				<ToolbarButton
					label={ __( 'Move tab left', 'otter-blocks' ) }
					icon={ chevronLeft }
					iconSize={ 24 }
					disabled={ 0 === index }
					className="wp-block-themeisle-blocks-tabs-toolbar-mover"
					onClick={ () => moveTabTo( 'left' ) }
				/>

				<ToolbarButton
					label={ __( 'Move tab right', 'otter-blocks' ) }
					icon={ chevronRight }
					iconSize={ 24 }
					disabled={ children?.length - 1 === index }
					className="wp-block-themeisle-blocks-tabs-toolbar-mover"
					onClick={ () => moveTabTo( 'right' ) }
				/>
			</ToolbarGroup>
		</BlockControls>
	);
};

export default Controls;
