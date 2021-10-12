/**
 * External dependencies
 */
import classnames from 'classnames';

import {
	SortableContainer,
	SortableElement,
	SortableHandle
} from 'react-sortable-hoc';

/**
 * WordPress dependencies
 */
import {
	startCase,
	toLower
} from 'lodash';

import { __ } from '@wordpress/i18n';

import { Button } from '@wordpress/components';

const DragHandle = SortableHandle( () => {
	return (
		<div className="otter-blocks-sortable-handle" tabIndex="0">
			<span></span>
		</div>
	);
});

export const SortableItem = ({
	value,
	hidden,
	toggleFields
}) => {
	const label = startCase( toLower( value ) );
	let icon = 'hidden';
	let message = __( `Display ${ label }`, 'otter-blocks' );

	if ( ! hidden ) {
		icon = 'visibility';
		message = __( `Hide ${ label }`, 'otter-blocks' );
	}

	return (
		<div
			className={ classnames(
				'otter-blocks-sortable-item-area',
				`otter-blocks-sortable-item-area-${ value }`
			) }
		>
			<div
				className={ classnames(
					'otter-blocks-sortable-item',
					{
						'hidden': hidden
					}
				) }
			>
				<DragHandle />

				<div className="otter-blocks-sortable-label">
					{ label }
				</div>

				<Button
					icon={ icon }
					label={ message }
					showTooltip={ true }
					className="otter-blocks-sortable-button"
					onClick={ () =>	toggleFields( value ) }
				/>
			</div>
		</div>
	);
};

const SortableItemContainer = SortableElement( ({
	value,
	hidden,
	toggleFields
}) => {
	return (
		<SortableItem
			value={ value }
			hidden={ hidden }
			toggleFields={ toggleFields }
		/>
	);
});

export const SortableList = SortableContainer( ({
	fields,
	toggleFields
}) => {
	return (
		<div>
			{ fields.map( ( value, index ) => (
				<SortableItemContainer
					key={`item-${ value }`}
					index={ index }
					value={ value }
					hidden={ false }
					toggleFields={ toggleFields }
				/>
			) ) }
		</div>
	);
});

