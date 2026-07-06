/**
 * Small JSON helpers shared across the AI generation modules. Models reply in
 * strict JSON (sometimes fenced), so parsing is centralized and forgiving here.
 */

export const isObject = ( value: unknown ): value is Record<string, unknown> => {
	return Boolean( value && 'object' === typeof value && ! Array.isArray( value ) );
};

/**
 * Parse a model response into an object, tolerating a ```json … ``` fence the
 * model may add despite being asked for strict JSON. Returns null on failure.
 *
 * @param response The raw model response.
 */
export const parseJsonResponse = ( response: string ): Record<string, unknown> | null => {
	try {
		const cleaned = response.trim().replace( /^```(?:json)?\s*/i, '' ).replace( /\s*```$/, '' );
		const parsed = JSON.parse( cleaned );

		return isObject( parsed ) ? parsed : null;
	} catch {
		return null;
	}
};

/**
 * Coerce an unknown value into an array of strings, dropping non-strings.
 *
 * @param value The value to coerce.
 */
export const toStringArray = ( value: unknown ): string[] => {
	return Array.isArray( value ) ? value.filter( item => 'string' === typeof item ) : [];
};
