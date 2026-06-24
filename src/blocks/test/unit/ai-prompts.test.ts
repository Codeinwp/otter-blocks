import { BLOCK_GENERATION_SYSTEM_PROMPT } from '../../plugins/ai-content/prompts/system';
import { PIPELINE_STEP } from '../../plugins/ai-content/prompts/phases';
import { buildRoutePrompt } from '../../plugins/ai-content/prompts/route';

describe( 'AI prompts', () => {
	it( 'documents the serial pipeline in the system prompt', () => {
		expect( BLOCK_GENERATION_SYSTEM_PROMPT ).toContain( 'SERIAL multi-step pipeline' );
		expect( BLOCK_GENERATION_SYSTEM_PROMPT ).toContain( 'EDIT' );
		expect( BLOCK_GENERATION_SYSTEM_PROMPT ).toContain( 'GENERATE' );
		expect( BLOCK_GENERATION_SYSTEM_PROMPT ).toContain( 'patches' );
		expect( BLOCK_GENERATION_SYSTEM_PROMPT ).toContain( 'strict JSON' );
	});

	it( 'labels each pipeline step in user prompts', () => {
		expect( PIPELINE_STEP.ROUTE ).toContain( 'Pipeline step: ROUTE' );
		expect( PIPELINE_STEP.BRIEF ).toContain( 'OUTLINE' );
		expect( PIPELINE_STEP.PATTERN_SEARCH ).toContain( 'SEARCH' );
		expect( PIPELINE_STEP.EDIT ).toContain( 'EDIT' );
	});

	it( 'builds a route prompt with history and instruction', () => {
		const prompt = buildRoutePrompt({
			instruction: 'Make it shorter',
			hasReferenceBlocks: true,
			isCreateMode: false,
			isExplicitRefine: false,
			sessionHistory: [ 'Write a hero' ]
		});

		expect( prompt ).toContain( PIPELINE_STEP.ROUTE );
		expect( prompt ).toContain( 'Make it shorter' );
		expect( prompt ).toContain( 'Write a hero' );
		expect( prompt ).toContain( '"mode": "edit" | "structure" | "generate"' );
	});
});
