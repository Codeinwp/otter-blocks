/**
 * External dependencies
 */
import classnames from 'classnames';

import { SortableElement } from 'react-sortable-hoc';

/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';

const SortableItem = SortableElement( ({
	value,
	selected,
	dragging,
	sorting,
	selectedItemsCount,
	onClick
}) => {
	const shouldRenderItemCountBadge = dragging && 1 < selectedItemsCount;

	return (
		<Button
			className={ classnames(
				'otter-images-grid-component__image',
				{
					'is-selected': selected,
					'is-sorting': selected && sorting
				}
			) }
			onClick={ () => onClick( value ) }
			style={ {
				backgroundImage: `url( ' ${ value.url } ' )`
			} }
		>
			{ shouldRenderItemCountBadge && <div className="otter-images-grid-component__image__count">{ selectedItemsCount }</div> }
		</Button>
	);
});

export default SortableItem;
