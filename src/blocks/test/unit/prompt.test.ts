import { createBlock } from '@wordpress/blocks';
import {
	editLastConversation,
	injectActionIntoPrompt,
	injectConversationIntoPrompt,
	parseFormPromptResponseToBlocks,
	tryInjectIntoTemplate,
	tryParseResponse
} from '../../helpers/prompt';

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
});
