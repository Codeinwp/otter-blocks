/**
 * One place where an attribute appears in the saved markup.
 *
 * @typedef {Object} HTMLFieldLocation
 * @property {string}  [selector]  Element relative to the block wrapper; the wrapper itself without one.
 * @property {string}  [attribute] Read this HTML attribute of the element.
 * @property {boolean} [html]      Read the element content as markup.
 * @property {boolean} [text]      Read the element content as plain text.
 * @property {boolean} [optional]  Rendered by `save` only for a value, so its absence clears the attribute.
 */

/**
 * Where the comment-stored attributes of static blocks appear in the saved markup,
 * by block name and attribute.
 *
 * @type {Object<string, Object<string, HTMLFieldLocation[]>>}
 */
export const HTML_FIELDS = {
	'themeisle-blocks/countdown': {
		date: [{ attribute: 'data-date' }]
	},
	'themeisle-blocks/progress-bar': {
		title: [
			{ selector: ':scope > .wp-block-themeisle-blocks-progress-bar__outer > .wp-block-themeisle-blocks-progress-bar__outer__title', text: true },
			{ selector: ':scope > .wp-block-themeisle-blocks-progress-bar__area > .wp-block-themeisle-blocks-progress-bar__area__title > span', text: true }
		],
		percentage: [
			{ attribute: 'data-percent' },
			{ selector: ':scope .wp-block-themeisle-blocks-progress-bar__number', text: true }
		]
	},
	'themeisle-blocks/circle-counter': {
		title: [{ selector: ':scope > .wp-block-themeisle-blocks-circle-counter-title__area > .wp-block-themeisle-blocks-circle-counter-title__value', text: true }],
		percentage: [{ attribute: 'data-percentage' }]
	},
	'themeisle-blocks/icon-list-item': {
		content: [{ selector: ':scope > p', html: true }]
	},
	'themeisle-blocks/business-hours-item': {
		label: [{ selector: ':scope > .otter-business-hour-item__label > span', html: true }],
		time: [{ selector: ':scope > .otter-business-hour-item__time > span', html: true }]
	},
	'themeisle-blocks/form-input': {
		label: [{ selector: ':scope > label > .otter-form-input-label__label', html: true }],
		placeholder: [{ selector: ':scope > input', attribute: 'placeholder', optional: true }],
		helpText: [{ selector: ':scope > .o-form-help', text: true, optional: true }]
	},
	'themeisle-blocks/form-textarea': {
		label: [{ selector: ':scope > label > .otter-form-textarea-label__label', html: true }],
		placeholder: [{ selector: ':scope > textarea', attribute: 'placeholder', optional: true }],
		helpText: [{ selector: ':scope > .o-form-help', text: true, optional: true }]
	}
};

/**
 * Parse markup into an inert fragment.
 *
 * @param {string} html The markup.
 * @return {DocumentFragment} The fragment.
 */
const toFragment = ( html ) => {
	const template = document.createElement( 'template' );
	template.innerHTML = html;

	return template.content;
};

/**
 * Find the element of a location in the block wrapper.
 *
 * @param {Element}           root     The block wrapper.
 * @param {HTMLFieldLocation} location The location.
 * @return {Element|null} The element.
 */
const findNode = ( root, location ) => location.selector ? root.querySelector( location.selector ) : root;

/**
 * Read one location of an attribute from the block wrapper.
 *
 * @param {Element}           root     The block wrapper.
 * @param {HTMLFieldLocation} location The location.
 * @return {string|undefined} The raw value, or undefined when absent.
 */
const readLocation = ( root, location ) => {
	const node = findNode( root, location );

	if ( ! node ) {
		return undefined;
	}

	if ( location.attribute ) {
		return node.hasAttribute( location.attribute ) ? node.getAttribute( location.attribute ) : undefined;
	}

	return location.html ? node.innerHTML : node.textContent;
};

/**
 * Convert a raw value to the attribute type.
 *
 * @param {string} value The raw value.
 * @param {string} type  The attribute type.
 * @return {string|number|undefined} The value, or undefined when it does not fit the type.
 */
const toType = ( value, type ) => {
	if ( 'number' !== type ) {
		return value;
	}

	const stripped = value.trim().replace( /%$/, '' ).trim();

	return '' === stripped || isNaN( Number( stripped ) ) ? undefined : Number( stripped );
};

