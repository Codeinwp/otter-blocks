/**
 * External dependencies
 */
import arrayMove from 'array-move';

import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { SortableItem, SortableList } from './sortable.js';

const LayoutBuilder = ({
	attributes,
	setAttributes
}) => {
	const onSortEnd = ({ oldIndex, newIndex }) => {
		const template = arrayMove( attributes.template, oldIndex, newIndex );
		setAttributes({ template });
	};

	return (
		<Fragment>
			<div
				className={ classnames(
					'otter-blocks-sortable',
					attributes.style
				) }
			>
				<SortableItem
					attributes={ attributes }
					setAttributes={ setAttributes }
					value={ 'image' }
					disabled={ true }
				/>

				<SortableList
					attributes={ attributes }
					setAttributes={ setAttributes }
					onSortEnd={ onSortEnd }
					useDragHandle
					axis="y"
					lockAxis="y"
				/>
			</div>
		</Fragment>
	);
};

export default LayoutBuilder;
