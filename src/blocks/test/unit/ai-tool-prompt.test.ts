jest.mock( 'uuid', () => ({
	v4: () => 'mocked-uuid'
}) );

jest.mock( '@wordpress/blocks', () => require( './mocks/wordpress-blocks' ) );

import { buildToolCallPrompt } from '../../plugins/ai-content/operations/prompt';

const samplePatterns = [
	{
		name: 'otter-blocks/hero-pricing',
		title: 'Hero with pricing',
		description: 'A bold hero section with three pricing cards.',
		categories: [ 'hero' ],
		content: '<!-- wp:heading --><h2>Hero</h2><!-- /wp:heading -->'
	}
];

describe( 'tool-call prompt', () => {
	it( 'prioritizes adapt_pattern for general create-mode requests', () => {
		const prompt = buildToolCallPrompt({
			instruction: 'A hero for a dental clinic',
			referenceBlocks: [],
			blockTypes: [],
			themeColors: [],
			getBlockType: () => undefined,
			hasReferenceBlocks: false,
			isCreateMode: true,
			isExplicitRefine: false,
			patterns: samplePatterns
		});

		expect( prompt ).toContain( 'adapt_pattern' );
		expect( prompt ).toContain( 'search_patterns' );
		expect( prompt ).toContain( 'preferPatternAdapt: true' );
		expect( prompt ).toContain( 'PREFERRED' );
		expect( prompt ).toContain( 'LAST RESORT' );
	});

	it( 'nudges adapt_pattern after pattern search gathered facts', () => {
		const prompt = buildToolCallPrompt({
			instruction: 'Use the hero pattern',
			referenceBlocks: [],
			blockTypes: [],
			themeColors: [],
			getBlockType: () => undefined,
			hasReferenceBlocks: false,
			isCreateMode: true,
			isExplicitRefine: false,
			patterns: samplePatterns,
			agentContext: {
				entries: [{
					step: 1,
					kind: 'pattern_search',
					query: 'hero',
					payload: 'otter-blocks/hero-pricing: Hero with pricing'
				}]
			}
		});

		expect( prompt ).toContain( 'adapt_pattern with the best matching patternName' );
		expect( prompt ).toContain( 'otter-blocks/hero-pricing' );
	});
});
