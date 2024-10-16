/**
 * Create a list with numbers from interval [start, end].
 *
 * @param {number} start The start.
 * @param {number} end   The end.
 * @param {number} step  The step.
 * @return {*[]}
 */
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

	if ( 'undefined' === typeof step ) {
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

/**
 * Linear
 *
 * @param {number} x
 * @return {number}
 */
export const linear = ( x ) => {
	return x;
};

/**
 * Ease In Sine
 *
 * @param {number} x
 * @return {number}
 */
export const easeInSine = ( x ) => {
	return 1 - Math.cos( ( x * Math.PI ) / 2 );
};

/**
 * Ease Out Sine
 *
 * @param {number} x
 * @return {number}
 */
export const easeOutSine = ( x ) => {
	return Math.sin( ( x * Math.PI ) / 2 );
};

/**
 * Ease In Out SSine
 * @param {number} x
 * @return {number}
 */
export const easeInOutSine = ( x ) => {
	return -( Math.cos( Math.PI * x ) - 1 ) / 2;
};

/**
 * Ease Out Quad
 * @param {number} x
 * @return {number}
 */
export const easeOutQuad = ( x ) => {
	return 1 - ( 1 - x ) * ( 1 - x );
};

/**
 * Specify a function to execute when the DOM is fully loaded.
 *
 * @param {Callback} callback A function to execute after the DOM is ready.
 * @return {void}
 */
export const domReady = ( callback ) => {
	if ( 'undefined' === typeof document ) {
		return;
	}

	if (
		'complete' === document.readyState || // DOMContentLoaded + Images/Styles/etc loaded, so we call directly.
		'interactive' === document.readyState // DOMContentLoaded fires at this point, so we call directly.
	) {
		return void callback();
	}

	// DOMContentLoaded has not fired yet, delay callback until then.
	document.addEventListener( 'DOMContentLoaded', callback );
};

/**
 * Debounce function
 *
 * @param  func    The function to apply.
 * @param  timeout
 * @return {(function(...[*]): void)|*}
 */
export const debounce = ( func, timeout = 500 ) => {
	let timer;
	return ( ...args ) => {
		clearTimeout( timer );
		timer = setTimeout( () => {
			func.apply( this, args );
		}, timeout );
	};
};

/**
 * Converts HEX colors to HSL.
 *
 * @param  color
 * @param  asArray
 * @return {string | Array}
 */
export const rgb2hsl = ( color, asArray = true ) => {
	const rgb = color.substring( 4, color.length - 1 )
		.replace( / /g, '' )
		.split( ',' );

	const r = parseFloat( rgb[0]) / 255;
	const g = parseFloat( rgb[1]) / 255;
	const b = parseFloat( rgb[2]) / 255;

	const max = Math.max( r, g, b );
	const min = Math.min( r, g, b );

	let h, s;
	const l = ( max + min ) / 2;

	if ( max === min ) {
		h = s = 0; // achromatic
	} else {
		const d = max - min;
		s = 0.5 < l ? d / ( 2 - max - min ) : d / ( max + min );

		switch ( max ) {
		case r: h = ( g - b ) / d + ( g < b ? 6 : 0 ); break;
		case g: h = ( b - r ) / d + 2; break;
		case b: h = ( r - g ) / d + 4; break;
		}

		h /= 6;
	}

	if ( asArray ) {
		return [ h * 360, s * 100, l * 100 ];
	}

	return `hsl( ${h * 360}, ${s * 100}, ${l * 100} )`;
};

/**
 *	Scrolls the element into view if it's not fully visible.
 *
 * @param {HTMLElement} element The element to scroll into view.
 * @param {*}           options The options for the scrollIntoView method.
 */
export const scrollIntoViewIfNeeded = ( element, options = {}) => {
	if ( ! element ) {
		return;
	}

	const rect = element.getBoundingClientRect();
	const isFullyVisible = (
		0 <= rect.top &&
		0 <= rect.left &&
		rect.bottom <= ( window.innerHeight || document.documentElement.clientHeight ) &&
		rect.right <= ( window.innerWidth || document.documentElement.clientWidth )
	);

	if ( ! isFullyVisible ) {
		element.scrollIntoView( options );
	}
};
