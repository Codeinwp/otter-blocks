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
import type { FormInputProps } from './input/types.d.ts';

const DragHandle = SortableHandle( () => {
	return (
		<div className="wp-block-themeisle-blocks-tabs-inspector-tab-option__drag" tabIndex={ 0 }>
			<span></span>
		</div>
	);
});

type SortableTabProps = {
    item: { parentClientId: string, inputField: FormInputProps}
    actions: {
        select?: ( clientId: string ) => void
        delete?: ( clientId: string ) => void
    }
}

const fieldNames: Record<string, string> = {
	'text': __( 'Text Field', 'otter-blocks' ),
	'email': __( 'Email Field', 'otter-blocks' ),
	'date': __( 'Date Field', 'otter-blocks' ),
	'number': __( 'Number Field', 'otter-blocks' ),
	'textarea': __( 'Textarea Field', 'otter-blocks' ),
	'select': __( 'Select Field', 'otter-blocks' ),
	'checkbox': __( 'Checkbox Field', 'otter-blocks' ),
	'radio': __( 'Radio Field', 'otter-blocks' ),
	'file': __( 'File Field', 'otter-blocks' ),
	'url': __( 'URL Field', 'otter-blocks' ),
	'hidden': __( 'Hidden Field', 'otter-blocks' ),
	'stripe': __( 'Stripe Field', 'otter-blocks' )
};

const extractFieldName = ( input: FormInputProps ) => {
	const tag = input?.name?.replace( 'themeisle-blocks/', '' );

	if ( 'form-input' === tag || 'form-multiple-choice' === tag ) {
		return input.attributes.type ?? 'text';
	}

	if ( 'form-file' === tag ) {
		return 'file';
	}

	if ( 'form-hidden-field' === tag ) {
		return 'hidden';
	}

	if ( 'form-stripe-field' === tag ) {
		return 'stripe';
	}

	return 'textarea';
};

export const SortableInputField = SortableElement( ({ item, actions } : SortableTabProps ) => {
	const { inputField } = item;
	const fieldName = extractFieldName( inputField );

	return (
		<div className="wp-block-themeisle-blocks-tabs-inspector-tab-option">
			<DragHandle />

			<div className="wp-block-themeisle-blocks-tabs-inspector-tab-option__name">
				{ 'stripe' === fieldName ? fieldNames.stripe : ( inputField?.attributes?.label ?? fieldNames[fieldName] ?? __( 'Invalid Field', 'otter-blocks' ) ) }
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
