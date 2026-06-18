import { createBlock } from '@wordpress/blocks';
import {
	editLastConversation,
	injectActionIntoPrompt,
	injectConversationIntoPrompt,
	isTransientPromptError,
	normalizePromptResponse,
	parseFormPromptResponseToBlocks,
	tryInjectIntoTemplate,
	tryParseResponse,
	withPromptRetry
} from '../../helpers/prompt';

import type { PromptResult } from '../../helpers/prompt';

jest.mock( '@wordpress/api-fetch', () => jest.fn(), { virtual: true } );
jest.mock( '@wordpress/url', () => ({
	addQueryArgs: ( path: string ) => path
}), { virtual: true } );

jest.mock( '@wordpress/blocks', () => ({
	createBlock: jest.fn( ( name, attributes ) => ({ name, attributes }))
}) );

describe( 'prompt helpers', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	});

	describe( 'tryParseResponse', () => {
		it( 'parses valid json payloads', () => {
			expect( tryParseResponse( '{"ok":true}' ) ).toEqual({ ok: true });
		});

		it( 'returns undefined for invalid json payloads', () => {
			expect( tryParseResponse( '{invalid' ) ).toBeUndefined();
		});
	});

	describe( 'parseFormPromptResponseToBlocks', () => {
		it( 'returns empty array when prompt response is missing or invalid', () => {
			expect( parseFormPromptResponseToBlocks( '' ) ).toEqual([]);
			expect( parseFormPromptResponseToBlocks( '{invalid' ) ).toEqual([]);
			expect( createBlock ).not.toHaveBeenCalled();
		});

		it( 'creates blocks only for supported form fields', () => {
			const payload = JSON.stringify({
				fields: [
					{
						label: 'Full Name',
						type: 'text',
						placeholder: 'Your name'
					},
					{
						label: 'Role',
						type: 'select',
						choices: [ 'Engineer', 'Designer' ]
					},
					{
						label: 'Unsupported',
						type: 'unknown'
					}
				]
			});

			const result = parseFormPromptResponseToBlocks( payload );

			expect( result ).toHaveLength( 2 );
			expect( createBlock ).toHaveBeenCalledTimes( 2 );
			expect( createBlock ).toHaveBeenNthCalledWith(
				1,
				'themeisle-blocks/form-input',
				expect.objectContaining({
					label: 'Full Name',
					placeholder: 'Your name'
				})
			);
			expect( createBlock ).toHaveBeenNthCalledWith(
				2,
				'themeisle-blocks/form-multiple-choice',
				expect.objectContaining({
					label: 'Role',
					options: 'Engineer\nDesigner'
				})
			);
		});
	});

	describe( 'normalizePromptResponse', () => {
		it( 'normalizes native route success responses', () => {
			expect( normalizePromptResponse({
				content: 'Native content',
				usedTokens: 12,
				format: 'text'
			} as any ) ).toEqual(
				expect.objectContaining({
					ok: true,
					content: 'Native content',
					usedTokens: 12
				})
			);
		});

		it( 'defaults token usage to zero when missing', () => {
			expect( normalizePromptResponse({
				content: '{"fields":[]}',
				format: 'json'
			} as any ) ).toEqual(
				expect.objectContaining({
					ok: true,
					content: '{"fields":[]}',
					usedTokens: 0
				})
			);
		});

		it( 'returns a failed result for unexpected response shapes', () => {
			expect( normalizePromptResponse({
				error: {
					code: 'system',
					message: 'Failed',
					param: null,
					type: 'openai'
				}
			} as any ) ).toEqual(
				expect.objectContaining({
					ok: false,
					error: expect.objectContaining({
						code: 'invalid_response',
						type: 'system'
					})
				})
			);
		});
	});

	describe( 'injectActionIntoPrompt', () => {
		it( 'replaces action placeholder for user messages only', () => {
			const prompt = {
				messages: [
					{ role: 'system', content: '{ACTION}' },
					{ role: 'user', content: 'Please {ACTION}' }
				]
			} as any;

			const result = injectActionIntoPrompt( prompt, 'shorten this sentence' );

			expect( result.messages ).toEqual([
				{ role: 'system', content: '{ACTION}' },
				{ role: 'user', content: 'Please shorten this sentence' }
			]);
		});
	});

	describe( 'injectConversationIntoPrompt', () => {
		it( 'inserts a conversation before the last user message', () => {
			const prompt = {
				messages: [
					{ role: 'system', content: 'sys' },
					{ role: 'user', content: 'first' },
					{ role: 'assistant', content: 'answer' },
					{ role: 'user', content: 'last' }
				]
			} as any;

			const result = injectConversationIntoPrompt( prompt, { role: 'assistant', content: 'new context' } );

			expect( result.messages ).toEqual([
				{ role: 'system', content: 'sys' },
				{ role: 'user', content: 'first' },
				{ role: 'assistant', content: 'answer' },
				{ role: 'assistant', content: 'new context' },
				{ role: 'user', content: 'last' }
			]);
		});

		it( 'returns prompt unchanged when there is no user message', () => {
			const prompt = {
				messages: [
					{ role: 'system', content: 'sys' },
					{ role: 'assistant', content: 'answer' }
				]
			} as any;

			expect( injectConversationIntoPrompt( prompt, { role: 'assistant', content: 'new' } ) ).toEqual( prompt );
		});
	});

	describe( 'tryInjectIntoTemplate', () => {
		it( 'injects content into the template placeholder', () => {
			expect( tryInjectIntoTemplate( 'Rewrite: {text_input}', 'my text' ) ).toBe( 'Rewrite: my text' );
		});

		it( 'appends content when placeholder is missing', () => {
			expect( tryInjectIntoTemplate( 'Rewrite', 'my text' ) ).toBe( 'Rewrite my text' );
		});

		it( 'returns content when template is empty', () => {
			expect( tryInjectIntoTemplate( '', 'my text' ) ).toBe( 'my text' );
		});
	});

	describe( 'editLastConversation', () => {
		it( 'edits and truncates at the last user message', () => {
			const prompt = {
				messages: [
					{ role: 'system', content: 'sys' },
					{ role: 'user', content: 'first' },
					{ role: 'assistant', content: 'response' },
					{ role: 'user', content: 'second' },
					{ role: 'assistant', content: 'tail' }
				]
			} as any;

			const result = editLastConversation( prompt, content => `${content} updated` );

			expect( result.messages ).toEqual([
				{ role: 'system', content: 'sys' },
				{ role: 'user', content: 'first' },
				{ role: 'assistant', content: 'response' },
				{ role: 'user', content: 'second updated' }
			]);
		});

		it( 'returns prompt unchanged when no user message exists', () => {
			const prompt = {
				messages: [
					{ role: 'system', content: 'sys' },
					{ role: 'assistant', content: 'answer' }
				]
			} as any;

			expect( editLastConversation( prompt, () => 'ignored' ) ).toEqual( prompt );
		});
	});

	describe( 'isTransientPromptError', () => {
		it( 'flags the WP AI Client network timeout (cURL 28 / 502)', () => {
			const result: PromptResult = {
				ok: false,
				error: {
					code: 'prompt_network_error',
					message: 'Network error occurred ... cURL error 28: Operation timed out after 30002 milliseconds',
					type: 'wp_ai_client'
				},
				raw: { data: { status: 502 }}
			};

			expect( isTransientPromptError( result ) ).toBe( true );
		});

		it( 'flags transient HTTP statuses from the raw payload', () => {
			const result: PromptResult = {
				ok: false,
				error: { code: 'some_code', message: 'Service unavailable' },
				raw: { data: { status: 503 }}
			};

			expect( isTransientPromptError( result ) ).toBe( true );
		});

		it( 'does not retry permanent errors or successes', () => {
			expect( isTransientPromptError({
				ok: false,
				error: { code: 'invalid_api_key', message: 'Incorrect API key provided.' },
				raw: { data: { status: 401 }}
			}) ).toBe( false );

			expect( isTransientPromptError({ ok: true, content: 'hi', usedTokens: 1, raw: {}}) ).toBe( false );
		});
	});

	describe( 'withPromptRetry', () => {
		const transient: PromptResult = {
			ok: false,
			error: { code: 'prompt_network_error', message: 'timed out' },
			raw: { data: { status: 502 }}
		};
		const success: PromptResult = { ok: true, content: '{}', usedTokens: 5, raw: {}};

		it( 'retries a transient failure then returns the success', async() => {
			const attempt = jest.fn()
				.mockResolvedValueOnce( transient )
				.mockResolvedValueOnce( success );

			const result = await withPromptRetry( attempt, { retries: 2, baseDelay: 0 });

			expect( attempt ).toHaveBeenCalledTimes( 2 );
			expect( result ).toEqual( success );
		});

		it( 'stops after exhausting retries and returns the last failure', async() => {
			const attempt = jest.fn().mockResolvedValue( transient );

			const result = await withPromptRetry( attempt, { retries: 2, baseDelay: 0 });

			expect( attempt ).toHaveBeenCalledTimes( 3 );
			expect( result ).toEqual( transient );
		});

		it( 'does not retry a permanent failure', async() => {
			const permanent: PromptResult = {
				ok: false,
				error: { code: 'invalid_api_key', message: 'bad key' },
				raw: { data: { status: 401 }}
			};
			const attempt = jest.fn().mockResolvedValue( permanent );

			const result = await withPromptRetry( attempt, { retries: 2, baseDelay: 0 });

			expect( attempt ).toHaveBeenCalledTimes( 1 );
			expect( result ).toEqual( permanent );
		});
	});
});
