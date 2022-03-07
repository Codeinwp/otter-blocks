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

import {
	__,
	sprintf
} from '@wordpress/i18n';

import { Button } from '@wordpress/components';

const DragHandle = SortableHandle( () => {
	return (
		<div className="o-sortable-handle" tabIndex="0">
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

	/* translators: %s Label */
	let message = sprintf( __( 'Display %s', 'otter-blocks' ), label );

	if ( ! hidden ) {
		icon = 'visibility';

		/* translators: %s Label */
		message = sprintf( __( 'Hide %s', 'otter-blocks' ), label );
	}

	return (
		<div
			className={ classnames(
				'o-sortable-item-area',
				`o-sortable-item-area-${ value }`
			) }
		>
			<div
				className={ classnames(
					'o-sortable-item',
					{
						'hidden': hidden
					}
				) }
			>
				<DragHandle />

				<div className="o-sortable-label">
					{ label }
				</div>

				<Button
					icon={ icon }
					label={ message }
					showTooltip={ true }
					className="o-sortable-button"
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
					key={ `item-${ value }` }
					index={ index }
					value={ value }
					hidden={ false }
					toggleFields={ toggleFields }
				/>
			) ) }
		</div>
	);
});

