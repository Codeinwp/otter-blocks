import { createBlock } from '@wordpress/blocks';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

type PromptResponse = {
	result: string
	error?: string
}

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

export type PromptData = {
	otter_name: string
	model: string
	messages: {
		role: string
		content: string
	}[]
	functions: {
		name: string
		description: string
		parameters: any
	}
	function_call: {
		[key: string]: string
	}
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

	return async( prompt: string, apiKey: string, embeddedPrompt: PromptData ) => {
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
			const response = await fetch( 'https://api.openai.com/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',

					// The Authorization header contains your API key
					Authorization: `Bearer ${apiKey}`
				},
				body: JSON.stringify({
					...( removeOtterKeys( body ) ),
					...settings
				})
			});

			return await response.json() as ChatResponse;
		} catch ( e ) {
			return {
				error: {
					code: 'system',
					message: e.message
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

export function parseToDisplayPromptResponse( promptResponse: string ) {
	const response = tryParseResponse( promptResponse ) as FormResponse|undefined;

	if ( ! response ) {
		return [];
	}

	return response?.fields.map( ( field ) => {
		return {
			label: field?.label,
			type: field?.type,
			placeholder: field?.placeholder,
			helpText: field?.helpText,
			options: field?.choices?.join( '\n' ),
			allowedFileTypes: field?.allowedFileTypes
		};
	}).filter( Boolean );
}

function tryParseResponse( promptResponse: string ) {
	try {
		return JSON.parse( promptResponse );
	} catch ( e ) {
		return undefined;
	}
}

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

export function retrieveEmbeddedPrompt( promptName ?: string ) {
	return apiFetch<PromptServerResponse>({
		path: addQueryArgs( '/otter/v1/prompt', {
			name: promptName
		}),
		method: 'GET'
	});
}
