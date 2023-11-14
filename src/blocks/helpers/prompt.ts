import { createBlock } from '@wordpress/blocks';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

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

type ChatResponse = {
	choices: {
		finish_reason: string,
		index: number,
		message: {
			content: string,
			role: string
			function_call?: {
				name: string
				arguments: string
			}
		}
	}[]
	created: number
	id: string
	model: string
	object: string
	usage: {
		completion_tokens: number,
		prompt_tokens: number,
		total_tokens: number
	},
	error?: {
		code: string | null,
		message: string
		param: string | null
		type: string
	}
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
	functions: {
		name: string
		description: string
		parameters: any
	}
	function_call: {
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
 * Create a prompt request emebdded with the given settings.
 *
 * @param settings
 */
function promptRequestBuilder( settings?: OpenAiSettings ) {

	settings ??= {
		stream: false
	};

	// TODO: remove the apiKey from the function definition.
	return async( prompt: string, embeddedPrompt: PromptData, metadata: Record<string, string> ) => {

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
			for ( let key in obj ) {
				if ( key.startsWith( 'otter_' ) ) {
					delete obj[key];
				}
			}
			return obj;
		}

		try {
			const response = await apiFetch({
				path: addQueryArgs( '/otter/v1/generate', {}),
				method: 'POST',
				body: JSON.stringify({
					...( metadata ?? {}),
					...( removeOtterKeys( body ) ),
					...settings
				})
			});

			return response as ChatResponse;
		} catch ( e ) {
			return {
				error: {
					code: 'system',
					message: e.error?.message ?? e.error
				}
			};
		}

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
	// eslint-disable-next-line camelcase
	stream: false
});

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
 * @returns - The parsed response or undefined.
 */
export function tryParseResponse( promptResponse: string ) {
	try {
		return JSON.parse( promptResponse );
	} catch ( e ) {
		return undefined;
	}
}

/**
 * Create a block from a form prompt response.
 *
 * @param promptResponse - The prompt response to parse.
 * @returns - An array of blocks Form field blocks.
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
 * @returns - A promise that resolves to the server's response.
 */
export function retrieveEmbeddedPrompt( promptName ?: string ) {
	return apiFetch<PromptServerResponse>({
		path: addQueryArgs( '/otter/v1/prompt', {
			name: promptName
		}),
		method: 'GET'
	});
}

/**
 * This function injects an action into an existing prompt.
 *
 * @param embeddedPrompt - The existing prompt data.
 * @param actionPrompt - The action to be injected.
 * @returns - The updated prompt data with the action injected.
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
 * @param conversation - The conversation to be injected.
 * @returns - The updated prompt data with the conversation injected.
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
