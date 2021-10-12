/**
 * WordPress dependencies
 */
import domReady from '@wordpress/dom-ready';

import moment from 'moment';

/**
 * Internal dependencies
 */
import {
	getIntervalFromUnix,
	getTimezone
} from '../../helpers/helper-functions.js';

/**
 * Get an object with the update function for every component
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
 * @param {*} date The deadline of the countdown
 * @param {*} updateComponents The object with the update functions
 * @returns {Function} Function that update the countdown every time it is called. You can send a callback to be triggered when is finised.
 */
const updateTime = ( date, updateComponents ) => {
	let _date = date + getTimezone();
	_date = moment( _date ).unix() * 1000;
	return ( onFinishCb ) => {
		const time = getIntervalFromUnix( _date - Date.now() );
		time.forEach( ({ tag, value, name}) => {
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
