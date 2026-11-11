const TIMING_VALUE_PATTERN = /^[0-9]*\.?[0-9]+(?:ms|s)$/;

/**
 * Read a supported animation timing value from a class name.
 *
 * @param {string} className The class name to inspect.
 * @param {string} prefix    The timing class prefix.
 * @return {string|null} The timing value, or null when it is unsupported.
 */
export const getAnimationTimingValue = ( className, prefix ) => {
	if ( ! className.startsWith( prefix ) ) {
		return null;
	}

	const value = className.slice( prefix.length );

	return TIMING_VALUE_PATTERN.test( value ) ? value : null;
};
