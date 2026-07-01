import { createBlock } from '@wordpress/blocks';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { __ } from '@wordpress/i18n';

type OpenAiSettings = {
	model?: string
	temperature?: number
	max_tokens?: number
	top_p?: number
	stream?: boolean
	logprobs?: number
	presence_penalty?: number
	frequency_penalty?: number
	stop?: string|string[]
}

type PromptRouteSuccess = {
	content: string
	usedTokens?: number
	format?: 'text' | 'json' | string
}

export type PromptError = {
	code: string | null
	message: string
	param?: string | null
	type?: string
}

export type PromptResult = {
	ok: true
	content: string
	usedTokens: number
	raw: unknown
} | {
	ok: false
	error: PromptError
	raw?: unknown
}

type PromptRequestOptions = {
	signal?: AbortSignal
}

const createAbortedPromptResult = (): PromptResult => ({
	ok: false,
	error: {
		code: 'aborted',
		message: __( 'The request was cancelled.', 'otter-blocks' ),
		type: 'abort'
	}
});

/**
 * Whether a prompt result represents a user- or client-initiated abort.
 *
 * @param {PromptResult} result Normalized prompt result.
 * @return {boolean} True when the request was aborted.
 */
export function isPromptAborted( result: PromptResult ): boolean {
	return ! result.ok && 'aborted' === result.error.code;
}

type FormResponse = {
	fields: {
		label: string
		type: string
		placeholder?: string
		helpText?: string
		choices?: string[]
		allowedFileTypes?: string[]
		required?: boolean
	}[]
}

export type PromptConversation = {
	role: string
	content: string
}

export type PromptData = {
	otter_name: string
	model: string
	messages: PromptConversation[]
	functions?: {
		name: string
		description: string
		parameters: any
	}[]
	function_call?: 'auto' | 'none' | {
		[key: string]: string
	}
	[key: `otter_${string}`]: any
}

export type PromptsData = PromptData[]

type PromptServerResponse = {
	code: string
	error: string
	prompts: PromptsData
}

/**
 * Whether the resolved AI backend can generate: the WP AI Client backend
 * needs a configured provider; otherwise a legacy OpenAI key. Single gate
 * shared by every editor surface so they cannot disagree.
 *
 * @return {boolean} Whether AI generation is configured.
 */
export function isAIBackendConfigured(): boolean {
	return window.themeisleGutenberg?.aiClientActive
		? Boolean( window.themeisleGutenberg?.hasAIProvider )
		: Boolean( window.themeisleGutenberg?.hasOpenAiKey );
}

/**
 * Convert the route response into the UI prompt contract.
 *
 * Both backends return the normalized `{ content, usedTokens, format }` shape
 * (see AI_Response::success); errors arrive as thrown REST errors and are
 * handled by the request catch block.
 *
 * @param {PromptRouteSuccess|unknown} response The raw route response.
 * @return {PromptResult} Normalized prompt result.
 */
export function normalizePromptResponse( response: PromptRouteSuccess|unknown ): PromptResult {
	const result = response as PromptRouteSuccess;

	if ( 'string' === typeof result?.content ) {
		return {
			ok: true,
			content: result.content,
			usedTokens: result.usedTokens ?? 0,
			raw: response
		};
	}

	return {
		ok: false,
		error: {
			code: 'invalid_response',
			message: __( 'Received an unexpected response from the AI service. Please try again.', 'otter-blocks' ),
			type: 'system'
		},
		raw: response
	};
}

/*
 * Transient backend failures we should retry: gateway/timeout statuses, the WP
 * AI Client's network-error code, and cURL/timeout phrasing in the message. A
 * reasoning model behind /v1/responses can blow past the backend's 30s cURL
 * timeout and surface as a 502, which a quick retry usually rides out.
 *
 * invalid_json/rest_invalid_json land here too: a proxy can answer a slow request
 * with a raw HTML error page apiFetch fails to parse (no HTTP status), so the retry
 * is the only signal we have.
 */
