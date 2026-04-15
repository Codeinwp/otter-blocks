/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	BaseControl,
	Placeholder,
	Spinner,
	TextControl
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import { Fragment } from '@wordpress/element';

const ALLOWED_ACF_TYPES = [
	'url'
];

/**
 * Recursively flatten ACF fields into <option> elements for a <select> control.
 *
 * @param {Array}  fields - ACF field objects at the current nesting level.
 * @param {number} depth  - Current depth (0 = direct children of an ACF group).
 * @return {Array} Flat array of <option> React elements.
 */
const FIELD_INDENT = '\u00A0\u00A0\u00A0';

const flattenACFOptions = ( fields, depth = 0 ) => {
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
						{ `${ indent }${ label }` }
					</option>,
					...flattenACFOptions( subFields || [], depth + 1 )
				];
			}

			if ( ALLOWED_ACF_TYPES.includes( type ) ) {
				return [
					<option key={ key } value={ key }>
						{ `${ indent }${ label }` }
					</option>
				];
			}

			return [];
		} );
};

const Edit = ({
	attributes,
	changeAttributes
}) => {
	const {
		isLoaded,
		groups
	} = useSelect( select => {
		const { groups } = select( 'otter-pro' ).getACFData();
		const isLoaded = select( 'otter-pro' ).isACFLoaded();

		return {
			isLoaded,
			groups
		};
	}, []);

	return (
		<Fragment>
			{ ( 'acfURL' === attributes.type && Boolean( window.otterPro.hasACF ) ) && (
				<BaseControl
					label={ __( 'Meta Key', 'otter-pro' ) }
				>
					{ isLoaded ? (
						<select
							value={ attributes.metaKey || 'none' }
							onChange={ event => changeAttributes({ metaKey: event.target.value  }) }
							className="components-select-control__input"
						>
							<option value="none">{ __( 'Select a field', 'otter-pro' ) }</option>

							{ groups.map( group => {
								return (
									<optgroup
										key={ group?.data?.key }
										label={ group?.data?.title }
									>
										{ flattenACFOptions( group?.fields || [] ) }
									</optgroup>
								);
							}) }
						</select>
					) : <Placeholder><Spinner /></Placeholder> }
				</BaseControl>
			) }

			{ ( 'acfURL' === attributes.type && ! Boolean( window.otterPro.hasACF ) ) && (
				<p>{ __( 'You need to have Advanced Custom Fields plugin installed to use this feature.', 'otter-pro' ) }</p>
			) }

			{ 'postMetaURL' === attributes.type && (
				<TextControl
					label={ __( 'Custom Meta Key', 'otter-pro' ) }
					value={ attributes.metaKey }
					onChange={ metaKey => changeAttributes({ metaKey }) }
				/>
			) }
		</Fragment>
	);
};

export default Edit;
