import { isEmpty, merge, set, unset, without, omitBy, isObjectLike, isString, isNumber, isNil, cloneDeep } from 'lodash';

import { sprintf } from '@wordpress/i18n';

import { __experimentalGetSettings } from '@wordpress/date';

import { __ } from '@wordpress/i18n';
import { makeBox } from '../plugins/copy-paste/utils';

// Post types to exclude
const excludedTypes = [
	'wp_template',
	'wp_template_part',
	'wp_navigation',
	'nav_menu_item',
	'wp_block',
	'attachment',
	'sfwd-certificates',
	'e-landing-page',
	'piotnetforms-book',
	'piotnetforms',
	'piotnetforms-data',
	'jet-menu',
	'jet-popup',
	'adsforwp-groups',
	'pgc_simply_gallery',
	'editor-story',
	'pafe-form-booking',
	'sfwd-assignment',
	'sfwd-essays',
	'pafe-formabandonment',
	'frm_display',
	'sfwd-transactions',
	'jet-engine',
	'jet-theme-core',
	'reply',
	'jet_options_preset',
	'tutor_assignments',
	'brizy_template',
	'jet-smart-filters',
	'pafe-fonts',
	'pafe-form-database',
	'ct_content_block',
	'adsforwp',
	'iamport_payment',
	'tribe_events',
	'mec_esb',
	'elementor_library',
	'testimonial',
	'zion_template',
	'popup',
	'jet-engine-booking',
	'tutor_quiz',
	'piotnetforms-aban',
	'forum',
	'topic',
	'sfwd-quiz',
	'mec-events',
	'jet-woo-builder',
	'neve_custom_layouts',
	'feedzy_imports',
	'neve_cart_notices',
	'visualizer'
];

/**
 * HTML to Plaintext
 *
 * @param {HTMLElement} value
 * @returns {*}
 */
export const unescapeHTML = value => {
	const htmlNode = document.createElement( 'div' );
	htmlNode.innerHTML = value;
	if ( htmlNode.innerText !== undefined ) {
		return htmlNode.innerText;
	}
	return htmlNode.textContent;
};

/**
 * Format the date.
 *
 * @param {Date} date
 * @returns {string}
 */
export const formatDate = date => {
	const monthNames = [
		'January', 'February', 'March',
		'April', 'May', 'June', 'July',
		'August', 'September', 'October',
		'November', 'December'
	];

	date = new Date( date );
	const day = date.getDate();
	const monthIndex = date.getMonth();
	const year = date.getFullYear();
	return day + ' ' + monthNames[monthIndex] + ', ' + year;
};

/**
 * Get the custom post types from the post.
 *
 * @returns {Promise<undefined|*>}
 */
export const getCustomPostTypeSlugs = async() => {
	const dataTypes = window.themeisleGutenberg.postTypes;

	if ( dataTypes ) {
		const allExistingSlugs = Object.keys( dataTypes );
		return without( allExistingSlugs, ...excludedTypes );
	}

	return undefined;
};

/**
 * Convert a word to title case.
 *
 * @param {string} word
 * @returns {string}
 */
export const convertToTitleCase = ( word ) => {
	if ( 'string' === typeof word || word instanceof String ) {
		return word[0].toUpperCase() + word.slice( 1 );
	}
	throw 'The parameter must be a string.';
};

/**
 * Insert an item between the element of the array
 *
 * @param {Array} arr
 * @param {any}   item
 * @returns An array with the given item inserted between initial elements
 */
export const insertBetweenItems = ( arr, item ) => {
	const _arr = [];
	arr?.forEach( ( listItem, index ) => {
		_arr.push( listItem );

		// Omit to add for the last list item
		if ( index < arr.length - 1 ) {
			_arr.push( item );
		}
	});
	return _arr;
};

/**
 * Get site's timezone.
 *
 * @returns {*}
 */
export const getTimezone = () => {
	const settings = __experimentalGetSettings();
	const offset   = 60 * settings.timezone.offset;
	const sign     = 0 > offset ? '-' : '+';
	const absmin   = Math.abs( offset );
	const timezone = sprintf( '%s%02d:%02d', sign, absmin / 60, absmin % 60 );
	return timezone;
};

