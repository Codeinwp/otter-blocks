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

	it( 'defaults to patch when blocks exist and no create-mode first build', () => {
		expect( classifyGenerationIntent({
			instruction: 'Make the headline shorter',
			hasReferenceBlocks: true,
			isCreateMode: false,
			isExplicitRefine: false
		}) ).toBe( 'patch' );
	});

	it( 'uses the full pipeline for the first create-mode generation', () => {
		expect( classifyGenerationIntent({
			instruction: 'A features grid with three cards',
			hasReferenceBlocks: true,
			isCreateMode: true,
			isExplicitRefine: false
		}) ).toBe( 'full' );
	});

	it( 'uses patch for explicit refine follow-ups', () => {
		expect( classifyGenerationIntent({
			instruction: 'Use a darker background',
			taskContext: 'Hero for a SaaS product',
			hasReferenceBlocks: true,
			isCreateMode: true,
			isExplicitRefine: true
		}) ).toBe( 'patch' );
	});

	it( 'does not depend on English keywords for routing', () => {
		expect( classifyGenerationIntent({
			instruction: 'Ajoute une barre de progression en bas',
			hasReferenceBlocks: true,
			isCreateMode: false,
			isExplicitRefine: false
		}) ).toBe( 'patch' );
	});
});

describe( 'AI route resolver', () => {
	it( 'parses model route JSON', () => {
		expect( parseRouteResponse( '{"mode":"edit","reason":"copy tweak"}' ) ).toBe( 'edit' );
		expect( parseRouteResponse( '{"mode":"structure","reason":"remove block"}' ) ).toBe( 'structure' );
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

	it( 'defaults transform edits to patch without a routing model call', async() => {
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

	it( 'falls back to full generation on first create-mode build', async() => {
		await expect( resolveGenerationRoute({
			instruction: 'Redesign this section completely from scratch',
			hasReferenceBlocks: true,
			isCreateMode: true,
			isExplicitRefine: false,
			requestCompletion: async() => 'not json'
		}) ).resolves.toMatchObject({ mode: 'generate', route: 'full', source: 'heuristic' });
	});

	it( 'honours forceRoute structure directly', async() => {
		const requestCompletion = jest.fn();

		await expect( resolveGenerationRoute({
			instruction: 'Remove the second image',
			hasReferenceBlocks: true,
			isCreateMode: false,
			isExplicitRefine: false,
			forceRoute: 'structure',
			requestCompletion
		}) ).resolves.toMatchObject({ mode: 'structure', route: 'structure', source: 'heuristic' });

		expect( requestCompletion ).not.toHaveBeenCalled();
	});

	it( 'honours forceRoute edit without full regen for ambiguous instructions', async() => {
		const requestCompletion = jest.fn();

		await expect( resolveGenerationRoute({
			instruction: 'Make it pop',
			hasReferenceBlocks: true,
			isCreateMode: false,
			isExplicitRefine: false,
			forceRoute: 'edit',
			requestCompletion
		}) ).resolves.toMatchObject({ mode: 'edit', route: 'patch', source: 'heuristic' });

		expect( requestCompletion ).not.toHaveBeenCalled();
	});

	it( 'defaults preferEdit transforms to patch without a routing model call', async() => {
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
