/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { SortableDragHandle, useSortableRow } from '../../../../components/sortable/index.js';

export const SortableTab = ({ id, tab, deleteTab, selectTab }) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		style
	} = useSortableRow( id );

	return (
		<div
			ref={ setNodeRef }
			style={ style }
			className="wp-block-themeisle-blocks-tabs-inspector-tab-option"
		>
			<SortableDragHandle
				listeners={ listeners }
				attributes={ attributes }
			/>

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
};
