/**
 * Failure states for the AI content modal. Turns the backend's normalized
 * PromptError (code, type, message, HTTP status in `raw`; see helpers/prompt.ts)
 * into a small AIError: a human-readable message plus whether re-running the same
 * prompt is worth a Retry.
 */
import { __ } from '@wordpress/i18n';
import type { PromptError } from '../../helpers/prompt';

export type AIErrorKind =
	| 'no-provider'
	| 'auth'
	| 'rate-limit'
	| 'timeout'
	| 'network'
	| 'server'
	| 'invalid-output'
	| 'empty'
	| 'unknown';

export type AIError = {
	kind: AIErrorKind;
	message: string;
	/** Whether re-running the exact same prompt is worth offering as a Retry. */
	retryable: boolean;
};

/**
 * An error thrown from a prompt request, carrying the backend's error metadata so
 * the catch site can classify it instead of losing everything but the message.
 */
export class PromptRequestError extends Error {
	code: string | null;
	type?: string;
	status?: number;

	constructor( error: PromptError, status?: number ) {
		super( error.message );
		this.name = 'PromptRequestError';
		this.code = error.code;
		this.type = error.type;
		this.status = status;
	}
}

const MESSAGES: Record<AIErrorKind, string> = {
	'no-provider': __( 'No AI provider is connected. Add one in the AI settings, then try again.', 'otter-blocks' ),
	auth: __( 'Your AI provider rejected the request. Check the API key in the AI settings.', 'otter-blocks' ),
	'rate-limit': __( 'The AI service is busy right now. Wait a few seconds and try again.', 'otter-blocks' ),
	timeout: __( 'The request timed out. Try again, or shorten your prompt.', 'otter-blocks' ),
	network: __( 'Couldn’t reach the AI service. Check your connection and try again.', 'otter-blocks' ),
	server: __( 'The AI service ran into a problem. Please try again.', 'otter-blocks' ),
	'invalid-output': __( 'Otter AI couldn’t build a valid result. Try rephrasing your request.', 'otter-blocks' ),
	empty: __( 'The AI service returned an empty response. Please try again.', 'otter-blocks' ),
	unknown: __( 'Something went wrong. Please try again.', 'otter-blocks' )
};

const RETRYABLE: Record<AIErrorKind, boolean> = {
	'no-provider': false,
	auth: false,
	'rate-limit': true,
	timeout: true,
	network: true,
	server: true,
	'invalid-output': true,
	empty: true,
	unknown: true
};

/**
 * Build an AIError from a known kind, with an optional message override.
 * @param kind
 * @param message
 */
export const aiError = ( kind: AIErrorKind, message?: string ): AIError => ( {
	kind,
	message: message || MESSAGES[ kind ],
	retryable: RETRYABLE[ kind ]
} );

const AUTH_CODES = new Set( [ 'invalid_api_key', 'invalid_request_error', 'authentication_error', 'insufficient_quota', 'account_deactivated' ] );
const AUTH_MESSAGE = /api key|unauthor|forbidden|invalid[_ ]?key|no ai provider|not configured|quota/i;
const RATE_MESSAGE = /rate.?limit|too many requests|overloaded/i;
const TIMEOUT_MESSAGE = /tim(?:e|ed)\s?out|timeout|cURL error 28|gateway time/i;
const NETWORK_CODES = new Set( [ 'prompt_network_error', 'http_request_failed', 'fetch_error', 'timeout', 'aborted' ] );
const NETWORK_MESSAGE = /network|failed to fetch|bad gateway|temporarily unavailable|connection/i;

/**
 * Classify a thrown prompt failure into a meaningful, actionable AIError.
 * Prefers the backend's structured code/status; falls back to matching the
 * message text; defaults to a generic (still retryable) unknown error.
 *
 * @param {unknown} thrown The value caught from a failed request.
 * @return {AIError} The classified error.
 */
export const describePromptError = ( thrown: unknown ): AIError => {
	const err = thrown as Partial<PromptRequestError> & { message?: string };
	const code = ( err?.code ?? '' ).toString().toLowerCase();
	const status = 'number' === typeof err?.status ? err.status : undefined;
	const message = err?.message ?? '';

	// An empty/blank response from the service.
	if ( 'empty_response' === code ) {
		return aiError( 'empty' );
	}

	// Auth / configuration — permanent until the user fixes settings.
	if ( 401 === status || 403 === status || AUTH_CODES.has( code ) || AUTH_MESSAGE.test( message ) ) {
		return aiError( 'auth' );
	}

	// Rate limiting — transient, worth a retry after a beat.
	if ( 429 === status || 'rate_limit_exceeded' === code || RATE_MESSAGE.test( message ) ) {
		return aiError( 'rate-limit' );
	}

	// Timeouts — the backend's retry already gave up; let the user retry.
	if ( 408 === status || 504 === status || TIMEOUT_MESSAGE.test( message ) ) {
		return aiError( 'timeout' );
	}

	// Upstream 5xx that isn't a timeout.
	if ( 'number' === typeof status && 500 <= status ) {
		return aiError( 'server' );
	}

	// Network / connectivity.
	if ( NETWORK_CODES.has( code ) || NETWORK_MESSAGE.test( message ) ) {
		return aiError( 'network' );
	}

	// Anything else — keep the backend's own wording when we have it.
	return aiError( 'unknown', message || undefined );
};
