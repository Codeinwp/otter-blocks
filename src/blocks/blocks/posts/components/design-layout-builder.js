/**
 * External dependencies
 */
import arrayMove from 'array-move';

import classnames from 'classnames';

import { v4 as uuidv4 } from 'uuid';

import { intersection, remove } from 'lodash';

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

	const filterDeadCustomTemplates = () => {

		const validCustomTemplates = intersection(
			attributes.template,
			attributes?.customMetas?.map( ({ id }) => id )
		);

		return {
			template: attributes?.template.filter( t => ! t.startsWith( 'custom_' ) || ( validCustomTemplates.includes( t ) ) ),
			customMetas: attributes.customMetas?.filter ( ({ id }) => validCustomTemplates.includes( id ) )
		};
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
					variant="secondary"
					isSecondary
					className="otter-conditions__add"
					onClick={ () => {

						let id = uuidv4();
						while ( 0 < attributes?.customMetas?.filter( ({ otherId }) => otherId === id )?.length  ) {
							id = uuidv4();
						}
						id = `custom_${id}`;

						const newMeta = {
							id,
							field: [],
							before: '',
							after: '',
							display: true
						};

						const {
							template,
							customMetas
						} = filterDeadCustomTemplates();

						setAttributes({
							template: [ ...template, id ],
							customMetas: customMetas ? [ ...customMetas, newMeta ] : [ newMeta ]
						});
					}}
				>
					{ __( 'Add Meta Field', 'otter-blocks' ) }
				</Button>
			</div>
		</Fragment>
	);
};

export default LayoutBuilder;
