/**
 * External dependencies
 */
import { arrayMove } from '@dnd-kit/sortable';

import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	Icon,
	plus
} from '@wordpress/icons';

import { __ } from '@wordpress/i18n';

import { useState } from '@wordpress/element';

import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { SortableGrid } from '../sortable/index.js';
import SortableItem from './SortableItem.js';

const GridList = ({
	attributes,
	onSelectImages,
	open
}) => {
	const [ selectedItems, setSelectedItems ] = useState([]);
	const [ isSorting, setIsSorting ] = useState( false );
	const [ sortingItemKey, setSortingItemKey ] = useState( null );

	const handleDragStart = ( index ) => {
		setIsSorting( true );
		setSortingItemKey( attributes.images[ index ] );
	};

	const handleReorder = ({ oldIndex, newIndex, cancelled }) => {
		setIsSorting( false );
		setSortingItemKey( null );

		if ( cancelled || oldIndex === newIndex ) {
			return;
		}

		let newItems = arrayMove( attributes.images, oldIndex, newIndex );

		if ( selectedItems.length ) {
			newItems = [
				...newItems.slice( 0, newIndex ).filter( item => ! selectedItems.includes( item ) ),
				...selectedItems,
				...newItems.slice( newIndex, newItems.length ).filter( item => ! selectedItems.includes( item ) )
			];
		}

		setSelectedItems([]);
		onSelectImages( newItems );
	};

	const handleItemSelect = item => {
		let items;
		if ( selectedItems.includes( item ) ) {
			items = selectedItems.filter( value => value !== item );
		} else {
			items = [ ...selectedItems, item ];
		}

		setSelectedItems( items );
	};

	const isItemDisabled = item => {
		if ( ! selectedItems.length ) {
			return false;
		}

		return ! selectedItems.includes( item );
	};

	return (
		<div
			className={ classnames(
				'o-images-grid-component',
				{ 'is-single': 1 === attributes.images.length }
			) }
			tabIndex="0"
		>
			<SortableGrid
				items={ attributes.images }
				getItemId={ ( item ) => item.id }
				onDragStart={ handleDragStart }
				onReorder={ handleReorder }
				activationDistance={ 3 }
				isItemDisabled={ isItemDisabled }
			>
				{ ( item ) => {
					const isSelected = selectedItems.includes( item );
					const itemIsBeingDragged = sortingItemKey === item;

					return (
						<SortableItem
							key={ `image-${ item.id }` }
							id={ item.id }
							value={ item }
							selected={ isSelected }
							dragging={ itemIsBeingDragged }
							sorting={ isSorting }
							selectedItemsCount={ selectedItems.length }
							onClick={ handleItemSelect }
							disabled={ isItemDisabled( item ) }
						/>
					);
				} }
			</SortableGrid>

			<Button
				label={ __( 'Add Images', 'otter-blocks' ) }
				icon={ <Icon icon={ plus } /> }
				isPrimary
				onClick={ open }
			/>
		</div>
	);
};

export default GridList;
