/**
 * WordPress dependencies
 */
import domReady from '@wordpress/dom-ready';
import { range } from '../../helpers/helper-functions';

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

/**
 *
 * @param {HTMLDivElement} elem
 */
const initCount = ( elem ) => {
	const text = elem?.innerHTML || '';
	const len = text.length;
	const formatElements = Array.from( text ).reverse().map( ( c, idx ) => {
		if ( ! ' ,'.includes( c ) ) {
			return null;
		}

		return {
			position: idx,
			character: c
		};
	}).filter( x => x );
	const numAfterComma = text?.split( '.' )?.[1]?.length || 0;
	const number = parseFloat( text.replace( /[\s,]/g, '' ) );

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

		return num.reverse().join( '' ).padStart( len, ' ' );
	};

	const { start, steps } = makeInterval( 3, 0.2 );
	const delta = Math.round( number /  steps );
	const values = range( 0, number, delta );
	values[steps - 1] =  number;

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