/**
 * Serialize a stored attribute the way the markup reads it, so both compare equal.
 * Values read from the markup are already serialized and are never parsed again.
 *
 * @param {string|number|undefined} current The stored attribute.
 * @param {boolean}                 isHTML  Whether the attribute is markup.
 * @return {string} The serialized attribute.
 */
const serializeStored = ( current, isHTML ) => {
	const string = undefined === current ? '' : String( current );

	return isHTML ? toFragment( `<div>${ string }</div>` ).firstChild.innerHTML : string;
};

/**
 * Find the first location whose value differs from the stored attribute.
 *
 * @param {Element}                 root      The block wrapper.
 * @param {HTMLFieldLocation[]}     locations The attribute locations.
 * @param {string|number|undefined} current   The stored attribute.
 * @param {string|undefined}        type      The attribute type.
 * @return {{value: string|number|undefined}|null} The changed or cleared value, or null when unchanged.
 */
const findChangedValue = ( root, locations, current, type ) => {
	for ( const location of locations ) {
		const raw = readLocation( root, location );

		if ( undefined === raw ) {
			if ( location.optional && undefined !== current && '' !== current ) {
				return { value: undefined };
			}

			continue;
		}

		const value = toType( raw, type );

		if ( undefined !== value && String( value ) !== serializeStored( current, location.html ) ) {
			return { value };
		}
	}

	return null;
};

/**
 * Read back the comment-stored attributes that were changed in the block markup,
 * so an "Edit as HTML" change is kept instead of invalidating the block.
 *
 * A value rendered in several places is taken from the first place that differs
 * from the stored attribute.
 *
 * @param {Object}                                                       attributes The parsed attributes.
 * @param {{name: string, attributes?: Object<string, {type?: string}>}} blockType  The block type.
 * @param {string|Node}                                                  innerHTML  The block markup.
 * @return {Object} The attributes.
 */
export const getAttributesFromHTML = ( attributes, blockType, innerHTML ) => {
	const fields = HTML_FIELDS[ blockType?.name ];

	if ( ! fields || ! innerHTML ) {
		return attributes;
	}

	const root = 'string' === typeof innerHTML ? toFragment( innerHTML ).firstElementChild : innerHTML.firstElementChild;

	if ( ! root ) {
		return attributes;
	}

	let changed = null;

	Object.entries( fields ).forEach( ([ key, locations ]) => {
		const current = attributes?.[ key ];

		if ( undefined !== current && ! [ 'string', 'number' ].includes( typeof current ) ) {
			return;
		}

		const found = findChangedValue( root, locations, current, blockType.attributes?.[ key ]?.type );

		if ( found ) {
			changed = { ...( changed ?? attributes ), [ key ]: found.value };
		}
	});

	return changed ?? attributes;
};

/**
 * Rewrite the other copies of a value rendered in several places to the stored
 * attribute, so an HTML edit of one copy matches the markup `save` regenerates.
 * Only attributes and plain text are rewritten, never markup.
 *
 * @param {Object}                                                       attributes The block attributes.
 * @param {{name: string, attributes?: Object<string, {type?: string}>}} blockType  The block type.
 * @param {string}                                                       html       The edited block markup.
 * @return {string|null} The synced markup, or null when no copy was stale.
 */
export const syncDuplicateValues = ( attributes, blockType, html ) => {
	const fields = HTML_FIELDS[ blockType?.name ];

	if ( ! fields || 'string' !== typeof html ) {
		return null;
	}

	const template = document.createElement( 'template' );
	template.innerHTML = html;

	const root = template.content.firstElementChild;

	if ( ! root ) {
		return null;
	}

	let synced = false;

	Object.entries( fields ).forEach( ([ key, locations ]) => {
		const value = attributes?.[ key ];

		if ( 2 > locations.length || ! [ 'string', 'number' ].includes( typeof value ) ) {
			return;
		}

		locations.forEach( ( location ) => {
			const node = findNode( root, location );
			const raw = node && ! location.html ? readLocation( root, location ) : undefined;

			if ( undefined === raw ) {
				return;
			}

			// The visible percentage keeps its sign.
			const expected = `${ value }${ ! location.attribute && /%\s*$/.test( raw ) ? '%' : '' }`;

			if ( raw === expected ) {
				return;
			}

			if ( location.attribute ) {
				node.setAttribute( location.attribute, expected );
			} else {
				node.textContent = expected;
			}

			synced = true;
		});
	});

	return synced ? template.innerHTML : null;
};
