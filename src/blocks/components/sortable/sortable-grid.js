/**
 * External dependencies
 */
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors
} from '@dnd-kit/core';
import {
	SortableContext,
	rectSortingStrategy,
	sortableKeyboardCoordinates
} from '@dnd-kit/sortable';

/**
 * WordPress dependencies
 */
import { Fragment, useMemo } from '@wordpress/element';

const SortableGrid = ({
	items = [],
	getItemId,
	onReorder,
	onDragStart,
	activationDistance = 3,
	children,
	className,
	isItemDisabled
}) => {
	const itemIds = useMemo(
		() => items.map( ( item, index ) => getItemId( item, index ) ),
		[ items, getItemId ]
	);

	const sensors = useSensors(
		useSensor( PointerSensor, {
			activationConstraint: { distance: activationDistance }
		}),
		useSensor( KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates
		})
	);

	const handleDragStart = ( event ) => {
		const index = itemIds.indexOf( event.active.id );
		onDragStart?.( index );
	};

	const handleDragEnd = ( event ) => {
		const { active, over } = event;

		const oldIndex = itemIds.indexOf( active.id );

		if ( ! over || active.id === over.id ) {
			onReorder?.({ oldIndex, newIndex: oldIndex, cancelled: true });
			return;
		}

		const newIndex = itemIds.indexOf( over.id );

		if ( -1 === oldIndex || -1 === newIndex ) {
			return;
		}

		onReorder({ oldIndex, newIndex, cancelled: false });
	};

	const handleDragCancel = ( event ) => {
		const oldIndex = itemIds.indexOf( event.active?.id );
		onReorder?.({ oldIndex, newIndex: oldIndex, cancelled: true });
	};

	const renderedItems = items.map( ( item, index ) => children( item, index, getItemId( item, index ), isItemDisabled?.( item, index ) ) );

	return (
		<DndContext
			sensors={ sensors }
			collisionDetection={ closestCenter }
			onDragStart={ handleDragStart }
			onDragEnd={ handleDragEnd }
			onDragCancel={ handleDragCancel }
		>
			<SortableContext
				items={ itemIds }
				strategy={ rectSortingStrategy }
			>
				{ className ? (
					<div className={ className }>
						{ renderedItems }
					</div>
				) : (
					<Fragment>{ renderedItems }</Fragment>
				) }
			</SortableContext>
		</DndContext>
	);
};

export default SortableGrid;
