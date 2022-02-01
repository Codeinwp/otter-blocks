/**
 * WordPress dependencies
 */
import domReady from '@wordpress/dom-ready';

const MAX_PARENT_SEARCH = 3;

const speedConfig = {
	'none': undefined,
	'o-count-slower': 3,
	'o-count-slow': 2,
	'o-count-fast': 1.5,
	'o-count-fastest': 1
};

/**
 * Get the configuration option from the element CSS classes.
 * @param {HTMLDivElement} elem
 * @returns Configuration options.
 */
const getConfiguration = ( elem ) => {
	let parent = elem.parentElement;
	for ( let i = 0; i < MAX_PARENT_SEARCH; ++i ) {
		if ( Array.from( parent.classList ).some( o => o.includes( 'o-count-' ) ) ) {
			const arr = Array.from( parent.classList );

			const delay = arr.filter( x => x.includes( 'o-count-delay-' ) ).pop();
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
 * @returns Utility functions.
 */
const makeInterval = ( duration, deltaTime ) => {

	let interval;
	let currentStep = 0;
	const steps = ( Math.ceil( duration / deltaTime ) + 1 ) || 1;

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

// List to all characters that can be in a number structure.
const NUMERIC_FORMATS = new Set( Array.from( '0123456789,.' ) );

// List to extra characters that ca be in a number format. E.g: `-` with 23-34-12-12.
const NUMBER_EXTRA_FORMAT = new Set( Array.from( ',' ) );

/**
 * Extract the number, prefix, and suffix.
 * @param {string} text The selected text
 * @returns An object with the number, prefix and suffix
 */
const extract = ( text ) => {
	const arr = Array.from( text );

	const prefix = [];
	const suffix = [];
	const number = [];

	let isPrefix = true;
	let isSuffix = false;

	for ( let x of arr ) {
		if ( NUMERIC_FORMATS.has( x ) ) {
			if ( isPrefix ) {
				isPrefix = false;
			}
			if ( isSuffix ) {

				// If there are more numbers in the selection, consider them as suffix.
				suffix.push( x );
			} else {
				number.push( x );
			}
		} else {
			if ( isPrefix ) {
				prefix.push( x );
			} else {
				if ( ! isSuffix ) {
					isSuffix = true;
				}
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

	const {
		suffix,
		prefix,
		number
	} = extract( text );

	const formatElements = [ ...number ].reverse().map( ( c, idx ) => {
		if ( NUMBER_EXTRA_FORMAT.has( c ) ) {
			return {
				position: idx,
				character: c
			};
		}

		return null;
	}).filter( x => x );

	// Get the precision based on the numbers after the comma.
	const numAfterComma = number.join( '' )?.split( '.' )?.[1]?.length || 0;

	// Clean the string and the get the number.
	const parsedNumber = parseFloat( number.filter( c => ',' !== c ).join( '' )  );

	const paddingLen = text.length - suffix.length;

	/**
	 * Apply the format to the number.
	 * @param {number} n The number.
	 */
	const applyFormat = ( n ) => {
		const num = n.split( '' ).reverse();

		formatElements.forEach( f => {
			if ( f.position < num.length ) {
				num.splice( f.position, 0, f.character );
			}
		});

		return ( ( prefix || '' ) + ( num.reverse().join( '' ) ) ).padStart( paddingLen, ' ' ) + suffix || '';
	};

	const { start, steps } = makeInterval( config?.speed || 2, 0.05 );
	const delta =  parseFloat( ( parsedNumber /  steps ).toFixed( numAfterComma || 2 ) ) ;

	// Don't animate it if the difference is very small.
	if ( 0.000000000001 > delta ) {
		return;
	}


	let values = [ 0 ];
	for ( let i = 1; i < steps; ++i ) {
		values.push(  values[i - 1] + delta );
	}
	values = values.map( n => n.toFixed( numAfterComma ) );

	if ( 0 < values.length ) {
		values[steps - 1] =  parsedNumber.toFixed( numAfterComma || 0 );
		elem.innerHTML =  applyFormat( values[0]);

		setTimeout( () => {
			elem.style.whiteSpace = 'pre';
			start( ( i ) => {
				elem.innerHTML = applyFormat( values[i]);
			}, () => {
				elem.style.whiteSpace = '';
				elem.innerHTML = text;
			});

		}, config?.delay || 0 );
	}
};

domReady( () => {
	const options = {
		root: null,
		rootMargin: '0px',
		threshold: [ 0.6 ]
	};

	const NUMBERS = new Set( '0123456789' );

	setTimeout( () => {
		const anims = document.querySelectorAll( 'o-anim-count' );
		anims.forEach( ( elem ) => {
			if ( Array.from( elem.innerHTML ).some( c  => NUMBERS.has( c ) ) ) {
				const observer = new IntersectionObserver( ( entries ) => {
					entries.forEach( entry => {
						if ( entry.isIntersecting && 0 < entry.intersectionRect.height ) {
							observer.unobserve( elem );
							initCount( elem );
						}
					});
				}, options );
				observer.observe( elem );
			} else {
				console.log( elem );
			}
		});
	}, 300 );

});
