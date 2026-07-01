jest.mock( '@wordpress/blocks', () => require( './mocks/wordpress-blocks' ) );

import { runAgentTurn } from '../../plugins/ai-content/agent/run-turn';
import type { RunTurnArgs } from '../../plugins/ai-content/agent/types';

// A paragraph whose `content` is editable text, plus a matching block type so the
// text-edit path can find and splice a fragment.
const referenceBlocks = [
	{ name: 'core/paragraph', attributes: { content: 'The original copy.' }, innerBlocks: [] }
] as unknown as RunTurnArgs['referenceBlocks'];

const getBlockType = ( ( name: string ) => (
	'core/paragraph' === name
		? { name, attributes: { content: { source: 'html' } } }
		: { name, attributes: {} }
) ) as unknown as RunTurnArgs['getBlockType'];

const baseArgs = ( overrides: Partial<RunTurnArgs> = {} ): RunTurnArgs => ( {
	instruction: 'Shorten this.',
	activePrompt: 'A hero section for a bakery.',
	referenceBlocks,
	sessionHistory: [],
	blockTypes: [],
	themeColors: [],
	isCreateMode: true,
	scope: 'section',
	getBlockType,
	requestCompletion: jest.fn( async() => JSON.stringify({ items: [ 'Short copy.' ] }) ),
	...overrides
} );

describe( 'runAgentTurn — create-mode follow-up routing', () => {
	it( 'routes a follow-up edit (reference blocks present, no force) to an EDIT, not a rebuild', async() => {
		// Regression: create mode used to force GENERATE on every turn, so a second
		// prompt in the same modal silently rebuilt from the original task instead
		// of applying the edit. A follow-up must reach the edit path.
		const requestCompletion = jest.fn( async() => JSON.stringify({ items: [ 'Short copy.' ] }) );

		const result = await runAgentTurn( baseArgs({
			instruction: 'Shorten this.', // text-intent hint → text edit (no decider round-trip)
			refineInstruction: 'Shorten this.',
			requestCompletion
		}) );

		expect( result.decision.mode ).toBe( 'edit' );
		expect( result.decision.route ).toBe( 'text' );
		expect( result.generation.blocks.length ).toBeGreaterThan( 0 );

		// It asked the model to transform the text fragments, not to plan/build anew.
		expect( requestCompletion ).toHaveBeenCalled();
		const prompts = requestCompletion.mock.calls.map( ( call ) => String( call[ 0 ] ) ).join( '\n' );
		expect( prompts ).not.toMatch( /landing page|self-contained section/i );
	} );

	it( 'still GENERATES a fresh create turn when there are no reference blocks', async() => {
		const requestCompletion = jest.fn( async() => JSON.stringify({ items: [] }) );

		const result = await runAgentTurn( baseArgs({
			referenceBlocks: [] as unknown as RunTurnArgs['referenceBlocks'],
			forceRoute: 'generate',
			requestCompletion
		}) );

		expect( result.decision.mode ).toBe( 'generate' );
		expect( result.decision.route ).toBe( 'full' );
	} );
} );
