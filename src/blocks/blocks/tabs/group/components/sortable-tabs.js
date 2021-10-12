/**
 * External dependencies
*/
import {
	SortableElement,
	SortableHandle
} from 'react-sortable-hoc';

/**
 * WordPress dependencies
*/
import { __ } from '@wordpress/i18n';

import { Button } from '@wordpress/components';

const DragHandle = SortableHandle( () => {
	return (
		<div className="wp-block-themeisle-blocks-tabs-inspector-tab-option__drag" tabIndex="0">
			<span></span>
		</div>
	);
});

export const SortableTab = SortableElement( ({ tab, deleteTab, selectTab }) => {
	return (
		<div className="wp-block-themeisle-blocks-tabs-inspector-tab-option">
			<DragHandle/>

			<div className="wp-block-themeisle-blocks-tabs-inspector-tab-option__name">
				{ tab.attributes.title || __( 'Untitled Tab', 'otter-blocks' ) }
			</div>

			<Button
				icon="edit"
				label={ __( 'Edit Tab', 'otter-blocks' ) }
				showTooltip={ true }
				className="wp-block-themeisle-blocks-tabs-inspector-tab-option__actions"
				onClick={ () => selectTab( tab.clientId ) }
			/>

			<Button
				icon="no-alt"
				label={ __( 'Remove Tab', 'otter-blocks' ) }
				showTooltip={ true }
				className="wp-block-themeisle-blocks-tabs-inspector-tab-option__actions"
				onClick={ () => deleteTab( tab.clientId ) }
			/>
		</div>
	);
});


