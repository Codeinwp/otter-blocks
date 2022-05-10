/**
 * Create utility functions for an interval timer.
 * @param {number} duration The duration, in seconds.
 * @param {number} deltaTime The time between two time ticks, in seconds.
 * @returns Utility functions.
 */
export const makeInterval = ( duration, deltaTime ) => {

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
