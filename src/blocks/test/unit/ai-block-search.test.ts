jest.mock( 'uuid', () => ({
	v4: () => 'mocked-uuid'
}) );

jest.mock( '@wordpress/blocks', () => require( './mocks/wordpress-blocks' ) );

import { attachIds } from '../../plugins/ai-content/block-patches';
import {
	buildCatalogSearchEntries,
	formatBlockSearchResults,
	searchBlocks
} from '../../plugins/ai-content/block-search';
import {
	buildBlockIndex
} from '../../plugins/ai-content/block-index';
import { executeToolCall } from '../../plugins/ai-content/operations/execute';
import { parseToolCall } from '../../plugins/ai-content/operations/parse';

const mockGetBlockType = ( name: string ) => {
	const titles: Record<string, string> = {
		'core/paragraph': 'Paragraph',
		'core/heading': 'Heading',
		'core/image': 'Image',
		'themeisle-blocks/progress-bar': 'Progress Bar'
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
	}
]);

const sampleCatalogTypes = [
	{
		name: 'themeisle-blocks/progress-bar',
		title: 'Progress Bar',
		description: 'Show progress with a customizable bar and percentage.'
	},
	{
		name: 'core/button',
		title: 'Button',
		description: 'Prompt visitors to take action with a button.'
	}
];

describe( 'block search', () => {
	it( 'finds catalog block types for insert requests', () => {
		const catalog = buildCatalogSearchEntries( sampleCatalogTypes );
		const results = searchBlocks([], catalog, {
			query: 'progress bar',
			scope: 'catalog'
		});

		expect( results.catalog ).toHaveLength( 1 );
		expect( results.catalog[0].slug ).toBe( 'themeisle-blocks/progress-bar' );
	});

	it( 'finds layout blocks by summary text', () => {
		const layout = buildBlockIndex( sampleTree, mockGetBlockType );
		const results = searchBlocks( layout, [], {
			query: 'welcome',
			scope: 'layout'
		});

		expect( results.layout ).toHaveLength( 1 );
		expect( results.layout[0].id ).toBe( '0' );
	});

	it( 'formats catalog hits for structure.insert', () => {
		const catalog = buildCatalogSearchEntries( sampleCatalogTypes );
		const formatted = formatBlockSearchResults(
			searchBlocks([], catalog, { query: 'progress', scope: 'catalog' })
		);

		expect( formatted ).toContain( 'structure.insert' );
		expect( formatted ).toContain( 'themeisle-blocks/progress-bar' );
	});

	it( 'parses search_blocks with catalog scope', () => {
		expect( parseToolCall( JSON.stringify({
			tool: 'search_blocks',
			args: { query: 'progress bar', scope: 'catalog' }
		}) ) ).toMatchObject({
			tool: 'search_blocks',
			args: { query: 'progress bar', scope: 'catalog' }
		});
	});

	it( 'executes search_blocks against the catalog', () => {
		const base = [{
			clientId: 'a',
			name: 'core/group',
			attributes: {},
			innerBlocks: [{
				clientId: 'b',
				name: 'core/paragraph',
				attributes: { content: 'Footer area' },
				innerBlocks: []
			}]
		}];

		const result = executeToolCall({
			tool: 'search_blocks',
			args: { query: 'progress', scope: 'catalog' }
		}, {
			baseBlocks: base,
			getBlockType: mockGetBlockType,
			blockTypes: sampleCatalogTypes
		});

		expect( result?.blocks ).toBe( base );
		expect( result?.rationale?.join( '\n' ) ).toContain( 'themeisle-blocks/progress-bar' );
	});
});