const TRANSIENT_PROMPT_CODES = new Set([ 'prompt_network_error', 'http_request_failed', 'fetch_error', 'timeout', 'invalid_json', 'rest_invalid_json' ]);
const TRANSIENT_PROMPT_STATUSES = new Set([ 408, 425, 429, 500, 502, 503, 504 ]);
const TRANSIENT_PROMPT_MESSAGE = /tim(?:e|ed)\s?out|timeout|cURL error 28|network error|temporarily unavailable|bad gateway|gateway time/i;

/**
 * Decide whether a failed prompt result is a transient backend error worth
 * retrying (vs. a permanent one like a bad key or invalid request).
 *
 * @param {PromptResult} result The normalized prompt result.
 * @return {boolean} True when the failure looks transient.
 */
export function isTransientPromptError( result: PromptResult ): boolean {
	if ( result.ok ) {
		return false;
	}

	const code = result.error.code ?? '';
	if ( TRANSIENT_PROMPT_CODES.has( code ) ) {
		return true;
	}

	const raw = result.raw as { data?: { status?: number }, status?: number } | undefined;
	const status = raw?.data?.status ?? raw?.status;
	if ( 'number' === typeof status && TRANSIENT_PROMPT_STATUSES.has( status ) ) {
		return true;
	}

	return TRANSIENT_PROMPT_MESSAGE.test( result.error.message ?? '' );
}

const sleep = ( ms: number ) => new Promise( ( resolve ) => setTimeout( resolve, ms ) );

/**
 * Run a prompt request, retrying transient backend failures with exponential
 * backoff. The last result is returned whether it succeeded or not.
 *
 * @param {() => Promise<PromptResult>}            attempt   The single-attempt request.
 * @param {{retries?: number, baseDelay?: number}} [options] Retry tuning.
 * @return {Promise<PromptResult>}                           The final prompt result.
 */
export async function withPromptRetry(
	attempt: () => Promise<PromptResult>,
	{ retries = 2, baseDelay = 600, signal }: { retries?: number, baseDelay?: number, signal?: AbortSignal } = {}
): Promise<PromptResult> {
	if ( signal?.aborted ) {
		return createAbortedPromptResult();
	}

	let result = await attempt();

	if ( isPromptAborted( result ) ) {
		return result;
	}

	for ( let i = 0; i < retries && isTransientPromptError( result ); i++ ) {
		await sleep( baseDelay * Math.pow( 2, i ) );

		if ( signal?.aborted ) {
			return createAbortedPromptResult();
		}

		result = await attempt();

		if ( isPromptAborted( result ) ) {
			return result;
		}
	}

	return result;
}

/**
 * Remove client-side model pins when the WP AI Client backend is active.
 *
 * @param {Record<string, unknown>} payload Request body.
 * @return {Record<string, unknown>} Payload without a model field.
 */
function stripClientModelSelection( payload: Record<string, unknown> ): Record<string, unknown> {
	if ( ! window.themeisleGutenberg?.aiClientActive || ! Object.prototype.hasOwnProperty.call( payload, 'model' ) ) {
		return payload;
	}

	const { model, ...rest } = payload;
	return rest;
}

/**
 * Single POST to the generation proxy, normalized into a PromptResult. Network
 * and HTTP errors are caught and shaped so callers (and the retry helper) get a
 * consistent failure object instead of a thrown error.
 *
 * @param {Record<string, unknown>} payload The request body to forward.
 * @param                           signal
 * @return {Promise<PromptResult>} The normalized result.
 */
async function postGenerate( payload: Record<string, unknown>, signal?: AbortSignal ): Promise<PromptResult> {
	if ( signal?.aborted ) {
		return createAbortedPromptResult();
	}

	const requestPayload = stripClientModelSelection( payload );

	try {
		const response = await apiFetch({
			path: addQueryArgs( '/otter/v1/openai/generate', {}),
			method: 'POST',
			body: JSON.stringify( requestPayload ),
			signal
		});

		return normalizePromptResponse( response );
	} catch ( e ) {
		if ( signal?.aborted || 'AbortError' === e?.name ) {
			return createAbortedPromptResult();
		}

		return {
			ok: false,
			error: {
				code: e.code ?? e.error?.code ?? 'system',
				message: e.message ?? e.error?.message ?? e.error ?? 'Something went wrong.',
				param: e.data?.param ?? null,
				type: e.data?.type ?? 'system'
			},
			raw: e
		};
	}
}

