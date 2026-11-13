/**
 * Attributes copied from a parent Icon List onto a sub-list inserted in
 * one of its items, so nested structures start out consistent. Values
 * that are not set are skipped and the block defaults apply.
 *
 * The sub-list indent is deliberately not copied: it reaches nested lists
 * live from the parent through CSS inheritance, and a frozen copy would
 * detach the sub-list from the parent's control.
 *
 * @param {Object} [parentAttributes] Attributes of the parent Icon List.
 * @return {Object} Attributes for the new Icon List block.
 */
export const getSubListAttributes = ( parentAttributes ) => {
	if ( ! parentAttributes ) {
		return {};
	}

	const keys = [
		'defaultLibrary',
		'defaultPrefix',
		'defaultIcon',
		'defaultIconId',
		'defaultIconAlt',
		'defaultContentColor',
		'defaultIconColor',
		'defaultSize',
		'defaultIconSize'
	];

	const attributes = {};

	keys.forEach( key => {
		if ( undefined !== parentAttributes[ key ] && null !== parentAttributes[ key ] ) {
			attributes[ key ] = parentAttributes[ key ];
		}
	} );

	return attributes;
};
