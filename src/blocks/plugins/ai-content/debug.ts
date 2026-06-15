/**
 * Step-by-step debug logger for the AI Block generation pipeline.
 *
 * Logging is on by default while the feature is in beta. Toggle at runtime from
 * the browser console with:
 *   window.otterAIDebug = false  // silence
 *   window.otterAIDebug = true   // re-enable
 */
const isEnabled = (): boolean => {
	const flag = ( window as unknown as { otterAIDebug?: boolean }).otterAIDebug;
	return false !== flag;
};

let step = 0;

/**
 * Reset the step counter. Call at the start of a generation run.
 *
 * @param label Label for the run.
 */
export const aiDebugStart = ( label: string ) => {
	step = 0;

	if ( ! isEnabled() ) {
		return;
	}

	// eslint-disable-next-line no-console
	console.group( `%c[Otter AI] ${ label }`, 'color:#3858e9;font-weight:bold' );
};

/**
 * Log a single pipeline step with an incrementing counter and optional payload.
 *
 * @param message Human-readable step description.
 * @param payload Optional structured data to inspect.
 */
export const aiDebug = ( message: string, payload?: unknown ) => {
	if ( ! isEnabled() ) {
		return;
	}

	step++;

	// eslint-disable-next-line no-console
	console.log(
		`%c[Otter AI] ${ step }. ${ message }`,
		'color:#3858e9',
		void 0 === payload ? '' : payload
	);
};

/**
 * Close the current generation run group.
 */
export const aiDebugEnd = () => {
	if ( ! isEnabled() ) {
		return;
	}

	// eslint-disable-next-line no-console
	console.groupEnd();
};
