/**
 * Where the comment-stored attributes of static blocks appear in the saved markup.
 *
 * Each attribute lists its locations: `attribute` reads an HTML attribute, otherwise
 * `html` or `text` reads the element content. Selectors are relative to the block
 * wrapper; without one the wrapper itself is read.
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
	'themeisle-blocks/form-input': {
		label: [{ selector: ':scope > label > .otter-form-input-label__label', html: true }],
		placeholder: [{ selector: ':scope > input', attribute: 'placeholder' }],
		helpText: [{ selector: ':scope > .o-form-help', text: true }]
	},
	'themeisle-blocks/form-textarea': {
		label: [{ selector: ':scope > label > .otter-form-textarea-label__label', html: true }],
		placeholder: [{ selector: ':scope > textarea', attribute: 'placeholder' }],
		helpText: [{ selector: ':scope > .o-form-help', text: true }]
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
 * Read one location of an attribute from the block wrapper.
 *
 * @param {Element} root     The block wrapper.
 * @param {Object}  location The location.
 * @return {string|undefined} The raw value, or undefined when absent.
 */
const readLocation = ( root, location ) => {
	const node = location.selector ? root.querySelector( location.selector ) : root;

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
 * Normalize a value so markup and attribute values compare equal.
 *
 * @param {*}       value  The value.
 * @param {boolean} isHTML Whether the value is markup.
 * @return {string} The normalized value.
 */
const normalize = ( value, isHTML ) => {
	const string = undefined === value || null === value ? '' : String( value );

	return isHTML ? toFragment( `<div>${ string }</div>` ).firstChild.innerHTML : string;
};

/**
 * Read back the comment-stored attributes that were changed in the block markup,
 * so an "Edit as HTML" change is kept instead of invalidating the block.
 *
 * A value rendered in several places is taken from the first place that differs
 * from the stored attribute.
 *
 * @param {Object}      attributes The parsed attributes.
 * @param {Object}      blockType  The block type.
 * @param {string|Node} innerHTML  The block markup.
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

		const type = blockType.attributes?.[ key ]?.type;

		for ( const location of locations ) {
			const raw = readLocation( root, location );

			if ( undefined === raw ) {
				continue;
			}

			const value = toType( raw, type );

			if ( undefined !== value && normalize( value, location.html ) !== normalize( current, location.html ) ) {
				changed = { ...( changed ?? attributes ), [ key ]: value };
				break;
			}
		}
	});

	return changed ?? attributes;
};
