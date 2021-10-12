/**
 * External dependencies
 */
import arrayMove from 'array-move';

/**
 * Internal dependencies
 */
import { SortableItem, SortableList } from './sortable.js';

const LayoutBuilder = ({
	attributes,
	setAttributes
}) => {
	const onSortEnd = ({ oldIndex, newIndex })  => {
		const fields = JSON.stringify( arrayMove( JSON.parse( attributes.fields ), oldIndex, newIndex ) );
		setAttributes({ fields });
	};

	let template = JSON.parse( window.themeisleGutenberg.themeMods.defaultFields );
	template = template.filter( item => ! JSON.parse( attributes.fields ).includes( item ) );


	const toggleFields = value => {
		const fields = JSON.parse( attributes.fields );

		if ( fields.includes( value ) ) {
			fields.splice( fields.indexOf( value ), 1 );
		} else {
			fields.push( value );
		}

		setAttributes({ fields: JSON.stringify( fields ) });
	};

	return (
		<div className="otter-blocks-sortable">
			<SortableList
				template={ window.themeisleGutenberg.themeMods.defaultFields }
				fields={ JSON.parse( attributes.fields ) }
				toggleFields={ toggleFields }
				onSortEnd={ onSortEnd }
				useDragHandle
				axis="y"
				lockAxis="y"
			/>

			{ template.map( ( value, index ) => (
				<SortableItem
					key={`item-${ value }`}
					index={ index }
					value={ value }
					hidden={ true }
					toggleFields={ toggleFields }
				/>
			) ) }

		</div>
	);
};

export default LayoutBuilder;
