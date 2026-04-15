/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	BaseControl,
	Placeholder,
	Spinner
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

const ALLOWED_ACF_IMAGE_TYPES = [ 'image', 'url' ];

const FIELD_INDENT = '\u00A0\u00A0\u00A0';

/**
 * Recursively flatten ACF fields into <option> elements for a <select> control.
 *
 * @param {Array}  fields - ACF field objects at the current nesting level.
 * @param {number} depth  - Current depth (0 = direct children of an ACF group).
 * @return {Array} Flat array of <option> React elements.
 */
const flattenACFImageOptions = ( fields, depth = 0 ) => {
	if ( ! fields?.length ) {
		return [];
	}

	const indent = FIELD_INDENT.repeat( depth );

	return fields
		.filter( ({ key, label }) => key && label )
		.flatMap( ({ key, label, type, subFields }) => {
			if ( 'repeater' === type ) {
				return [
					<option key={ `repeater-header-${ key }` } disabled value="">
						{ `${ indent } ${ label }` }
					</option>,
					...flattenACFImageOptions( subFields || [], depth + 1 )
				];
			}

			if ( ALLOWED_ACF_IMAGE_TYPES.includes( type ) ) {
				return [
					<option key={ key } value={ key }>
						{ `${ indent }${ label }` }
					</option>
				];
			}

			return [];
		} );
};

const ACFImageSelect = ({
	label,
	value,
	onChange
}) => {
	const { groups, isLoaded } = useSelect( select => {
		const { groups } = select( 'otter-pro' ).getACFData();
		const isLoaded = select( 'otter-pro' ).isACFLoaded();

		return {
			groups,
			isLoaded
		};
	}, []);

	if ( ! isLoaded ) {
		return <Placeholder><Spinner /></Placeholder>;
	}

	return (
		<BaseControl label={ label }>
			<select
				value={ value || 'none' }
				onChange={ event => onChange( event.target.value ) }
				className="components-select-control__input"
			>
				<option value="none">{ __( 'Select a field', 'otter-pro' ) }</option>

				{ groups.map( group => (
					<optgroup
						key={ group?.data?.key }
						label={ group?.data?.title }
					>
						{ flattenACFImageOptions( group?.fields || [] ) }
					</optgroup>
				) ) }
			</select>
		</BaseControl>
	);
};

export default ACFImageSelect;
