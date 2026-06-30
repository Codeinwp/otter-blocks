import { BLOCK_GENERATION_SYSTEM_PROMPT } from '../../plugins/ai-content/prompts/system';
import { PIPELINE_STEP } from '../../plugins/ai-content/prompts/phases';

describe( 'AI prompts', () => {
	it( 'documents the two-flow serial pipeline in the system prompt', () => {
		expect( BLOCK_GENERATION_SYSTEM_PROMPT ).toContain( 'SERIAL multi-step pipeline' );
		expect( BLOCK_GENERATION_SYSTEM_PROMPT ).toContain( 'GENERATE' );
		expect( BLOCK_GENERATION_SYSTEM_PROMPT ).toContain( 'EDIT' );
		expect( BLOCK_GENERATION_SYSTEM_PROMPT ).toContain( 'strict JSON' );
	});

	it( 'defines exactly the collapsed pipeline steps', () => {
		expect( Object.keys( PIPELINE_STEP ).sort() ).toEqual(
			[ 'CONSTRUCT', 'DECIDE_EDIT', 'PAGE_OUTLINE', 'PLAN', 'REWRITE', 'SECTION_OUTLINE', 'TEXT_EDIT' ]
		);
	});

	it( 'labels each pipeline step in user prompts', () => {
		expect( PIPELINE_STEP.PLAN ).toContain( 'Pipeline step:' );
		expect( PIPELINE_STEP.CONSTRUCT ).toContain( 'CONSTRUCT' );
		expect( PIPELINE_STEP.PAGE_OUTLINE ).toContain( 'PAGE_OUTLINE' );
		expect( PIPELINE_STEP.SECTION_OUTLINE ).toContain( 'SECTION_OUTLINE' );
		expect( PIPELINE_STEP.DECIDE_EDIT ).toContain( 'DECIDE_EDIT' );
		expect( PIPELINE_STEP.TEXT_EDIT ).toContain( 'TEXT_EDIT' );
		expect( PIPELINE_STEP.REWRITE ).toContain( 'REWRITE' );
	});
});