/**
 * Create a prompt request emebdded with the given settings.
 *
 * @param settings
 */
function promptRequestBuilder( settings?: OpenAiSettings ) {

	settings ??= {
		stream: false
	};

	// TODO: remove the apiKey from the function definition.
	return async( prompt: string, embeddedPrompt: PromptData, metadata: Record<string, string> ): Promise<PromptResult> => {

		const body = {
			...embeddedPrompt,
			messages: embeddedPrompt.messages.map( ( message ) => {
				if ( 'user' === message.role && message.content.includes( '{INSERT_TASK}' ) ) {
					return {
						role: 'user',
						content: message.content.replace( '{INSERT_TASK}', prompt )
					};
				}

				return message;
			})
		};

		function removeOtterKeys( obj ) {
			for ( const key in obj ) {
				if ( key.startsWith( 'otter_' ) ) {
					delete obj[key];
				}
			}
			return obj;
		}

		const payload = {
			...( metadata ?? {}),
			...( removeOtterKeys( body ) ),
			...settings
		};

		return withPromptRetry( () => postGenerate( payload ) );
	};
}

/**
 * Send the prompt to OpenAI. This will be the default function.
 */
export const sendPromptToOpenAI = promptRequestBuilder();

/**
 * Send the prompt to OpenAI. This will have more randomness.
 */
export const sendPromptToOpenAIWithRegenerate = promptRequestBuilder({
	temperature: 1.3,

	stream: false
});

/*
 * The block generation pipeline ships its own instructions (block catalog +
 * strict JSON schema) inside the prompt, so it must NOT reuse the server-side
 * `textTransformation` template, whose system prompt forces plain HTML output.
 * Instead we forward a self-contained request to the same OpenAI proxy.
 */
import { BLOCK_GENERATION_SYSTEM_PROMPT } from '../plugins/ai-content/prompts/system';

export { BLOCK_GENERATION_SYSTEM_PROMPT };

/**
 * Forward a self-contained block generation request to the OpenAI proxy.
 *
 * Model selection is server-side: WordPress AI Client preferences on the WP
 * path, or the legacy OpenAI backend default when no key-based override exists.
 *
 * @param instruction Fully-built generation prompt (catalog + task + schema).
 * @param usedAction  Audit label recorded by AI_Usage ('blockGeneration' for the
 *                    AI block pipeline, 'aiChat' for the conversational modal).
 * @param options
 * @return Normalized prompt result (see normalizePromptResponse).
 */
export async function sendBlockGenerationPrompt(
	instruction: string,
	usedAction = 'blockGeneration',
	options: PromptRequestOptions = {}
): Promise<PromptResult> {
	const { signal } = options;
	const payload: Record<string, unknown> = {
		otter_used_action: usedAction,
		otter_user_content: instruction,
		messages: [
			{ role: 'system', content: BLOCK_GENERATION_SYSTEM_PROMPT },
			{ role: 'user', content: instruction }
		],
		response_format: { type: 'json_object' },
		max_tokens: 8192,
		stream: false
	};

	return withPromptRetry( () => postGenerate( payload, signal ), { signal } );
}

const fieldMapping = {
	'text': 'themeisle-blocks/form-input',
	'email': 'themeisle-blocks/form-input',
	'password': 'themeisle-blocks/form-input',
	'number': 'themeisle-blocks/form-input',
	'tel': 'themeisle-blocks/form-input',
	'url': 'themeisle-blocks/form-input',
	'date': 'themeisle-blocks/form-input',
	'time': 'themeisle-blocks/form-input',
	'select': 'themeisle-blocks/form-multiple-choice',
	'checkbox': 'themeisle-blocks/form-multiple-choice',
	'radio': 'themeisle-blocks/form-multiple-choice',
	'file': 'themeisle-blocks/form-file',
	'textarea': 'themeisle-blocks/form-textarea'

};

/**
 * Small helper to try to parse a prompt response without throwing an error.
 *
 * @param promptResponse - The prompt response to parse.
 * @return - The parsed response or undefined.
 */
export function tryParseResponse( promptResponse: string ) {
	try {
		return JSON.parse( promptResponse );
	} catch {
		return undefined;
	}
}

