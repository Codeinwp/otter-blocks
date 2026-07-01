jest.mock( '@wordpress/blocks', () => require( './mocks/wordpress-blocks' ) );

import { collectClassNodes, applyClassNodes } from '../../plugins/ai-content/agent/class-nodes';
import { buildStyleEditPrompt, runStyleEditTurn } from '../../plugins/ai-content/agent/run-style-edit';
import { runAgentTurn } from '../../plugins/ai-content/agent/run-turn';
import type { RunTurnArgs } from '../../plugins/ai-content/agent/types';
import type { BlockProps } from '../../helpers/blocks';

// A small atomic-wind selection: a section box → heading + paragraph. Every block
// carries a className; the paragraph also carries copy the style edit must not see.
const selection = () => [
	{
		name: 'atomic-wind/box',
		attributes: { tagName: 'section', className: 'px-8 py-24 bg-white text-[#171717]' },
		innerBlocks: [
			{ name: 'atomic-wind/text', attributes: { tagName: 'h2', className: 'm-0 text-4xl text-[#171717]', content: 'Compare plans' }, innerBlocks: [] },
			{ name: 'atomic-wind/text', attributes: { className: 'm-0 text-sm text-[#3f3a37]', content: 'Start with the essentials.' }, innerBlocks: [] },
			// A block with no className is skipped by the collector.
			{ name: 'atomic-wind/spacer', attributes: {}, innerBlocks: [] }
		]
	}
] as unknown as BlockProps<unknown>[];

const getBlockType = ( ( name: string ) => ( {
	name,
	attributes: {
		className: { type: 'string' },
		tagName: { type: 'string' },
		content: { source: 'html' }
	}
} ) ) as unknown as RunTurnArgs['getBlockType'];

const baseArgs = ( overrides: Partial<RunTurnArgs> = {} ): RunTurnArgs => ( {
	instruction: 'Recolor this in the brand palette.',
	activePrompt: 'A pricing section.',
	referenceBlocks: selection(),
	sessionHistory: [],
	blockTypes: [],
	themeColors: [],
	isCreateMode: false,
	scope: 'section',
	getBlockType,
	requestCompletion: jest.fn( async() => JSON.stringify({ items: [] }) ),
	...overrides
} );

describe( 'class-nodes', () => {
	it( 'collects only blocks with a non-empty className, in DFS order, with a label', () => {
		const nodes = collectClassNodes( selection(), getBlockType );

		expect( nodes.map( ( node ) => node.label ) ).toEqual( [ 'section', 'h2', 'text' ] );
		expect( nodes.map( ( node ) => node.path ) ).toEqual( [ [ 0 ], [ 0, 0 ], [ 0, 1 ] ] );
		expect( nodes[ 0 ].className ).toBe( 'px-8 py-24 bg-white text-[#171717]' );
	} );

	it( 'applies new classNames positionally and preserves everything else', () => {
		const nodes = collectClassNodes( selection(), getBlockType );
		const result = applyClassNodes( selection(), nodes, [
			'px-8 py-24 bg-[#C6C2DC] text-[#2A3A5C]',
			undefined, // keep original
			'   ' // blank → keep original
		] );

		const section = result[ 0 ];
		const [ heading, paragraph ] = section.innerBlocks as BlockProps<unknown>[];

		// First changed, the other two untouched.
		expect( ( section.attributes as Record<string, unknown> ).className ).toBe( 'px-8 py-24 bg-[#C6C2DC] text-[#2A3A5C]' );
		expect( ( heading.attributes as Record<string, unknown> ).className ).toBe( 'm-0 text-4xl text-[#171717]' );
		expect( ( paragraph.attributes as Record<string, unknown> ).className ).toBe( 'm-0 text-sm text-[#3f3a37]' );

		// Text/structure survive byte-for-byte — the model never saw them.
		expect( ( paragraph.attributes as Record<string, unknown> ).content ).toBe( 'Start with the essentials.' );
		expect( ( section.innerBlocks as unknown[] ).length ).toBe( 3 );
	} );
} );

describe( 'buildStyleEditPrompt', () => {
	it( 'sends classNames + labels but never the copy, and asks for a fixed count', () => {
		const nodes = collectClassNodes( selection(), getBlockType );
		const prompt = buildStyleEditPrompt( {
			nodes,
			instruction: 'Recolor it.',
			sessionHistory: [],
			themeColors: [ { slug: 'accent', color: '#C6C2DC', name: 'Twilight lilac' } ] as never,
			hasAtomic: true
		} );

		expect( prompt ).toContain( 'Return EXACTLY 3 items' );
		expect( prompt ).toContain( 'accent (#C6C2DC) — Twilight lilac' );
		expect( prompt ).toContain( 'Atomic Wind blocks' );
		expect( prompt ).toContain( 'px-8 py-24 bg-white' );
		// The block copy must not leak into a style-only prompt.
		expect( prompt ).not.toContain( 'Compare plans' );
		expect( prompt ).not.toContain( 'Start with the essentials' );
	} );
} );

describe( 'runStyleEditTurn', () => {
	it( 'applies the returned classNames and reports the style route', async() => {
		const requestCompletion = jest.fn( async() => JSON.stringify({
			items: [
				'px-8 py-24 bg-[#C6C2DC] text-[#2A3A5C]',
				'm-0 text-4xl text-[#2A3A5C]',
				'm-0 text-sm text-[#2A3A5C]'
			]
		}) );

		const result = await runStyleEditTurn( baseArgs({ requestCompletion }) );

		expect( result.decision.route ).toBe( 'style' );
		const section = result.generation.blocks[ 0 ];
		expect( ( section.attributes as Record<string, unknown> ).className ).toBe( 'px-8 py-24 bg-[#C6C2DC] text-[#2A3A5C]' );
		expect( result.generation.rationale ).toEqual( [ 'Restyled 3 elements.' ] );

		// It never asked the model for markup — only the className list.
		const sent = String( requestCompletion.mock.calls[ 0 ][ 0 ] );
		expect( sent ).toContain( 'STYLE_EDIT' );
		expect( sent ).not.toContain( '<!-- wp:' );
	} );

	it( 'returns no blocks when the selection has no classNames (caller falls back)', async() => {
		const bare = [ { name: 'atomic-wind/spacer', attributes: {}, innerBlocks: [] } ] as unknown as BlockProps<unknown>[];
		const result = await runStyleEditTurn( baseArgs({ referenceBlocks: bare }) );

		expect( result.generation.blocks.length ).toBe( 0 );
	} );
} );

describe( 'runAgentTurn — style routing', () => {
	it( 'routes a style edit through the className splice, not a markup rewrite', async() => {
		// First call is the decider (→ style); second is the style edit itself.
		const requestCompletion = jest.fn()
			.mockResolvedValueOnce( JSON.stringify({ kind: 'style', reason: 'color change' }) )
			.mockResolvedValueOnce( JSON.stringify({ items: [
				'px-8 py-24 bg-[#C6C2DC] text-[#2A3A5C]',
				'm-0 text-4xl text-[#2A3A5C]',
				'm-0 text-sm text-[#2A3A5C]'
			] }) );

		const result = await runAgentTurn( baseArgs({
			instruction: 'Make the background lilac.',
			requestCompletion
		}) );

		expect( result.decision.route ).toBe( 'style' );
		// Neither the decider nor the edit was asked to echo block markup.
		const prompts = requestCompletion.mock.calls.map( ( call ) => String( call[ 0 ] ) ).join( '\n' );
		expect( prompts ).not.toContain( '<!-- wp:' );
		expect( prompts ).not.toContain( 'complete updated block markup' );
	} );
} );
