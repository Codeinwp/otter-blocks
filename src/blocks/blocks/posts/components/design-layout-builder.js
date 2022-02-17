/**
 * External dependencies
 */
import arrayMove from 'array-move';

import classnames from 'classnames';

import { v4 as uuidv4 } from 'uuid';

/**
 * WordPress dependencies
 */
import { Fragment } from '@wordpress/element';
import {
	Button
} from '@wordpress/components';
import {
	__
} from '@wordpress/i18n';

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
					template={ 'image' }
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

				<Button
					variant="primary"
					isPrimary
					onClick={ () => {

						let id = uuidv4();
						while ( 0 < attributes?.customMetas?.filter( ({ otherId }) => otherId === id )?.length  ) {
							id = uuidv4();
						}
						id = `custom_${id}`;

						const newMeta = {
							id,
							field: '',
							before: '',
							after: '',
							display: true
						};

						setAttributes({
							template: [ ...attributes.template, id ],
							customMetas: attributes.customMetas ? [ ...attributes.customMetas, newMeta ] : [ newMeta ]
						});
					}}
				>
					{ __( 'Add custom type', 'otter-blocks' ) }
				</Button>
			</div>
		</Fragment>
	);
};

export default LayoutBuilder;
