jest.mock( 'uuid', () => ({
	v4: () => 'mocked-uuid'
}) );

jest.mock( '@wordpress/blocks', () => require( './mocks/wordpress-blocks' ) );

import { attachIds } from '../../plugins/ai-content/block-patches';
import {
	buildBlockIndex,
	formatBlockIndexForPrompt
} from '../../plugins/ai-content/block-index';
import { executeToolCall } from '../../plugins/ai-content/operations/execute';
import { parseToolCall } from '../../plugins/ai-content/operations/parse';
import { buildSessionMemory } from '../../plugins/ai-content/session-memory';

const mockGetBlockType = ( name: string ) => {
	const titles: Record<string, string> = {
		'core/paragraph': 'Paragraph',
		'core/heading': 'Heading',
		'core/image': 'Image'
	};

	return { title: titles[ name ] || name };
};

const sampleTree = attachIds([
	{
		name: 'core/heading',
		attributes: { content: 'Welcome' },
		innerBlocks: []
	},
	{
		name: 'core/paragraph',
		attributes: { content: 'Intro text' },
		innerBlocks: []
	},
	{
		name: 'core/image',
		attributes: { alt: 'Hero photo' },
		innerBlocks: []
	},
	{
		name: 'core/image',
		attributes: { alt: 'Secondary photo' },
		innerBlocks: []
	}
]);

describe( 'AI block index', () => {
	it( 'builds a flat index with ids and summaries', () => {
		const index = buildBlockIndex( sampleTree, mockGetBlockType );

		expect( index ).toHaveLength( 4 );
		expect( index[0] ).toMatchObject({
			id: '0',
			name: 'core/heading',
			summary: 'Welcome'
		});
		expect( index[3] ).toMatchObject({
			id: '3',
			name: 'core/image',
			summary: 'Secondary photo'
		});
	});

	it( 'formats the index for prompts', () => {
		const formatted = formatBlockIndexForPrompt( buildBlockIndex( sampleTree, mockGetBlockType ) );

		expect( formatted ).toContain( 'Block index' );
		expect( formatted ).toContain( '0 | core/heading' );
		expect( formatted ).toContain( 'Welcome' );
	});
});

describe( 'AI tool calls', () => {
	it( 'parses a patch tool call', () => {
		expect( parseToolCall( JSON.stringify({
			tool: 'patch',
			reason: 'Shorter headline',
			args: {
				patches: [{ id: '0', attributes: { content: 'Hi' } }]
			}
		}) ) ).toMatchObject({
			tool: 'patch',
			args: { patches: [{ id: '0', attributes: { content: 'Hi' } }] }
		});
	});

	it( 'parses a structure remove tool call', () => {
		expect( parseToolCall( '{"tool":"structure","args":{"remove":["0.1","0.2"]}}' ) ).toMatchObject({
			tool: 'structure',
			args: { remove: [ '0.1', '0.2' ] }
		});
	});

	it( 'parses a list tool call', () => {
		expect( parseToolCall( '{"tool":"list","reason":"inventory","args":{}}' ) ).toMatchObject({
			tool: 'list',
			args: {}
		});
	});

	it( 'parses a search_blocks tool call', () => {
		expect( parseToolCall( '{"tool":"search_blocks","args":{"query":"image","scope":"layout"}}' ) ).toMatchObject({
			tool: 'search_blocks',
			args: { query: 'image', scope: 'layout' }
		});
	});

	it( 'parses a search_history tool call', () => {
		expect( parseToolCall( '{"tool":"search_history","args":{"query":"removed image"}}' ) ).toMatchObject({
			tool: 'search_history',
			args: { query: 'removed image' }
		});
	});

	it( 'parses a search_patterns tool call', () => {
		expect( parseToolCall( '{"tool":"search_patterns","args":{"query":"hero"}}' ) ).toMatchObject({
			tool: 'search_patterns',
			args: { query: 'hero' }
		});
	});

	it( 'parses an adapt_pattern tool call', () => {
		expect( parseToolCall( '{"tool":"adapt_pattern","args":{"patternName":"otter-blocks/hero"}}' ) ).toMatchObject({
			tool: 'adapt_pattern',
			args: { patternName: 'otter-blocks/hero' }
		});
	});

	it( 'parses a generate tool call', () => {
		expect( parseToolCall( '{"tool":"generate","args":{}}' ) ).toMatchObject({
			tool: 'generate',
			args: {}
		});
	});

	it( 'executes a structure remove tool locally', () => {
		const base = [{
			clientId: 'parent',
			name: 'core/group',
			attributes: {},
			innerBlocks: [
				{
					clientId: 'keep',
					name: 'core/paragraph',
					attributes: { content: 'Keep me.' },
					innerBlocks: []
				},
				{
					clientId: 'drop',
					name: 'core/paragraph',
					attributes: { content: 'Remove me.' },
					innerBlocks: []
				}
			]
		}];

		const result = executeToolCall({
			tool: 'structure',
			args: { remove: [ '0.1' ] }
		}, {
			baseBlocks: base,
			getBlockType: mockGetBlockType
		});

		expect( result?.blocks[0].innerBlocks ).toHaveLength( 1 );
		expect( result?.blocks[0].innerBlocks?.[0]?.clientId ).toBe( 'keep' );
	});

	it( 'executes a list tool without changing blocks', () => {
		const base = [{
			clientId: 'a',
			name: 'core/paragraph',
			attributes: { content: 'Hello' },
			innerBlocks: []
		}];

		const result = executeToolCall({
			tool: 'list',
			reason: 'User asked for inventory',
			args: {}
		}, {
			baseBlocks: base,
			getBlockType: mockGetBlockType
		});

		expect( result?.blocks ).toBe( base );
		expect( result?.rationale?.join( '\n' ) ).toContain( 'Block index' );
	});

	it( 'executes search_history against session memory', () => {
		const memory = buildSessionMemory([
			{
				meta: {
					prompt: 'Remove the hero image',
					route: 'structure',
					tool: 'structure',
					operation: { tool: 'structure', remove: [ '0.1' ] },
					removedBlocks: {
						'0.1': {
							name: 'core/image',
							attributes: { alt: 'Hero' },
							innerBlocks: []
						}
					}
				}
			}
		]);

		const base = [{
			clientId: 'a',
			name: 'core/paragraph',
			attributes: { content: 'Hello' },
			innerBlocks: []
		}];

		const result = executeToolCall({
			tool: 'search_history',
			args: { query: 'hero' }
		}, {
			baseBlocks: base,
			getBlockType: mockGetBlockType,
			sessionMemory: memory
		});

		expect( result?.blocks ).toBe( base );
		expect( result?.rationale?.join( '\n' ) ).toContain( 'removedBlocks' );
	});
});
