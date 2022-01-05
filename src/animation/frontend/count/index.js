/**
 * WordPress dependencies
 */
import domReady from '@wordpress/dom-ready';
import { range } from '../../../blocks/helpers/helper-functions';

const MAX_PARENT_SEARCH = 3;

const speedConfig = {
	'none': undefined,
	'slower': 3,
	'slow': 2,
	'fast': 1.5,
	'fastest': 1
};

/**
 * Get the configuration option from the element CSS classes.
 * @param {HTMLDivElement} elem
 */
const getConfiguration = ( elem ) => {
	let parent = elem.parentElement;
	for ( let i = 0; i < MAX_PARENT_SEARCH; ++i ) {
		if ( parent.classList.contains( 'o-count' ) ) {
			const arr = Array.from( parent.classList );

			const delay = arr.filter( x => x.includes( 'delay-' ) ).pop();
			const number = parseInt( delay?.split( '-' )?.[1] || '0' );
			const isMS = delay?.includes( 'ms' );

			const speedOptions = Object.keys( speedConfig );
			const speed = arr?.filter( x => speedOptions.includes( x ) )?.pop() || 'fast';

			return {
				speed: speedConfig[speed],
				delay: number * ( isMS ? 0 : 1000 )
			};
		}
	}
	return undefined;
};

/**
 * Create utility functions for an interval timer.
 * @param {number} duration The duration, in seconds.
 * @param {number} deltaTime The time between two time ticks, in seconds.
 * @returns {Object} Utility functions.
 */
const makeInterval = ( duration, deltaTime ) => {

	let interval;
	let currentStep = 0;
	const steps = ( Math.ceil( duration / deltaTime ) + 1 ) || 0;

	/**
	 * Stop the interval. Get a callback function that execute at the end.
	 * @param {Function} callback Function that execute at the end.
	 */
	const stop = ( callback ) => {
		clearInterval( interval );
		callback?.();
	};

	/**
	 * Start the interval. Get a callback function that execute at every tick and the one that execute at the end.
	 * @param {Function} callback Function that execute at every tick.
	 * @param {Function} endCallback Function that execute at the end.
	 */
	const start = ( callback, endCallback ) => {
		interval = setInterval( () => {
			if ( currentStep < steps ) {
				callback?.( currentStep );
				currentStep += 1;
			} else {
				stop( endCallback );
			}
		}, deltaTime * 1000 );
	};

	return {
		steps,
		start,
		stop
	};
};

// List to all characters that are in a number structure
const NUMERIC_FORMATS = new Set( Array.from( '0123456789,.' ) );

/**
 * Extract the number, prefix, and suffix.
 * @param {string} text
 */
const extract = ( text ) => {
	const arr = Array.from( text );

	const prefix = [];
	const suffix = [];
	const number = [];

	let isPrefix = true;

	for ( let x of arr ) {
		if ( NUMERIC_FORMATS.has( x ) ) {
			if ( isPrefix ) {
				isPrefix = false;
			}
			number.push( x );
		} else {
			if ( isPrefix ) {
				prefix.push( x );
			} else {
				suffix.push( x );
			}
		}
	}

	return {
		prefix: prefix.join( '' ),
		suffix: suffix.join( '' ),
		number
	};
};

/**
 * Start the count animation.
 * @param {HTMLDivElement} elem The HTML element.
 */
const initCount = ( elem ) => {
	const text = elem?.innerHTML || '';
	const config = getConfiguration( elem );

	console.log( elem, config );

	const {
		suffix,
		prefix,
		number
	} = extract( text );

	const formatElements = [ ...number ].reverse().map( ( c, idx ) => {
		if ( ',' === c ) {
			return {
				position: idx,
				character: c
			};
		}

		return null;
	}).filter( x => x );

	// Get precision based on the numbers after the comma.
	const numAfterComma = number.join( '' )?.split( '.' )?.[1]?.length || 0;

	// Clean the string and the get the number.
	const parsedNumber = parseFloat( number.filter( c => ',' !== c ).join( '' )  );

	const paddingLen = text.length - suffix.length;

	/**
	 * Apply the format to the number.
	 * @param {number} n The number.
	 */
	const applyFormat = ( n ) => {
		const num = ( numAfterComma ? n.toFixed( numAfterComma ) : n ).toString().split( '' ).reverse();

		formatElements.forEach( f => {
			if ( f.position < num.length ) {
				num.splice( f.position, 0, f.character );
			}
		});

		return ( ( prefix || '' ) + ( num.reverse().join( '' ) ) ).padStart( paddingLen, ' ' ) + suffix || '';
	};

	const { start, steps } = makeInterval( config?.speed || 2, 0.05 );
	const delta = Math.round( parsedNumber /  steps );

	// Don't animate if the difference is very small.
	if ( 0.000000001 > delta ) {
		return;
	}

	const values = range( 0, parsedNumber, delta );
	values[steps - 1] =  parsedNumber;


	setTimeout( () => {
		elem.style.whiteSpace = 'pre';
		start( ( i ) => {
			elem.innerHTML = applyFormat( values[i]);
		}, () => {
			elem.style.whiteSpace = '';
			elem.innerHTML = text;
		});

	}, config?.delay || 0 );
};

domReady( () => {
	const options = {
		root: null,
		rootMargin: '0px',
		threshold: [ 0.6 ]
	};

	console.group( 'Count Init' );

	const anims = document.querySelectorAll( 'o-anim-count' );
	anims.forEach( ( elem ) => {
		const observer = new IntersectionObserver( ( entries ) => {
			entries.forEach( entry => {
				if ( entry.isIntersecting && 0 < entry.intersectionRect.height ) {
					observer.unobserve( elem );
					initCount( elem );
				}
			});
		}, options );
		observer.observe( elem );
	});

	console.groupEnd();
});