/**
 * Check if object has only null values.
 *
 * @param obj
 * @returns {boolean}
 */
export const isNullObject = obj => ! Object.keys( obj ).some( k => null !== obj[ k ]);

/**
 * Check if object has only undefined values.
 *
 * @param obj
 * @returns {this is unknown[]}
 */
export const isUndefinedObject = obj => Object.values( obj ).every( l => l === undefined );

/*
 +-------------------------------- CSS Utility functions --------------------------------+
*/

/**
 * Format the value based on the given unit.
 *
 * @param {number} value
 * @param {string} unit
 * @returns {string|undefined}
 */
export const _unit = ( value, unit ) => ( isNumber( value ) ? value + unit : value );

/**
 * Format the value into a `px` unit.
 *
 * @param {any} value The value.
 * @returns {string|undefined}
 */
export const _px = value => _unit( value, 'px' );

/**
 * Format the value into a `em` unit.
 *
 * @param {string} value The value.
 * @returns {string|undefined}
 */
export const _em = value => _unit( value, 'em' );

/**
 * Format the value into a `%` unit.
 *
 * @param {string} value The value.
 * @returns {string|undefined}
 */
export const _percent = value => _unit( value, '%' );

/**
 * Make a box type from a number or an object with Box like props.
 * @param {Object|number|undefined} value
 * @param {import('./blocks').BoxType?} defaultValue
 * @returns {import('./blocks').BoxType}
 */
export const objectOrNumberAsBox = ( value, defaultValue = undefined ) => {
	if ( isNumber( value ) ) {
		return makeBox( _px( value ) );
	}

	if ( value === undefined ) {
		return defaultValue;
	}

	return {
		top: value?.top,
		bottom: value?.bottom,
		right: value?.right,
		left: value?.left
	};
};

const verticalMapping = {
	'top': 'flex-start',
	'left': 'flex-start',
	'center': 'center',
	'bottom': 'flex-end',
	'right': 'flex-end'
};

/**
 * Get the CSS value for the given value position.
 *
 * @param {string} value The position type.
 * @returns {string|undefined}
 */
export const _align = value =>{
	return verticalMapping[value];
};

/**
 * Get parameter from the URL.
 */
export const getObjectFromQueryString = queryString => {
	if ( -1 < queryString.indexOf( '?' ) ) {
		queryString = queryString.split( '?' )[1];
	}

	const pairs = queryString.split( '&' );
	const result = {};

	pairs.forEach( function( pair ) {
		pair = pair.split( '=' );
		if ( '' !== pair[0]) {
			result[pair[0]] = decodeURIComponent( pair[1] || '' );
		}
	});

	return result;
};

/**
 * Object to Query String.
 */
export const getQueryStringFromObject = params => Object.keys( params ).map( key => key + '=' + params[key]).join( '&' );

/**
 * Return the value of pair [condition, value] which has the first true condition.
 *
 * @param {([bool, any]|[any])[]} arr
 * @returns {*}
 */
export const getChoice = arr => {
	const r = arr?.filter( x => x?.[0])?.[0];
	return r?.[1] ?? r?.[0];
};

/**
 * Converts HEX colors to RGBA.
 *
 * @param color
 * @param alpha
 * @returns {string}
 */
export const hex2rgba = ( color, alpha = 100 ) => {
	if ( ! color ) {
		color = '#000000';
	}

	if ( '#' !== color[0]) {
		return color;
	}

	const [ r, g, b ] = color.match( /\w\w/g ).map( x => parseInt( x, 16 ) );
	return `rgba(${r},${g},${b},${alpha / 100})`;
};

/**
 * Return the values from a box type.
 *
 * @param {import('./blocks').BoxType?} box
 * @param {import('./blocks').BoxType?} defaultBox
 * @return {string}
 */
export const boxValues = ( box = {}, defaultBox = {}) => {
	return `${ box?.top ?? defaultBox?.top ?? '0px' } ${ box?.right ?? defaultBox?.right ?? '0px' } ${ box?.bottom ?? defaultBox?.bottom ?? '0px' } ${ box?.left ?? defaultBox?.left ?? '0px' }`;
};

