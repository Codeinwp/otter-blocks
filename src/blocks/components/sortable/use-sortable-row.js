/**
 * External dependencies
 */
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export const useSortableRow = ( id, disabled = false ) => {
	
	const normalizedDisabled = 'boolean' === typeof disabled ? { draggable: disabled, droppable: false } : disabled;

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging
	} = useSortable({ id, disabled: normalizedDisabled });

	const style = {
		transform: CSS.Transform.toString( transform ),
		transition
	};

	return {
		attributes,
		listeners,
		setNodeRef,
		style,
		isDragging
	};
};
