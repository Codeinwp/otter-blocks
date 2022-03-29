import { without } from 'lodash';

import { sprintf } from '@wordpress/i18n';

import { __experimentalGetSettings } from '@wordpress/date';

import { __ } from '@wordpress/i18n';

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

// HTML to Plaintext
export const unescapeHTML = value => {
	const htmlNode = document.createElement( 'div' );
	htmlNode.innerHTML = value;
	if ( htmlNode.innerText !== undefined ) {
		return htmlNode.innerText;
	}
	return htmlNode.textContent;
};

// Format Date
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

// Create a list with numbers from interval [start, end]
export const range = ( start, end, step ) => {
	const range = [];
	const typeofStart = typeof start;
	const typeofEnd = typeof end;

	if ( 0 === step ) {
		throw TypeError( 'Step cannot be zero.' );
	}

	if ( undefined === typeofStart || undefined === typeofEnd ) {
		throw TypeError( 'Must pass start and end arguments.' );
	} else if ( typeofStart !== typeofEnd ) {
		throw TypeError( 'Start and end arguments must be of same type.' );
	}

	if ( undefined === typeof step ) {
		step = 1;
	}

	if ( end < start ) {
		step = -step;
	}

	if ( 'number' === typeofStart ) {
		while ( 0 < step ? end >= start : end <= start ) {
			range.push( start );
			start += step;
		}
	} else if ( 'string' === typeofStart ) {
		if ( 1 !== start.length || 1 !== end.length ) {
			throw TypeError( 'Only strings with one character are supported.' );
		}

		start = start.charCodeAt( 0 );
		end = end.charCodeAt( 0 );

		while ( 0 < step ? end >= start : end <= start ) {
			range.push( String.fromCharCode( start ) );
			start += step;
		}
	} else {
		throw TypeError( 'Only string and number types are supported' );
	}

	return range;
};

// Easing functions for animation
export const linear = ( x ) => {
	return x;
};

export const easeInSine = ( x ) => {
	return 1 - Math.cos( ( x * Math.PI ) / 2 );
};

export const easeOutSine = ( x ) => {
	return Math.sin( ( x * Math.PI ) / 2 );
};

export const easeInOutSine = ( x ) => {
	return -( Math.cos( Math.PI * x ) - 1 ) / 2;
};

export const easeOutQuad = ( x ) => {
	return 1 - ( 1 - x ) * ( 1 - x );
};

export const getCustomPostTypeSlugs = async() => {
	const dataTypes = window.themeisleGutenberg.postTypes;

	if ( dataTypes ) {
		const allExistingSlugs = Object.keys( dataTypes );
		return without( allExistingSlugs, ...excludedTypes );
	}

	return undefined;
};

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

// Time constants
const _MS_PER_SECONDS = 1000;
const _MS_PER_MINUTES = _MS_PER_SECONDS * 60;
const _MS_PER_HOURS = _MS_PER_MINUTES * 60;
const _MS_PER_DAY = _MS_PER_HOURS * 24;

/**
 * Get the time interval from the unix time
 *
 * @param {number} unixTime Time as UNIX
 * @param {Object} settings Options to keep a components or/and allow negative time
 * @returns An object with the values for days, hours, minutes, seconds
 */
export const getIntervalFromUnix = ( unixTime, settings ) => {
	unixTime = unixTime ? unixTime : 0; // Check for null/undefined

	const days = Math.floor( unixTime / _MS_PER_DAY );
	const hours = Math.floor( unixTime / _MS_PER_HOURS % 24 );
	const minutes = Math.floor( unixTime / _MS_PER_MINUTES % 60 );
	const seconds = Math.floor( unixTime / _MS_PER_SECONDS % 60 );

	const time = [
		{
			tag: 'day',
			name: 1 < days ? __( 'Days', 'otter-blocks' ) : __( 'Day', 'otter-blocks' ),
			value: days
		},
		{
			tag: 'hour',
			name: 1 < hours ? __( 'Hours', 'otter-blocks' ) : __( 'Hour', 'otter-blocks' ),
			value: hours
		},
		{
			tag: 'minute',
			name: 1 < minutes ? __( 'Minutes', 'otter-blocks' ) : __( 'Minute', 'otter-blocks' ),
			value: minutes
		},
		{
			tag: 'second',
			name: 1 < seconds ? __( 'Seconds', 'otter-blocks' ) : __( 'Second', 'otter-blocks' ),
			value: seconds
		}
	]
		.filter( ({ tag }) => ! settings?.exclude?.includes( tag ) )
		.map( obj => {
			if ( ! settings?.keepNeg ) {
				obj.value = Math.max( 0, obj.value );
			}
			return obj;
		});

	return time;
};

// Get site's timezone.
export const getTimezone = () => {
	const settings = __experimentalGetSettings();
	const offset   = 60 * settings.timezone.offset;
	const sign     = 0 > offset ? '-' : '+';
	const absmin   = Math.abs( offset );
	const timezone = sprintf( '%s%02d:%02d', sign, absmin / 60, absmin % 60 );
	return timezone;
};

// Check if object has only null values.
export const isNullObject = obj => ! Object.keys( obj ).some( k => null !== obj[ k ]);

// Check if object has only undefined values.
export const isUndefinedObject = obj => Object.values( obj ).every( l => l === undefined );

/*
 +-------------------------------- CSS Utility functions --------------------------------+
*/

/**
 * Format the value based on the given unit.
 * @param {string} value
 * @param {string} unit
 * @returns {string|undefined}
 */
export const _unit = ( value, unit ) => ( value ? value + unit : undefined );

/**
 * Format the value into a `px` unit.
 * @param {string} value The value.
 * @returns {string|undefined}
 */
export const _px = value => _unit( value, 'px' );

/**
 * Format the value into a `em` unit.
 * @param {string} value The value.
 * @returns {string|undefined}
 */
export const _em = value => _unit( value, 'em' );

/**
 * Format the value into a `%` unit.
 * @param {string} value The value.
 * @returns {string|undefined}
 */
export const _percent = value => _unit( value, '%' );

const verticalMapping = {
	'top': 'flex-start',
	'left': 'flex-start',
	'center': 'center',
	'bottom': 'flex-end',
	'right': 'flex-end'
};

/**
 * Get the CSS value for the given value position.
 * @param {string} value The position type.
 * @returns {string|undefined}
 */
export const _align = value =>{
	return verticalMapping[value];
};
