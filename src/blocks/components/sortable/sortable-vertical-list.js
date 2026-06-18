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
	sortableKeyboardCoordinates,
	verticalListSortingStrategy
} from '@dnd-kit/sortable';

/**
 * WordPress dependencies
 */
import { useMemo } from '@wordpress/element';

const SortableVerticalList = ({
	items = [],
	getItemId,
	onReorder,
	children,
	className,
	isItemDisabled
}) => {
	const itemIds = useMemo(
		() => items.map( ( item, index ) => getItemId( item, index ) ),
		[ items, getItemId ]
	);

	const sensors = useSensors(
		useSensor( PointerSensor ),
		useSensor( KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates
		})
	);

	const handleDragEnd = ( event ) => {
		const { active, over } = event;

		if ( ! over || active.id === over.id ) {
			return;
		}

		const oldIndex = itemIds.indexOf( active.id );
		const newIndex = itemIds.indexOf( over.id );

		if ( -1 === oldIndex || -1 === newIndex ) {
			return;
		}

		onReorder( oldIndex, newIndex );
	};

	return (
		<DndContext
			sensors={ sensors }
			collisionDetection={ closestCenter }
			onDragEnd={ handleDragEnd }
		>
			<SortableContext
				items={ itemIds }
				strategy={ verticalListSortingStrategy }
			>
				<div className={ className }>
					{ items.map( ( item, index ) => children( item, index, getItemId( item, index ), isItemDisabled?.( item, index ) ) ) }
				</div>
			</SortableContext>
		</DndContext>
	);
};

export default SortableVerticalList;
