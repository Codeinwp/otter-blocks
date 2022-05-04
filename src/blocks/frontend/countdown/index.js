/**
 * WordPress dependencies
 */
import moment from 'moment';
import { sprintf, __ } from '@wordpress/i18n';
import { __experimentalGetSettings } from '@wordpress/date';

/**
 * Internal dependencies
 */
import { domReady } from '../../helpers/frontend-helper-functions.js';

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

/**
 * Get an object with the update function for every component
 *
 * @param {HTMLDivElement} root
 * @returns {Object.<string, Function>}
 */
const getComponentsUpdate = ( root ) => {
	return [ 'second', 'minute', 'hour', 'day' ].reduce( ( acc, componentName ) => {
		const elem = root.querySelector( `div[name=${ componentName }]` );
		if ( elem ) {
			const labelElem = elem.querySelector( '.otter-countdown__label' );
			const valueElem = elem.querySelector( '.otter-countdown__value' );
			acc[componentName] = ( labelName, value ) => {
				if ( parseInt( valueElem.innerHTML ) !== value ) {
					valueElem.innerHTML = value;
				}

				labelElem.innerHTML = labelName;
			};
		}

		return acc;
	}, {});
};

/**
 *
 * @param {*} date             The deadline of the countdown
 * @param {*} updateComponents The object with the update functions
 * @returns {Function} Function that update the countdown every time it is called. You can send a callback to be triggered when is finised.
 */
const updateTime = ( date, updateComponents ) => {
	let _date = date + getTimezone();
	_date = moment( _date ).unix() * 1000;
	return ( onFinishCb ) => {
		const time = getIntervalFromUnix( _date - Date.now() );
		time.forEach( ({ tag, value, name }) => {
			updateComponents[tag]?.( name, value );
		});

		if ( 0 >= time ) {
			onFinishCb();
		}
	};
};

domReady( () => {
	const countdowns = document.querySelectorAll( '.wp-block-themeisle-blocks-countdown' );

	countdowns.forEach( countdown => {
		const date = countdown.dataset.date;

		if ( date ) {
			const update = updateTime( date, getComponentsUpdate( countdown ) );
			const interval = setInterval( () => {
				update( () => clearInterval( interval ) );
			}, 500 );
		}
	});
});
