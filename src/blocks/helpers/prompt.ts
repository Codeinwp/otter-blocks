import { createBlock } from '@wordpress/blocks';

const OPENAI_API_KEY  = 'ADD_YOUR_KEY';

const embeddedPrompt = 'Add instruction ';

type PromptResponse = {
	result: string
	error?: string
}

type ChatResponse = {
	choices: {
		finish_reason: string,
		index: number,
		message: {
			content: string,
			role: string
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
	}
}

type FormResponse = {
	label: string
	type: string
	placeholder?: string
	helpText?: string
	choices?: string[]
	allowedFileTypes?: string[]
	required?: boolean
}[]

export async function sendPromptToOpenAI( prompt: string ) {

	// Make a request to the OpenAI API using fetch then parse the response

	const response = await fetch( 'https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',

			// The Authorization header contains your API key
			Authorization: `Bearer ${OPENAI_API_KEY}`
		},
		body: JSON.stringify({
			model: 'gpt-3.5-turbo',
			messages: [{
				role: 'user',
				content: embeddedPrompt + prompt
			}],
			temperature: 0.2,
			// eslint-disable-next-line camelcase
			top_p: 1,
			stream: false
		})
	});

	if ( ! response.ok ) {
		return {
			result: '',
			error: `Error ${response.status}: ${response.statusText}`
		};
	}

	const data = await response.json() as ChatResponse;

	return {
		result: data.choices?.[0]?.message.content ?? '',
		error: undefined
	};
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

export function parseFormPromptResponse( promptResponse: string ) {
	if ( ! promptResponse ) {
		return [];
	}

	const formResponse = JSON.parse( promptResponse ) as FormResponse;

	return formResponse.map( ( field ) => {
		return createBlock( fieldMapping[field.type], {
			label: field.label,
			placeholder: field.placeholder,
			helpText: field.helpText,
			options: field.choices?.join( '\n' ),
			allowedFileTypes: field.allowedFileTypes
		});
	}).filter( Boolean );
}

export function replaceInnerBlockWithPrompt( blockClientId: string, promptResponse: string ) {

	console.log( '[Call] replaceInnerBlockWithPrompt', blockClientId, promptResponse );

	if ( blockClientId === undefined ) {
		return;
	}

	const formFields = parseFormPromptResponse( promptResponse );

	if ( ! formFields.length ) {
		return;
	}

	console.log( 'replaceInnerBlockWithPrompt', blockClientId, formFields );

	const { replaceInnerBlocks } = window.wp.data.dispatch( 'core/block-editor' );

	replaceInnerBlocks( blockClientId, formFields );
}

