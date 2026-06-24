import {
	parseRouteResponse,
	resolveGenerationRoute
} from '../../plugins/ai-content/routing/resolver';
import { classifyGenerationIntent } from '../../plugins/ai-content/routing/heuristics';

describe( 'AI intent routing heuristics', () => {
	it( 'uses the full pipeline when there is nothing to edit', () => {
		expect( classifyGenerationIntent({
			instruction: 'A hero for a dental clinic',
			hasReferenceBlocks: false,
			isCreateMode: true,
			isExplicitRefine: false
		}) ).toBe( 'full' );
	});

	it( 'uses the fast patch path for content edits on a selection', () => {
		expect( classifyGenerationIntent({
			instruction: 'Make the headline shorter',
			hasReferenceBlocks: true,
			isCreateMode: false,
			isExplicitRefine: false
		}) ).toBe( 'patch' );
	});

	it( 'uses the full pipeline for redesign requests', () => {
		expect( classifyGenerationIntent({
			instruction: 'Redesign this section completely from scratch',
			hasReferenceBlocks: true,
			isCreateMode: false,
			isExplicitRefine: true
		}) ).toBe( 'full' );
	});

	it( 'uses the fast patch path for explicit refine follow-ups', () => {
		expect( classifyGenerationIntent({
			instruction: 'Use a darker background',
			taskContext: 'Hero for a SaaS product',
			hasReferenceBlocks: true,
			isCreateMode: true,
			isExplicitRefine: true
		}) ).toBe( 'patch' );
	});

	it( 'uses the structure path for local block removals', () => {
		expect( classifyGenerationIntent({
			instruction: 'Remove the second image',
			hasReferenceBlocks: true,
			isCreateMode: false,
			isExplicitRefine: false
		}) ).toBe( 'structure' );
	});

	it( 'uses the structure path for adding a block to the existing layout', () => {
		expect( classifyGenerationIntent({
			instruction: 'Add a new pricing column',
			hasReferenceBlocks: true,
			isCreateMode: false,
			isExplicitRefine: false
		}) ).toBe( 'structure' );
	});

	it( 'uses the full pipeline for the first create-mode generation', () => {
		expect( classifyGenerationIntent({
			instruction: 'A features grid with three cards',
			hasReferenceBlocks: true,
			isCreateMode: true,
			isExplicitRefine: false
		}) ).toBe( 'full' );
	});
});

describe( 'AI route resolver', () => {
	it( 'parses model route JSON', () => {
		expect( parseRouteResponse( '{"mode":"edit","reason":"copy tweak"}' ) ).toBe( 'edit' );
		expect( parseRouteResponse( '{"mode":"generate"}' ) ).toBe( 'generate' );
		expect( parseRouteResponse( '{"mode":"unknown"}' ) ).toBeNull();
	});

	it( 'short-circuits to generate without blocks to edit', async() => {
		await expect( resolveGenerationRoute({
			instruction: 'Anything',
			hasReferenceBlocks: false,
			isCreateMode: false,
			isExplicitRefine: false
		}) ).resolves.toMatchObject({ mode: 'generate', route: 'full', source: 'heuristic' });
	});

	it( 'uses heuristics for transform edits without a routing model call', async() => {
		const requestCompletion = jest.fn( async() => '{"mode":"edit","reason":"text change"}' );

		await expect( resolveGenerationRoute({
			instruction: 'Make the headline shorter',
			hasReferenceBlocks: true,
			isCreateMode: false,
			isExplicitRefine: false,
			requestCompletion
		}) ).resolves.toMatchObject({ mode: 'edit', route: 'patch', source: 'heuristic' });

		expect( requestCompletion ).not.toHaveBeenCalled();
	});

	it( 'falls back to heuristics when model output is invalid', async() => {
		await expect( resolveGenerationRoute({
			instruction: 'Redesign this section completely from scratch',
			hasReferenceBlocks: true,
			isCreateMode: false,
			isExplicitRefine: true,
			requestCompletion: async() => 'not json'
		}) ).resolves.toMatchObject({ mode: 'generate', route: 'full', source: 'heuristic' });
	});

	it( 'honours forceRoute without calling the model', async() => {
		const requestCompletion = jest.fn();

		await expect( resolveGenerationRoute({
			instruction: 'Build a brand-new landing page',
			hasReferenceBlocks: true,
			isCreateMode: false,
			isExplicitRefine: false,
			forceRoute: 'edit',
			requestCompletion
		}) ).resolves.toMatchObject({ mode: 'edit', route: 'patch', source: 'heuristic' });

		expect( requestCompletion ).not.toHaveBeenCalled();
	});

	it( 'uses heuristics for color tweaks without a routing model call', async() => {
		const requestCompletion = jest.fn( async() => '{"mode":"generate","reason":"unsure"}' );

		await expect( resolveGenerationRoute({
			instruction: 'Change the headline color to blue',
			hasReferenceBlocks: true,
			isCreateMode: false,
			isExplicitRefine: false,
			preferEdit: true,
			requestCompletion
		}) ).resolves.toMatchObject({ mode: 'edit', route: 'patch', source: 'heuristic' });

		expect( requestCompletion ).not.toHaveBeenCalled();
	});
});