/**
 * Remove the default values from Box object.
 *
 * @param {import('./blocks').BoxType} box
 * @param {import('./blocks').BoxType} defaultBox
 * @return {import('./blocks').BoxType}
 */
export const removeBoxDefaultValues = ( box, defaultBox ) => {
	if ( defaultBox === undefined || isEmpty( defaultBox ) ) {
		return box;
	}
	const cleaned = omitBy( box, ( value, key ) => value === defaultBox?.[key]);
	return isEmpty( cleaned ) ? undefined : cleaned;
};

/**
 * Merge the Box objects.
 *
 * @param {import('./blocks').BoxType?} box
 * @param {import('./blocks').BoxType?} defaultBox
 * @return {import('./blocks').BoxType}
 */
export const mergeBoxDefaultValues = ( box, defaultBox ) => {
	return merge(
		{ left: '0px', right: '0px', bottom: '0px', top: '0px' },
		defaultBox,
		box
	);
};

const mapViewToKey = {
	'Desktop': 0,
	'Tablet': 1,
	'Mobile': 2
};

/**
 * Helper function to add proper utm.
 * @param {string} url Url to add utms.
 * @param {string} area Descriptive name of the link
 * @returns {string}
 */
export const setUtm = ( urlAdress, linkArea ) => {
	const urlLink = new URL( urlAdress );
	urlLink.searchParams.set( 'utm_campaign', linkArea );
	return urlLink.toString();
};

/**
 * Build a responsive wrapper around `setAttributes`
 *
 * @param {Function} setAttributes The function that set the attributes.
 * @param {'Desktop'|'Tablet'|'Mobile'} currentView The current view.
 * @template T
 * @returns {(value: T, keys: string[], oldAttr: Object) => void}) => void}
 */
export const buildResponsiveSetAttributes = ( setAttributes, currentView ) => {
	return ( value, keys, oldAttr = {}) => {

		const attrName = keys[mapViewToKey[currentView] ?? 0]?.split( '.' )[0];
		const attr = { [attrName]: { ...oldAttr }};

		set( attr, keys[mapViewToKey[currentView] ?? 0], value );

		setAttributes( 'object' === typeof attr[attrName] && isEmpty( attr[attrName]) ? { [attrName]: undefined } : attr );
	};
};

/**
 * Build a responsive wrapper around current view to choose a value.
 *
 * @param {'Desktop'|'Tablet'|'Mobile'} currentView The current view.
 * @param {'Desktop'|'Tablet'|'Mobile'} defaultView If the value of the current view is undefined or null, fallback to this view.
 * @param {boolean} cascade Inherit from previous view. Mobile from Tablet, Tablet from Desktop.
 * @template T
 * @returns { (values: T[]) => T}
 */
export const buildResponsiveGetAttributes = ( currentView, defaultView = 'Desktop', cascade = true ) => {
	return values => {
		if ( cascade && ! values?.[mapViewToKey[currentView]] && currentView !== defaultView ) {
			return values?.[mapViewToKey[currentView] - 1] ?? values?.[mapViewToKey[currentView] - 2];
		}
		return ( values?.[mapViewToKey[currentView]] ?? values?.[mapViewToKey[defaultView]]);
	};
};

/**
 * Get Active Style Name.
 *
 * @param { Object } styles    Block styles.
 * @param { Array }  className Classes of the block.
 *
 * @returns { string }
 */
export const getActiveStyle = ( styles, className ) => {
	const classes = className?.split( ' ' ) || [];
	const styleValues = styles.map( i => i.value );
	const defaultValue = styles.find( i => i.isDefault )?.value || '';

	for ( const style of classes ) {
		if ( -1 === style.indexOf( 'is-style-' ) ) {
			continue;
		}

		const potentialStyleName = style.substring( 9 );

		if ( -1 < styleValues.indexOf( potentialStyleName ) ) {
			return potentialStyleName;
		}
	}

	return defaultValue;
};

/**
 * Replaces the active style in the block's className.
 *
 * @param { string } className Class name.
 * @param { Object } styles    Block styles.
 * @param { Object } newStyle  The replacing style.
 *
 * @return { string } The updated className.
 */
