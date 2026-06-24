import {
	buildSessionMemory,
	formatHistorySearchResults,
	formatSessionMemoryForPrompt,
	searchSessionMemory
} from '../../plugins/ai-content/session-memory';

describe( 'session memory', () => {
	const turns = [
		{
			meta: {
				prompt: 'Remove the hero image',
				route: 'structure' as const,
				tool: 'structure' as const,
				operation: {
					tool: 'structure' as const,
					remove: [ '0.1' ]
				},
				removedBlocks: {
					'0.1': {
						name: 'core/image',
						attributes: { alt: 'Hero' },
						innerBlocks: []
					}
				}
			}
		},
		{
			meta: {
				prompt: 'Make the headline shorter',
				route: 'patch' as const,
				tool: 'patch' as const,
				operation: {
					tool: 'patch' as const,
					patches: [{ id: '0', attributes: { content: 'Hi' } }]
				}
			}
		}
	];

	it( 'builds structured memory from turns', () => {
		const memory = buildSessionMemory( turns );

		expect( memory ).toHaveLength( 2 );
		expect( memory[0] ).toMatchObject({
			step: 1,
			prompt: 'Remove the hero image',
			tool: 'structure',
			summary: 'removed block ids: 0.1'
		});
		expect( memory[0].removedBlocks?.['0.1']?.name ).toBe( 'core/image' );
	});

	it( 'formats recent session memory for prompts', () => {
		const formatted = formatSessionMemoryForPrompt( buildSessionMemory( turns ) );

		expect( formatted[0] ).toContain( 'Session memory' );
		expect( formatted[0] ).toContain( 'Remove the hero image' );
		expect( formatted[0] ).toContain( 'removed snapshots: 0.1' );
	});

	it( 'searches session memory by query', () => {
		const memory = buildSessionMemory( turns );
		const results = searchSessionMemory( memory, { query: 'hero image' } );

		expect( results ).toHaveLength( 1 );
		expect( results[0].step ).toBe( 1 );
	});

	it( 'searches session memory by step number', () => {
		const memory = buildSessionMemory( turns );
		const results = searchSessionMemory( memory, { step: 2 } );

		expect( results ).toHaveLength( 1 );
		expect( results[0].prompt ).toContain( 'headline' );
	});

	it( 'formats search results with removed block snapshots', () => {
		const memory = buildSessionMemory( turns );
		const formatted = formatHistorySearchResults( searchSessionMemory( memory, { query: 'hero' } ) );

		expect( formatted ).toContain( 'removedBlocks' );
		expect( formatted ).toContain( 'core/image' );
	});
});
