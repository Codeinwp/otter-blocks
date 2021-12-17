/**
 * WordPress dependencies
 */
import domReady from '@wordpress/dom-ready';
import { range } from '../../../blocks/helpers/helper-functions';

const makeInterval = ( duration, deltaTime ) => {

	let interval;
	let currentStep = 0;
	const steps = ( Math.ceil( duration / deltaTime ) + 1 ) || 0;

	const stop = ( callback ) => {
		clearInterval( interval );
		callback?.();
	};

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
 *
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
 *
 * @param {HTMLDivElement} elem
 */
const initCount = ( elem ) => {
	const text = elem?.innerHTML || '';
	const len = text.length;

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

	const numAfterComma = number.join( '' )?.split( '.' )?.[1]?.length || 0;
	const parsedNumber = parseFloat( number.filter( c => ',' !== c ).join( '' )  );

	// console.log( extract( text ), {parsedNumber}, {num: number.filter( c => ',' !== c )});

	/**
	 *
	 * @param {number} n
	 */
	const applyFormat = ( n ) => {
		const num = ( numAfterComma ? n.toFixed( numAfterComma ) : n ).toString().split( '' ).reverse();

		formatElements.forEach( f => {
			if ( f.position < num.length ) {
				num.splice( f.position, 0, f.character );
			}
		});

		return ( ( prefix || '' ) + ( num.reverse().join( '' ) ) ).padStart( len - suffix.length, ' ' ) + suffix || '';
	};

	const { start, steps } = makeInterval( 3, 0.2 );
	const delta = Math.round( parsedNumber /  steps );
	const values = range( 0, parsedNumber, delta );
	values[steps - 1] =  parsedNumber;

	elem.style.whiteSpace = 'pre';

	start( ( i ) => {
		elem.innerHTML = applyFormat( values[i]);
	}, () => {
		elem.style.whiteSpace = '';
	});
};

domReady( () => {
	const options = {
		root: null,
		rootMargin: '0px',
		threshold: [ 0.6 ]
	};

	const anims = document.querySelectorAll( 'o-anim-count' );
	anims.forEach( ( elem ) => {
		const observer = new IntersectionObserver( ( entries ) => {
			entries.forEach( entry => {
				if ( entry.isIntersecting && 0 < entry.intersectionRect.height ) {
					initCount( elem );
					observer.unobserve( elem );
				}
			});
		}, options );
		observer.observe( elem );
	});
});
