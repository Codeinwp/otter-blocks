jest.mock( '@wordpress/blocks', () => require( './mocks/wordpress-blocks' ) );

import {
	buildAttributeSchema,
	buildStructureCatalog,
	generateBlocksFromTask,
	jsonTreeToBlocks,
	validateGeneratedBlocks,
	validateStructure
} from '../../plugins/ai-content/block-generation';

const blockTypes = [
	{
		name: 'core/paragraph',
		title: 'Paragraph',
		description: 'Start with the basic building block of all narrative.',
		attributes: {
			content: { type: 'string', source: 'html', selector: 'p' },
			dropCap: { type: 'boolean' },
			unknownPrivate: { type: 'string', role: 'local' }
		},
		supports: {
			inserter: true
		}
	},
	{
		name: 'themeisle-blocks/advanced-columns',
		title: 'Section',
		description: 'Create a section with columns. '.repeat( 10 ),
		attributes: {
			id: { type: 'string' }
		},
		allowedBlocks: [ 'themeisle-blocks/advanced-column' ],
		supports: {
			inserter: true
		}
	},
	{
		name: 'themeisle-blocks/advanced-column',
		title: 'Column',
		description: 'A column inside a section.',
		attributes: {
			id: { type: 'string' },
			width: { type: 'number' }
		},
		parent: [ 'themeisle-blocks/advanced-columns' ],
		supports: {
			inserter: true
		}
	},
	{
		name: 'themeisle-blocks/google-map',
		title: 'Google Maps',
		description: 'Display Google Maps on your website.',
		attributes: {
			location: { type: 'string' }
		},
		supports: {
			inserter: true
		}
	},
	{
		name: 'core/html',
		title: 'Custom HTML',
		description: 'Add custom HTML code.',
		attributes: {
			content: { type: 'string' }
		},
		supports: {
			inserter: false
		}
	}
];

const getBlockType = ( name: string ) => blockTypes.find( blockType => blockType.name === name );

