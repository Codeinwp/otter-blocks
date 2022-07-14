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
	const { i18n } = window.themeisleGutenbergCountdown;

	const time = [
		{
			tag: 'day',
			name: 1 < days ? i18n.days : i18n.day,
			value: days
		},
		{
			tag: 'hour',
			name: 1 < hours ? i18n.hours : i18n.hour,
			value: hours
		},
		{
			tag: 'minute',
			name: 1 < minutes ? i18n.minutes : i18n.minute,
			value: minutes
		},
		{
			tag: 'second',
			name: 1 < seconds ? i18n.seconds : i18n.second,
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
 * @param {string} date The deadline of the countdown.
 * @param {object} updateComponents The object with the update functions.
 * @param {() => void} onStart Trigger when the countdown start.
 * @returns {Function} Function that update the countdown every time it is called. You can send a callback to be triggered when is finised.
 */
const updateTime = ( date, updateComponents, onStart ) => {
	let _date = date + window.themeisleGutenbergCountdown.timezone;
	_date = new Date( _date );
	_date = _date.getTime();
	let start = true;
	return ( onFinishCb ) => {
		const time = getIntervalFromUnix( _date - Date.now() );
		time.forEach( ({ tag, value, name }) => {
			updateComponents[tag]?.( name, value );
		});

		if ( start ) {
			start = false;
			onStart?.();
		}

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
			const update = updateTime( date, getComponentsUpdate( countdown ), () => countdown.classList.add( 'ready' ) );
			const interval = setInterval( () => {
				update( () => clearInterval( interval ) );
			}, 500 );
		}
	});
});
