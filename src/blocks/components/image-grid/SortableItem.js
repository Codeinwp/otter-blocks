/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { useSortableRow } from '../sortable/index.js';

const SortableItem = ({
	id,
	value,
	selected,
	dragging,
	sorting,
	selectedItemsCount,
	onClick,
	disabled
}) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		style
	} = useSortableRow( id, disabled );

	const shouldRenderItemCountBadge = dragging && 1 < selectedItemsCount;

	return (
		<Button
			ref={ setNodeRef }
			className={ classnames(
				'o-images-grid-component__image',
				{
					'is-selected': selected,
					'is-sorting': selected && sorting
				}
			) }
			onClick={ () => onClick( value ) }
			{ ...listeners }
			{ ...attributes }
			style={ {
				...style,
				backgroundImage: `url( ' ${ value.url } ' )`
			} }
		>
			{ shouldRenderItemCountBadge && <div className="o-images-grid-component__image__count">{ selectedItemsCount }</div> }
		</Button>
	);
};

export default SortableItem;
