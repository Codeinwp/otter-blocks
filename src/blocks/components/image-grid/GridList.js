/**
 * External dependencies
 */
import arrayMove from 'array-move';

import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useRef, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import SortableList from './SortableList.js';

const GridList = ({
	attributes,
	onSelectImages,
	open
}) => {
	const [ selectedItems, setSelectedItems ] = useState([]);
	const [ isSorting, setIsSorting ] = useState( false );
	const [ sortingItemKey, setSortingItemKey ] = useState( null );
	const containerRef = useRef( null );

	const handleUpdateBeforeSortStart = ({ index }) => {
		return new Promise( resolve => {
			setIsSorting( true );
			setSortingItemKey( attributes.images[ index ]);
			resolve();
		});
	};

	const onSortEnd = ({
		oldIndex,
		newIndex
	}) => {
		let newItems = arrayMove( attributes.images, oldIndex, newIndex );

		if ( selectedItems.length ) {
			newItems = [
				...newItems.slice( 0, newIndex ).filter( item => ! selectedItems.includes( item ) ),
				...selectedItems,
				...newItems.slice( newIndex, newItems.length ).filter( item => ! selectedItems.includes( item ) )
			];
		}

		setIsSorting( false );
		setSortingItemKey( null );
		setSelectedItems([]);
		onSelectImages( newItems );

		// Remove all extra nodes that react-sortable-hoc adds to the DOM but doesn't remove after sorting is done.
		document.querySelectorAll( '.o-images-grid-component__image' ).forEach( node => {
			if ( ! containerRef.current?.container.contains?.( node ) ) {

				// Hide the node until it can be removed to prevent a flash of unstyled content.
				node.style.display = 'none';
				setTimeout( () => {

					// Remove the node after a short delay to allow the transition to finish.
					node.remove();
				}, 250 );
			}
		});
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

	const handleShouldCancelStart = event => {
		if ( ! event.target.sortableInfo ) {
			return false;
		}

		const items = attributes.images;

		const item = items[event.target.sortableInfo.index];

		if ( ! selectedItems.length ) {
			return false;
		}

		return ! selectedItems.includes( item );
	};

	return (
		<SortableList
			className={ classnames(
				'o-images-grid-component',
				{ 'is-single': 1 === attributes.images.length }
			) }
			open={ open }
			items={ attributes.images }
			onItemSelect={ handleItemSelect }
			selectedItems={ selectedItems }
			isSorting={ isSorting }
			sortingItemKey={ sortingItemKey }
			shouldCancelStart={ handleShouldCancelStart }
			updateBeforeSortStart={ handleUpdateBeforeSortStart }
			onSortEnd={ onSortEnd }
			distance={ 3 }
			axis="xy"
			ref={ containerRef }
		/>
	);
};

export default GridList;
