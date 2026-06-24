import {
	appendAgentContextEntry,
	buildAgentContext,
	buildContextEntryFromPayload,
	emptyAgentContext,
	formatAgentSessionForPrompt
} from '../../plugins/ai-content/agent-context';
import { buildSessionMemory } from '../../plugins/ai-content/session-memory';

describe( 'agent session context', () => {
	const turns = [
		{
			meta: {
				prompt: 'Add a progress bar at the bottom',
				route: 'structure' as const,
				tool: 'search_blocks' as const,
				operation: {
					tool: 'search_blocks' as const
				},
				contextEntry: {
					step: 1,
					kind: 'block_search' as const,
					query: 'progress bar',
					payload: 'themeisle-blocks/progress-bar: Progress Bar — Show progress'
				}
			}
		},
		{
			meta: {
				prompt: 'Set it to 80%',
				route: 'patch' as const,
				tool: 'patch' as const,
				operation: {
					tool: 'patch' as const,
					patches: [{ id: '2', attributes: { percentage: 80 } }]
				}
			}
		}
	];

	it( 'builds rolling gathered facts from prior turns', () => {
		const context = buildAgentContext( turns );

		expect( context.entries ).toHaveLength( 1 );
		expect( context.entries[0].payload ).toContain( 'progress-bar' );
	});

	it( 'formats a chat-like session transcript for the model', () => {
		const memory = buildSessionMemory( turns );
		const formatted = formatAgentSessionForPrompt({
			memory,
			context: buildAgentContext( turns )
		});

		expect( formatted[0] ).toContain( 'Session — prior turns' );
		expect( formatted[0] ).toContain( 'Add a progress bar at the bottom' );
		expect( formatted[0] ).toContain( 'Set it to 80%' );
		expect( formatted[0] ).toContain( 'gathered' );
		expect( formatted[0] ).toContain( 'Gathered facts' );
	});

	it( 'appends and trims context entries', () => {
		let context = emptyAgentContext();

		for ( let index = 0; index < 6; index += 1 ) {
			context = appendAgentContextEntry( context, buildContextEntryFromPayload( index + 1, {
				kind: 'block_search',
				query: `q${ index }`,
				payload: `hit-${ index }`
			}) );
		}

		expect( context.entries ).toHaveLength( 4 );
		expect( context.entries[0].step ).toBe( 3 );
	});
});
