import {
	SESSION_HISTORY_LIMIT,
	extractPromptHistory,
	formatSessionHistoryForPrompt,
	trimSessionHistory
} from '../../plugins/ai-content/session-history';

describe( 'session history', () => {
	it( 'keeps only the last three prompts', () => {
		expect( extractPromptHistory([
			{ meta: { prompt: 'one' } },
			{ meta: { prompt: 'two' } },
			{ meta: { prompt: 'three' } },
			{ meta: { prompt: 'four' } }
		]) ).toEqual([ 'two', 'three', 'four' ]);
	});

	it( 'respects a custom limit', () => {
		expect( trimSessionHistory([ 'a', 'b', 'c' ], 2 ) ).toEqual([ 'b', 'c' ]);
	});

	it( 'formats history for prompts with a last-few note', () => {
		const formatted = formatSessionHistoryForPrompt([
			'first',
			'second',
			'third',
			'fourth'
		]);

		expect( formatted ).toHaveLength( 1 );
		expect( formatted[0] ).toContain( 'last few only' );
		expect( formatted[0] ).toContain( '2. third' );
		expect( formatted[0] ).toContain( '3. fourth' );
		expect( formatted[0] ).not.toContain( '1. first' );
	});

	it( 'exports a default limit of three', () => {
		expect( SESSION_HISTORY_LIMIT ).toBe( 3 );
	});
});
