jest.mock( '@wordpress/blocks', () => require( './mocks/wordpress-blocks' ) );

import { collectStyleNodes, applyStyleNodes, styleNodeChanged } from '../../plugins/ai-content/agent/style-nodes';
import { buildStyleEditPrompt, runStyleEditTurn } from '../../plugins/ai-content/agent/run-style-edit';
import { runAgentTurn } from '../../plugins/ai-content/agent/run-turn';
import type { RunTurnArgs } from '../../plugins/ai-content/agent/types';
import type { BlockProps } from '../../helpers/blocks';

// A mixed selection: an atomic-wind box (styles via className) → a classic Otter
// heading (styles via flat attributes + responsive variants) and a core paragraph
// (styles via the `style` object + a color slug). Every block also carries copy
// the style edit must never see.
const selection = () => [
	{
		name: 'atomic-wind/box',
		attributes: { tagName: 'section', className: 'px-8 py-24 bg-white text-[#171717]' },
		innerBlocks: [
			{
				name: 'themeisle-blocks/advanced-heading',
				attributes: {
					tagName: 'h2',
					content: 'Compare plans',
					headingColor: '#171717',
					fontSize: 40,
					padding: 12,
					paddingTablet: 8 // responsive → must be excluded
				},
				innerBlocks: []
			},
			{
				name: 'core/paragraph',
				attributes: {
					content: 'Start with the essentials.',
					backgroundColor: 'accent',
					style: { color: { text: '#3f3a37' }}
				},
				innerBlocks: []
			}
		]
	}
] as unknown as BlockProps<unknown>[];

// Declares the style + text attributes each block type exposes.
const getBlockType = ( ( name: string ) => {
	if ( 'core/paragraph' === name ) {
		return { name, attributes: { content: { source: 'html' }, backgroundColor: { type: 'string' }, style: { type: 'object' }, className: { type: 'string' }}};
	}

	if ( 'themeisle-blocks/advanced-heading' === name ) {
		return { name, attributes: { content: { source: 'html' }, tagName: { type: 'string' }, headingColor: { type: 'string' }, fontSize: { type: 'number' }, padding: { type: 'number' }, paddingTablet: { type: 'number' }}};
	}

	return { name, attributes: { tagName: { type: 'string' }, className: { type: 'string' }}};
} ) as unknown as RunTurnArgs['getBlockType'];

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

describe( 'style-nodes', () => {
	it( 'collects style attributes across atomic, classic, and core blocks — never text or responsive variants', () => {
		const nodes = collectStyleNodes( selection(), getBlockType );

		expect( nodes.map( ( node ) => node.label ) ).toEqual( [ 'section', 'h2', 'paragraph' ] );

		// atomic-wind → className only
		expect( nodes[ 0 ].attrs ).toEqual( { className: 'px-8 py-24 bg-white text-[#171717]' } );

		// classic Otter → flat style attrs, but NOT content and NOT the *Tablet variant
		expect( nodes[ 1 ].attrs ).toEqual( { headingColor: '#171717', fontSize: 40, padding: 12 } );
		expect( nodes[ 1 ].attrs ).not.toHaveProperty( 'content' );
		expect( nodes[ 1 ].attrs ).not.toHaveProperty( 'paddingTablet' );

		// core → color slug + nested style object
		expect( nodes[ 2 ].attrs ).toEqual( { backgroundColor: 'accent', style: { color: { text: '#3f3a37' }}} );
	} );

	it( 'applies only the keys it sent, preserves text/structure, and never invents attributes', () => {
		const nodes = collectStyleNodes( selection(), getBlockType );
		const result = applyStyleNodes( selection(), nodes, [
			{ className: 'px-8 py-24 bg-[#C6C2DC] text-[#2A3A5C]' },
			{ headingColor: '#2A3A5C', fontSize: 40, padding: 12, sneaky: 'nope' }, // extra key ignored
			undefined // keep original
		] );

		const section = result[ 0 ];
		const [ heading, paragraph ] = section.innerBlocks as BlockProps<unknown>[];
		const headingAttrs = heading.attributes as Record<string, unknown>;
		const paragraphAttrs = paragraph.attributes as Record<string, unknown>;

		expect( ( section.attributes as Record<string, unknown> ).className ).toBe( 'px-8 py-24 bg-[#C6C2DC] text-[#2A3A5C]' );
		expect( headingAttrs.headingColor ).toBe( '#2A3A5C' );
		expect( headingAttrs ).not.toHaveProperty( 'sneaky' ); // invented key rejected
		expect( headingAttrs.paddingTablet ).toBe( 8 ); // untouched attribute survives

		// Copy and structure survive byte-for-byte — the model never saw them.
		expect( headingAttrs.content ).toBe( 'Compare plans' );
		expect( paragraphAttrs.content ).toBe( 'Start with the essentials.' );
		expect( paragraphAttrs.backgroundColor ).toBe( 'accent' ); // undefined → kept
	} );

	it( 'styleNodeChanged only flags a real value change on a sent key', () => {
		const [ , headingNode ] = collectStyleNodes( selection(), getBlockType );

		expect( styleNodeChanged( headingNode, { headingColor: '#2A3A5C', fontSize: 40, padding: 12 } ) ).toBe( true );
		expect( styleNodeChanged( headingNode, { headingColor: '#171717', fontSize: 40, padding: 12 } ) ).toBe( false );
		expect( styleNodeChanged( headingNode, undefined ) ).toBe( false );
	} );
} );

