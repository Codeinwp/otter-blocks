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
	setAttributes,
	getFields,
	toggleFields,
	imageSize,
	titleTag,
	excerptLimit
}) => {
	const onSortEnd = ({ oldIndex, newIndex })  => {
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
					value={ 'image' }
					disabled={ true }
					getFields={ getFields }
					toggleFields={ toggleFields }
					imageSize={ imageSize }
				/>

				<SortableList
					template={ attributes.template }
					onSortEnd={ onSortEnd }
					getFields={ getFields }
					toggleFields={ toggleFields }
					titleTag={ titleTag }
					excerptLimit={ excerptLimit }
					useDragHandle
					axis="y"
					lockAxis="y"
				/>
			</div>
		</Fragment>
	);
};

export default LayoutBuilder;
