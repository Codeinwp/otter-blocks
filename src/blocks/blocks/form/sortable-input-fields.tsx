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
import { type FormInputProps } from './input/types';

const DragHandle = SortableHandle( () => {
	return (
		<div className="wp-block-themeisle-blocks-tabs-inspector-tab-option__drag" tabIndex="0">
			<span></span>
		</div>
	);
});

type SortableTabProps = {
    inputField: FormInputProps
    actions: {
        select: ( clientId: string ) => void
        delete: ( clientId: string ) => void
    }
}

export const SortableInputField = SortableElement( ({ inputField, actions } : SortableTabProps ) => {
	return (
		<div className="wp-block-themeisle-blocks-tabs-inspector-tab-option">
			<DragHandle />

			<div className="wp-block-themeisle-blocks-tabs-inspector-tab-option__name">
				{ inputField.attributes.type || __( 'Untitled Tab', 'otter-blocks' ) }
			</div>

			<Button
				icon="edit"
				label={ __( 'Edit Field', 'otter-blocks' ) }
				showTooltip={ true }
				className="wp-block-themeisle-blocks-tabs-inspector-tab-option__actions"
				onClick={ () => actions?.select?.( inputField.clientId ) }
			/>

			<Button
				icon="no-alt"
				label={ __( 'Remove Field', 'otter-blocks' ) }
				showTooltip={ true }
				className="wp-block-themeisle-blocks-tabs-inspector-tab-option__actions"
				onClick={ () => actions?.delete?.( inputField.clientId ) }
			/>
		</div>
	);
});