/**
 * Create a block from a form prompt response.
 *
 * @param promptResponse - The prompt response to parse.
 * @return - An array of blocks Form field blocks.
 */
export function parseFormPromptResponseToBlocks( promptResponse: string ) {
	if ( ! promptResponse ) {
		return [];
	}

	const formResponse = tryParseResponse( promptResponse ) as FormResponse|undefined;

	if ( ! formResponse ) {
		return [];
	}

	return formResponse?.fields?.map( ( field ) => {

		if ( ! fieldMapping?.[field.type]) {
			return undefined;
		}

		return createBlock( fieldMapping[field.type], {
			label: field.label,
			placeholder: field.placeholder,
			helpText: field.helpText,
			options: field.choices?.join( '\n' ),
			allowedFileTypes: field.allowedFileTypes
		});
	}).filter( Boolean );
}

/**
 * Retrieves an embedded prompt from the server.
 *
 * @param promptName - The name of the prompt to retrieve. If not provided, the default prompt is retrieved.
 * @return - A promise that resolves to the server's response.
 */
export function retrieveEmbeddedPrompt( promptName ?: string ) {
	return apiFetch<PromptServerResponse>({
		path: addQueryArgs( '/otter/v1/openai/prompt', {
			name: promptName
		}),
		method: 'GET'
	});
}

/**
 * This function injects an action into an existing prompt.
 *
 * @param embeddedPrompt - The existing prompt data.
 * @param actionPrompt   - The action to be injected.
 * @return - The updated prompt data with the action injected.
 */
export function injectActionIntoPrompt( embeddedPrompt: PromptData, actionPrompt: string ): PromptData {
	return {
		...embeddedPrompt,
		messages: embeddedPrompt.messages.map( ( message ) => {
			if ( 'user' === message.role && message.content.includes( '{ACTION}' ) ) {
				return {
					role: 'user',
					content: message.content.replace( '{ACTION}', actionPrompt )
				};
			}

			return message;
		})
	} as PromptData;
}

/**
 * This function injects a conversation into an existing prompt.
 *
 * @param embeddedPrompt - The existing prompt data.
 * @param conversation   - The conversation to be injected.
 * @return - The updated prompt data with the conversation injected.
 */
export function injectConversationIntoPrompt( embeddedPrompt: PromptData, conversation: PromptConversation ): PromptData {

	const { messages } = embeddedPrompt;
	const lastUserMessageIndex = messages.map( ( message ) => message.role ).lastIndexOf( 'user' );

	if ( -1 === lastUserMessageIndex ) {
		return embeddedPrompt;
	}

	return {
		...embeddedPrompt,
		messages: [
			...messages.slice( 0, lastUserMessageIndex ),
			conversation,
			...messages.slice( lastUserMessageIndex )
		]
	};
}

/**
 * Injects content into a template. If no match is found, adds the content at the end.
 *
 * @param template The template to inject into.
 * @param content  The content to inject.
 * @return The template with the content injected or appended.
 */
export function tryInjectIntoTemplate( template: string, content: string ): string {
	if ( ! template ) {
		return content;
	}

	let injected = template.replace( /\{text_input\}/gi, () => content || '{text_input}' );
	injected = injected.replace( /\{block_content\}/gi, () => content || '{block_content}' );

	return ( injected === template && content ) ? template + ' ' + content : injected;
}

/**
 * Edits the last conversation in the prompt data.
 *
 * @param embeddedPrompt The existing prompt data.
 * @param callback       The callback that returns the content to be injected.
 * @return The updated prompt data with the last conversation edited.
 */
export function editLastConversation( embeddedPrompt: PromptData, callback: ( currentContent?: string ) => string ): PromptData {
	const { messages } = embeddedPrompt;
	const lastUserMessageIndex = messages.map( ( message ) => message.role ).lastIndexOf( 'user' );

	if ( -1 === lastUserMessageIndex ) {
		return embeddedPrompt;
	}

	return {
		...embeddedPrompt,
		messages: [
			...messages.slice( 0, lastUserMessageIndex ),
			{
				role: 'user',
				content: callback( messages?.[ lastUserMessageIndex ]?.content )
			}
		]
	};
}
