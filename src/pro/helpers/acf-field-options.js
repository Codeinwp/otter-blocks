/**
 * Shared ACF field option renderer.
 *
 * Centralises the logic for flattening ACF field trees into a valid flat list
 * of <option> elements, so that value, link, and image selectors all behave
 * consistently and draw from the same code path.
 *
 * ACF returns sub-fields under the `sub_fields` property (snake_case). This
 * module reads that property directly from the field objects supplied by the
 * `otter-pro` store, which preserves the raw REST-API shape from
 * `otter/v1/acf-fields`.
 */

const FIELD_INDENT = '\u00A0\u00A0\u00A0';

/**
 * Recursively flatten ACF fields into <option> elements for a <select> control.
 *
 * Repeater fields are rendered as disabled header options so that sub-fields at
 * any depth remain reachable from a flat <select> list (nested <optgroup> is
 * invalid HTML and not supported by browsers).
 *
 * @param {Array}    fields       ACF field objects at the current nesting level.
 * @param {string[]} allowedTypes ACF field types to render as selectable <option> elements.
 * @param {number}   depth        Current depth (0 = direct children of an ACF group).
 * @return {Array} Flat array of <option> React elements.
 */
export const flattenACFFieldOptions = ( fields, allowedTypes, depth = 0 ) => {
	if ( ! fields?.length ) {
		return [];
	}

	const indent = FIELD_INDENT.repeat( depth );

	return fields
		.filter( ({ key, label }) => key && label )
		.flatMap( ({ key, label, type, sub_fields: subFields }) => {
			if ( 'repeater' === type ) {
				return [
					// Disabled header option representing the repeater itself.
					<option key={ `repeater-header-${ key }` } disabled value="">
						{ `${ indent }${ label }` }
					</option>,
					// Sub-fields indented one level deeper.
					...flattenACFFieldOptions( subFields || [], allowedTypes, depth + 1 )
				];
			}

			if ( allowedTypes.includes( type ) ) {
				return [
					<option key={ key } value={ key }>
						{ `${ indent }${ label }` }
					</option>
				];
			}

			return [];
		} );
};