describe( 'AI block generation engine', () => {
	it( 'phase 1: builds a slim structure catalog with slug, trimmed description and container hint', () => {
		const catalog = buildStructureCatalog( blockTypes );

		expect( catalog.map( entry => entry.slug ) ).toEqual([
			'core/paragraph',
			'themeisle-blocks/advanced-columns',
			'themeisle-blocks/advanced-column'
		]);

		// Paragraph is not a container; the section (allowedBlocks) and column
		// (known container) are.
		expect( catalog[0]).toMatchObject({ slug: 'core/paragraph', container: false });
		expect( catalog[1].container ).toBe( true );
		expect( catalog[2].container ).toBe( true );

		// Descriptions are trimmed and never carry attribute noise.
		expect( catalog[1].description.length ).toBeLessThanOrEqual( 100 );
		expect( catalog[0]).not.toHaveProperty( 'attributes' );
	});

	it( 'phase 3: builds the attribute schema for only the requested slugs', () => {
		const schema = buildAttributeSchema( blockTypes, new Set([ 'core/paragraph', 'themeisle-blocks/advanced-column' ]) );

		expect( schema ).toEqual([
			{ slug: 'core/paragraph', attributes: [ 'content' ] },
			{ slug: 'themeisle-blocks/advanced-column', attributes: [ 'id' ] }
		]);
	});

	it( 'phase 2: prunes unregistered and illegally-nested nodes from the skeleton', () => {
		const dropped: { root: { name: string }, errors: string[] }[] = [];
		const kept = validateStructure(
			[
				{ name: 'themeisle-blocks/advanced-column' }, // orphan: requires parent
				{ name: 'missing/block' },
				{
					name: 'themeisle-blocks/advanced-columns',
					innerBlocks: [
						{ name: 'themeisle-blocks/advanced-column' },
						{ name: 'core/paragraph' } // not in section's allowedBlocks
					]
				}
			],
			getBlockType,
			undefined,
			[],
			dropped as never
		);

		expect( kept.map( node => node.name ) ).toEqual([ 'themeisle-blocks/advanced-columns' ]);
		expect( kept[0].innerBlocks?.map( node => node.name ) ).toEqual([ 'themeisle-blocks/advanced-column' ]);
		expect( dropped.map( entry => entry.root.name ) ).toEqual(
			expect.arrayContaining([ 'themeisle-blocks/advanced-column', 'missing/block', 'core/paragraph' ])
		);
	});

	it( 'converts minimal JSON trees to native blocks and strips unknown attributes', () => {
		const blocks = jsonTreeToBlocks(
			[
				{
					name: 'themeisle-blocks/advanced-columns',
					attributes: { id: 'section-1', notAllowed: 'removed' },
					innerBlocks: [
						{
							name: 'themeisle-blocks/advanced-column',
							attributes: { id: 'column-1', width: 50, notAllowed: 'removed' }
						}
					]
				}
			],
			getBlockType
		);

		expect( blocks ).toHaveLength( 1 );
		expect( blocks[0].attributes ).toEqual({ id: 'section-1' });
		expect( blocks[0].innerBlocks?.[0].attributes ).toEqual({ id: 'column-1', width: 50 });
	});

	it( 'validates block registration and nesting constraints', () => {
		const blocks = jsonTreeToBlocks(
			[
				{ name: 'themeisle-blocks/advanced-column', attributes: { id: 'orphan-column' } },
				{ name: 'missing/block', attributes: {} }
			],
			getBlockType
		);

		const result = validateGeneratedBlocks( blocks, getBlockType );

		expect( result.valid ).toBe( false );
		expect( result.errors ).toEqual(
			expect.arrayContaining([
				expect.stringContaining( 'themeisle-blocks/advanced-column requires parent' ),
				expect.stringContaining( 'missing/block is not registered' )
			])
		);
	});

	it( 'orchestrates the two-phase pipeline: structure → validate → fill, in order', async() => {
		const completion = jest.fn()
			// Phase 1 — structure (slugs only).
			.mockResolvedValueOnce( JSON.stringify({
				rationale: [ 'Use a section with a column and a paragraph.' ],
				roots: [
					{
						name: 'themeisle-blocks/advanced-columns',
						innerBlocks: [
							{
								name: 'themeisle-blocks/advanced-column',
								innerBlocks: [ { name: 'core/paragraph' } ]
							}
						]
					}
				]
			}) )
			// Phase 3 — attributes for the single valid root.
			.mockResolvedValueOnce( JSON.stringify({
				rationale: [],
				roots: [
					{
						name: 'themeisle-blocks/advanced-columns',
						attributes: { id: 'hero' },
						innerBlocks: [
							{
								name: 'themeisle-blocks/advanced-column',
								attributes: { id: 'col', width: 50 },
								innerBlocks: [
									{ name: 'core/paragraph', attributes: { content: 'A concise opening.' } }
								]
							}
						]
					}
				]
			}) );

		const result = await generateBlocksFromTask({
			task: 'Create a short hero section.',
			blockTypes,
			requestCompletion: completion
		});

		expect( completion ).toHaveBeenCalledTimes( 2 );
		expect( result.blocks ).toHaveLength( 1 );
		expect( result.blocks[0].name ).toBe( 'themeisle-blocks/advanced-columns' );
		expect( result.blocks[0].innerBlocks?.[0].innerBlocks?.[0].attributes ).toEqual({ content: 'A concise opening.' });
		expect( result.rationale ).toEqual([ 'Use a section with a column and a paragraph.' ]);
		expect( result.diagnostics.droppedRoots ).toHaveLength( 0 );
	});

	it( 'drops structurally invalid roots before spending an attribute call on them', async() => {
		const completion = jest.fn()
			.mockResolvedValueOnce( JSON.stringify({
				rationale: [],
				roots: [
					{ name: 'core/paragraph' },
					{ name: 'themeisle-blocks/advanced-column' } // orphan, pruned in phase 2
				]
			}) )
			// Only the valid paragraph root reaches phase 3.
			.mockResolvedValueOnce( JSON.stringify({
				rationale: [],
				roots: [ { name: 'core/paragraph', attributes: { content: 'Hello.' } } ]
			}) );

		const result = await generateBlocksFromTask({
			task: 'A paragraph.',
			blockTypes,
			requestCompletion: completion
		});

		// 1 structure call + 1 attribute call (the orphan never gets a call).
		expect( completion ).toHaveBeenCalledTimes( 2 );
		expect( result.blocks.map( block => block.name ) ).toEqual([ 'core/paragraph' ]);
		expect( result.diagnostics.droppedRoots.map( entry => entry.root.name ) ).toContain( 'themeisle-blocks/advanced-column' );
	});

	it( 'parses model payloads wrapped in a markdown code fence', async() => {
		const completion = jest.fn()
			.mockResolvedValueOnce( '```json\n' + JSON.stringify({
				rationale: [ 'Fenced.' ],
				roots: [ { name: 'core/paragraph' } ]
			}) + '\n```' )
			.mockResolvedValueOnce( JSON.stringify({
				roots: [ { name: 'core/paragraph', attributes: { content: 'Fenced content.' } } ]
			}) );

		const result = await generateBlocksFromTask({
			task: 'A single paragraph.',
			blockTypes,
			requestCompletion: completion
		});

		expect( result.blocks ).toHaveLength( 1 );
		expect( result.blocks[0].attributes?.content ).toBe( 'Fenced content.' );
		expect( result.rationale ).toEqual([ 'Fenced.' ]);
	});

	it( 'keeps catalog blocks whose names only contain asset keywords as substrings', () => {
		const catalog = buildStructureCatalog([
			{ name: 'acme/profile-card', title: 'Profile Card', attributes: {}, supports: { inserter: true } },
			{ name: 'acme/sitemap-links', title: 'Sitemap Links', attributes: {}, supports: { inserter: true } },
			{ name: 'core/image', title: 'Image', attributes: {}, supports: { inserter: true } }
		]);

		expect( catalog.map( entry => entry.slug ) ).toEqual([
			'acme/profile-card',
			'acme/sitemap-links'
		]);
	});
});