describe( 'buildStyleEditPrompt', () => {
	it( 'sends style attrs + labels but never the copy, and asks for a fixed count', () => {
		const nodes = collectStyleNodes( selection(), getBlockType );
		const prompt = buildStyleEditPrompt( {
			nodes,
			instruction: 'Recolor it.',
			sessionHistory: [],
			themeColors: [{ slug: 'accent', color: '#C6C2DC', name: 'Twilight lilac' }] as never,
			hasAtomic: true
		} );

		expect( prompt ).toContain( 'Return EXACTLY 3 items' );
		expect( prompt ).toContain( 'accent (#C6C2DC) — Twilight lilac' );
		expect( prompt ).toContain( 'headingColor' );
		expect( prompt ).toContain( 'px-8 py-24 bg-white' );
		// Block copy must not leak into a style-only prompt.
		expect( prompt ).not.toContain( 'Compare plans' );
		expect( prompt ).not.toContain( 'Start with the essentials' );
	} );
} );

describe( 'runStyleEditTurn', () => {
	it( 'applies the returned style attrs and reports the style route', async() => {
		const requestCompletion = jest.fn( async() => JSON.stringify({
			items: [
				{ className: 'px-8 py-24 bg-[#C6C2DC] text-[#2A3A5C]' },
				{ headingColor: '#2A3A5C', fontSize: 40, padding: 12 },
				{ backgroundColor: 'accent', style: { color: { text: '#2A3A5C' }}}
			]
		}) );

		const result = await runStyleEditTurn( baseArgs({ requestCompletion }) );

		expect( result.decision.route ).toBe( 'style' );
		const section = result.generation.blocks[ 0 ];
		expect( ( section.attributes as Record<string, unknown> ).className ).toBe( 'px-8 py-24 bg-[#C6C2DC] text-[#2A3A5C]' );
		expect( result.generation.rationale ).toEqual( [ 'Restyled 3 elements.' ] );

		// It never asked the model for markup — only the attribute bundles.
		const sent = String( requestCompletion.mock.calls[ 0 ][ 0 ] );
		expect( sent ).toContain( 'STYLE_EDIT' );
		expect( sent ).not.toContain( '<!-- wp:' );
	} );

	it( 'returns no blocks when the selection has no style attributes (caller falls back)', async() => {
		const bare = [{ name: 'core/spacer', attributes: { height: undefined }, innerBlocks: [] }] as unknown as BlockProps<unknown>[];
		const bareType = ( ( name: string ) => ( { name, attributes: { anchor: { type: 'string' }}} ) ) as unknown as RunTurnArgs['getBlockType'];
		const result = await runStyleEditTurn( baseArgs({ referenceBlocks: bare, getBlockType: bareType }) );

		expect( result.generation.blocks.length ).toBe( 0 );
	} );
} );

describe( 'runAgentTurn — style routing', () => {
	it( 'routes a style edit through the attribute splice, not a markup rewrite', async() => {
		// First call is the decider (→ style); second is the style edit itself.
		const requestCompletion = jest.fn()
			.mockResolvedValueOnce( JSON.stringify({ kind: 'style', reason: 'color change' }) )
			.mockResolvedValueOnce( JSON.stringify({ items: [
				{ className: 'px-8 py-24 bg-[#C6C2DC] text-[#2A3A5C]' },
				{ headingColor: '#2A3A5C', fontSize: 40, padding: 12 },
				{ backgroundColor: 'accent', style: { color: { text: '#2A3A5C' }}}
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