export const changeActiveStyle = ( className, styles, newStyle ) =>{
	const classes = className?.split( ' ' ) || [];
	const activeStyle = getActiveStyle( styles, className );
	const defaultValue = styles.find( i => i.isDefault )?.value || '';

	if ( activeStyle && -1 < classes.indexOf( `is-style-${ activeStyle }` ) ) {
		classes.splice( classes.indexOf( `is-style-${ activeStyle }` ), 1 );
	}

	if ( newStyle && newStyle !== defaultValue ) {
		classes.push( `is-style-${ newStyle }` );
	}

	return classes.join( ' ' );
};

/**
 * Create a CSS property declaration.
 * @param {string} prop The name of the property.
 * @param {string | undefined | null} value The value.
 * @param { ((c: any) => boolean) | boolean | undefined } condition The condition.
 * @returns
 */
export const _cssProp = ( prop, value, condition = undefined ) => value !== undefined && null !== value && ( condition === undefined || ( 'function' === typeof condition ? condition( value ) : condition ) ) ? `${prop}: ${value};` : undefined;

/**
 * Create a CSS block declaration.
 * @param {[string, string, ((c: any) => boolean | boolean | undefined) | undefined][]} propsPairs The properties grouped in pairs
 * @returns
 */
export const _cssBlock = ( propsPairs ) => `{\n${
	propsPairs
		?.map( pair => _cssProp( pair?.[0], pair?.[1], pair?.[2]) )
		?.filter( x => x !== undefined )
		?.join( '\n' ) ??
	''} \n}`;

/**
 * Wrap a given string in a box object.
 * @param {string|any} s The value.
 * @returns {import('./blocks').BoxType|any}
 */
export const stringToBox = ( s ) => {
	if ( ! isString( s ) ) {
		return s;
	}

	return {
		top: s,
		bottom: s,
		right: s,
		left: s
	};
};

/**
 * Make a box intro a CSS string. If it is a string, wrap it into a box.
 * @param {string|import('./blocks').BoxType | undefined} box The box.
 * @returns
 */
export const boxToCSS = ( box ) => {
	if ( box === undefined ) {
		return undefined;
	}

	const _box = isString( box ) ? mergeBoxDefaultValues( stringToBox( box ) ) : mergeBoxDefaultValues( box );
	return `${_box.top} ${_box.right} ${_box.bottom} ${_box.left}`;
};

/**
 * Print the given value then return it. Usefull for debugging.
 * @param {any} x
 * @returns
 */
export const _i = x => {
	console.log( x );
	return x;
};

/**
 * Helper function to remove empty props objects recursivly in a distructive way.
 * @param {Object} o The object.
 * @returns {Object | undefined}
 */
export const _compactObject = ( o ) => {
	if ( ! isObjectLike( o ) ) {
		return o;
	}

	for ( const p in o ) {
		if ( isObjectLike( o[p]) ) {
			o[p] = compactObject( o[p]);
		}
		if ( isNil( o[p]) ) {
			delete o[p];
		}
	}

	if ( isEmpty( o ) ) {
		return undefined;
	}

	return o;
};

/**
 * Remove empty props objects recursivly.
 * @param {Object} o The object.
 * @returns {Object | undefined}
 */
export const compactObject = ( o ) => {
	return _compactObject( cloneDeep( o ) );
};

/**
 * Utility function for rendering to CSS legacy value that were numbers before converting it to a box value type.
 * @param {string|import('./blocks').BoxType | number | undefined} box The box to render.
 * @param {string} unit The unit to add if the box is a number.
 * @returns
 */
export const renderBoxOrNumWithUnit = ( box, unit ) => {
	if ( isNumber( box ) ) {
		return boxToCSS( _unit( box, unit ) );
	}
	return boxToCSS( box );
};

/**
 * Return true if platform is MacOS.
 *
 * @param {Window?} _window window object by default; used for DI testing.
 *
 * @return {boolean} True if MacOS; false otherwise.
 */
export function isAppleOS( _window = null ) {
	if ( ! _window ) {
		if ( 'undefined' === typeof window ) {
			return false;
		}

		_window = window;
	}

	const { platform } = _window.navigator;

	return (
		-1 !== platform.indexOf( 'Mac' ) ||
		[ 'iPad', 'iPhone' ].includes( platform )
	);
}
