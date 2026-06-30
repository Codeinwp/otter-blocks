/**
 * Lightweight, opt-in debug logging for the AI content pipeline.
 *
 * Off by default so production stays silent. Turn it on at runtime (no rebuild)
 * from the browser console with either:
 *
 *   window.otterAiDebug = true;
 *   // or, to persist across reloads:
 *   localStorage.setItem( 'otter-ai-debug', '1' );
 *
 * Then run an AI action and watch the console: every prompt sent, every raw
 * response, the decider's verdict, the route taken, the text fragments, and the
 * validity of the generated markup are logged in collapsed groups.
 */

type DebugWindow = Window & {
	otterAiDebug?: boolean;
};

/** Whether debug logging is currently enabled. Cheap; checked per call. */
export const isAiDebugEnabled = (): boolean => {
	if ( 'undefined' === typeof window ) {
		return false;
	}

	if ( true === ( window as DebugWindow ).otterAiDebug ) {
		return true;
	}

	try {
		return '1' === window.localStorage?.getItem( 'otter-ai-debug' );
	} catch ( error ) {
		return false;
	}
};

const PREFIX = '%c[Otter AI]';
const STYLE = 'color:#fff;background:#5b2bda;padding:1px 5px;border-radius:3px;font-weight:600';

/** Log a single labeled payload (no grouping). */
export const aiDebug = ( label: string, data?: unknown ): void => {
	if ( ! isAiDebugEnabled() ) {
		return;
	}

	// eslint-disable-next-line no-console
	if ( undefined === data ) {
		// eslint-disable-next-line no-console
		console.log( PREFIX + ` ${ label }`, STYLE );
		return;
	}

	// eslint-disable-next-line no-console
	console.log( PREFIX + ` ${ label }`, STYLE, data );
};

/**
 * Log a payload inside a collapsed console group — useful for long prompts and
 * markup where you only want to expand the ones you care about.
 */
export const aiDebugGroup = ( label: string, body: () => void ): void => {
	if ( ! isAiDebugEnabled() ) {
		return;
	}

	// eslint-disable-next-line no-console
	console.groupCollapsed( PREFIX + ` ${ label }`, STYLE );
	try {
		body();
	} finally {
		// eslint-disable-next-line no-console
		console.groupEnd();
	}
};

/** Pull the human pipeline-step name out of a prompt's first line, if present. */
export const detectPipelineStep = ( prompt: string ): string => {
	const firstLine = ( prompt || '' ).split( '\n', 1 )[ 0 ] ?? '';
	const match = firstLine.match( /Pipeline step:\s*([A-Z_]+)/ );

	return match?.[ 1 ] ?? 'UNLABELED';
};
