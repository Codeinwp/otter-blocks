jest.mock( '@wordpress/blocks', () => require( './mocks/wordpress-blocks' ) );

import {
	buildAttributeSchema,
	buildPatternCatalog,
	buildStructureCatalog,
	generateBlocksFromTask,
	jsonTreeToBlocks,
	patternToTrees,
	refineGeneratedBlocks,
	sanitizeGeneratedBlocks,
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
			align: { type: 'string' },
			style: { type: 'object' },
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
	},
	{
		name: 'themeisle-blocks/button-group',
		title: 'Button Group',
		description: 'A group of buttons.',
		attributes: {
			id: { type: 'string' }
		},
		allowedBlocks: [ 'themeisle-blocks/button' ],
		supports: {
			inserter: true
		}
	},
	{
		name: 'themeisle-blocks/button',
		title: 'Button',
		description: 'A single button.',
		attributes: {
			id: { type: 'string' },
			text: { type: 'string', source: 'html', selector: 'span' }
		},
		parent: [ 'themeisle-blocks/button-group' ],
		supports: {
			inserter: true
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
			'themeisle-blocks/advanced-column',
			'themeisle-blocks/button-group',
			'themeisle-blocks/button'
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

	it( 'migrates deprecated paragraph alignment to style typography alignment', () => {
		const blocks = jsonTreeToBlocks(
			[
				{
					name: 'core/paragraph',
					attributes: {
						content: 'Centered copy.',
						align: 'center',
						notAllowed: 'removed'
					}
				}
			],
			getBlockType
		);

		expect( blocks[0].attributes ).toEqual({
			content: 'Centered copy.',
			style: {
				typography: {
					textAlign: 'center'
				}
			}
		});
	});

	it( 'sanitizes parsed block attributes recursively before editor insertion', () => {
		const blocks = sanitizeGeneratedBlocks(
			[
				{
					name: 'themeisle-blocks/advanced-columns',
					attributes: { id: 'section-1', unknown: true },
					innerBlocks: [
						{
							name: 'core/paragraph',
							attributes: {
								content: 'Nested copy.',
								align: 'right',
								unknown: true
							},
							innerBlocks: []
						}
					]
				}
			] as never,
			getBlockType
		);

		expect( blocks[0].attributes ).toEqual({ id: 'section-1' });
		expect( blocks[0].innerBlocks?.[0].attributes ).toEqual({
			content: 'Nested copy.',
			style: {
				typography: {
					textAlign: 'right'
				}
			}
		});
	});

	it( 'validates block registration and nesting constraints', () => {
		const blocks = jsonTreeToBlocks(
			[
				{ name: 'themeisle-blocks/advanced-column', attributes: { id: 'orphan-column' }},
				{ name: 'missing/block', attributes: {}}
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
								innerBlocks: [{ name: 'core/paragraph' }]
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
									{ name: 'core/paragraph', attributes: { content: 'A concise opening.' }}
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
				roots: [{ name: 'core/paragraph', attributes: { content: 'Hello.' }}]
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
				roots: [{ name: 'core/paragraph' }]
			}) + '\n```' )
			.mockResolvedValueOnce( JSON.stringify({
				roots: [{ name: 'core/paragraph', attributes: { content: 'Fenced content.' }}]
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

	it( 'plans the page, reports the plan and each finished section, and trickles plan context into attribute calls', async() => {
		const onPlanReady = jest.fn();
		const onRootComplete = jest.fn();

		const completion = jest.fn()

			// Phase 1 — the plan: mission, design direction and a two-section outline with notes.
			.mockResolvedValueOnce( JSON.stringify({
				mission: 'A friendly hero that converts.',
				design: {
					style: 'modern',
					palette: [ '#0f172a', '#f97316' ],
					borderRadius: 'rounded-xl',
					spacing: 'roomy',
					typography: 'clean sans'
				},
				rationale: [ 'Hero then a closing paragraph.' ],
				roots: [
					{
						name: 'themeisle-blocks/advanced-columns',
						notes: 'Hero with the brand color.',
						innerBlocks: [
							{
								name: 'themeisle-blocks/advanced-column',
								innerBlocks: [{ name: 'core/paragraph' }]
							}
						]
					},
					{ name: 'core/paragraph', notes: 'A closing line.' }
				]
			}) )

			// Phase 3 — attributes for root 1.
			.mockResolvedValueOnce( JSON.stringify({
				roots: [
					{
						name: 'themeisle-blocks/advanced-columns',
						attributes: { id: 'hero' },
						innerBlocks: [
							{
								name: 'themeisle-blocks/advanced-column',
								attributes: { id: 'col', width: 50 },
								innerBlocks: [{ name: 'core/paragraph', attributes: { content: 'Hi.' }}]
							}
						]
					}
				]
			}) )

			// Phase 3 — attributes for root 2.
			.mockResolvedValueOnce( JSON.stringify({
				roots: [{ name: 'core/paragraph', attributes: { content: 'Bye.' }}]
			}) );

		const result = await generateBlocksFromTask({
			task: 'A landing page.',
			blockTypes,
			requestCompletion: completion,
			onPlanReady,
			onRootComplete
		});

		// Plan surfaced once, after structure validation, with the validated outline.
		expect( onPlanReady ).toHaveBeenCalledTimes( 1 );
		const plan = onPlanReady.mock.calls[0][0];
		expect( plan.mission ).toBe( 'A friendly hero that converts.' );
		expect( plan.design.palette ).toEqual([ '#0f172a', '#f97316' ]);
		expect( plan.roots.map( ( root: { name: string }) => root.name ) ).toEqual([ 'themeisle-blocks/advanced-columns', 'core/paragraph' ]);
		expect( plan.roots[0].notes ).toBe( 'Hero with the brand color.' );

		// Each finished root reported in order, with its blocks.
		expect( onRootComplete ).toHaveBeenCalledTimes( 2 );
		expect( onRootComplete.mock.calls[0][0] ).toMatchObject({ rootIndex: 0, totalRoots: 2 });
		expect( onRootComplete.mock.calls[0][0].blocks ).toHaveLength( 1 );
		expect( onRootComplete.mock.calls[1][0] ).toMatchObject({ rootIndex: 1, totalRoots: 2 });

		// The mission, the section's notes and the palette trickle into the attribute prompt.
		const firstAttributePrompt = completion.mock.calls[1][0];
		expect( firstAttributePrompt ).toContain( 'A friendly hero that converts.' );
		expect( firstAttributePrompt ).toContain( 'Hero with the brand color.' );
		expect( firstAttributePrompt ).toContain( '#f97316' );

		// Result still exposes blocks + rationale, plus the plan.
		expect( result.blocks.map( block => block.name ) ).toEqual([ 'themeisle-blocks/advanced-columns', 'core/paragraph' ]);
		expect( result.rationale ).toEqual([ 'Hero then a closing paragraph.' ]);
		expect( result.plan.mission ).toBe( 'A friendly hero that converts.' );
	});

	it( 'reports a section with no blocks when its attribute fill fails', async() => {
		const onRootComplete = jest.fn();

		const completion = jest.fn()
			.mockResolvedValueOnce( JSON.stringify({
				mission: '',
				roots: [{ name: 'core/paragraph', notes: 'A line.' }]
			}) )

			// Attribute fill returns unparseable content → the section is dropped.
			.mockResolvedValueOnce( 'not json at all' );

		const result = await generateBlocksFromTask({
			task: 'A paragraph.',
			blockTypes,
			requestCompletion: completion,
			onRootComplete
		});

		expect( onRootComplete ).toHaveBeenCalledTimes( 1 );
		expect( onRootComplete.mock.calls[0][0].blocks ).toHaveLength( 0 );
		expect( onRootComplete.mock.calls[0][0].dropped ).toBeDefined();
		expect( result.blocks ).toHaveLength( 0 );
		expect( result.diagnostics.droppedRoots ).toHaveLength( 1 );
	});

	it( 'pattern catalog: keeps Otter and theme patterns, drops core/remote and content-less ones', () => {
		const catalog = buildPatternCatalog([
			{ name: 'otter/hero', title: 'Hero', description: 'A hero.', categories: [ 'otter-blocks' ], content: 'x' },
			{ name: 'theme/cta', title: 'CTA', description: 'A CTA.', categories: [ 'featured' ], source: 'theme', content: 'x' },
			{ name: 'core/quote', title: 'Quote', description: 'A quote.', categories: [ 'text' ], source: 'core', content: 'x' },
			{ name: 'plugin/cards', title: 'Cards', description: 'Cards.', content: 'x' }, // no source → kept
			{ name: 'otter/empty', title: 'Empty', categories: [ 'otter-blocks' ], content: '' } // no content → dropped
		]);

		expect( catalog.map( entry => entry.name ) ).toEqual([ 'otter/hero', 'theme/cta', 'plugin/cards' ]);
		expect( catalog[0]).toMatchObject({ name: 'otter/hero', title: 'Hero', description: 'A hero.', categories: [ 'otter-blocks' ] });
	});

	it( 'patternToTrees: parses content into attribute-carrying trees and inlines pattern references', () => {
		const patternsByName = {
			'ref/inner': {
				name: 'ref/inner',
				content: '<!-- wp:paragraph {"content":"Inner"} --><p>Inner</p><!-- /wp:paragraph -->'
			}
		};

		const trees = patternToTrees(
			{ name: 'outer', content: '<!-- wp:pattern {"slug":"ref/inner"} --><!-- /wp:pattern -->' },
			patternsByName as never
		);

		expect( trees ).toEqual([
			{ name: 'core/paragraph', attributes: { content: 'Inner' }, innerBlocks: [] }
		]);
	});

	it( 'pattern pipeline: briefs, picks a matching pattern, and rewrites its copy', async() => {
		const onPhase = jest.fn();

		const completion = jest.fn()

			// Req 1 — layout brief with a single conceptual section.
			.mockResolvedValueOnce( JSON.stringify({
				mission: 'Convert visitors.',
				design: { style: 'modern' },
				sections: [{ id: 'hero', intent: 'A bold hero.' }]
			}) )

			// Req 2 — assign the hero pattern to the hero section.
			.mockResolvedValueOnce( JSON.stringify({
				assignments: [{ sectionId: 'hero', patternName: 'otter/hero' }]
			}) )

			// Req 5 — rewrite the pattern's text (no Req 3 outline: nothing missing).
			.mockResolvedValueOnce( JSON.stringify({
				roots: [{ name: 'core/paragraph', attributes: { content: 'Rewritten hero.' }}]
			}) );

		const result = await generateBlocksFromTask({
			task: 'A hero section.',
			blockTypes,
			patterns: [
				{
					name: 'otter/hero',
					title: 'Hero',
					description: 'A hero section.',
					categories: [ 'otter-blocks' ],
					content: '<!-- wp:paragraph {"content":"Demo hero"} --><p>Demo hero</p><!-- /wp:paragraph -->'
				}
			],
			requestCompletion: completion,
			onPhase
		});

		// brief + selection + rewrite — no outline call when nothing is missing.
		expect( completion ).toHaveBeenCalledTimes( 3 );
		expect( result.blocks.map( block => block.name ) ).toEqual([ 'core/paragraph' ]);
		expect( result.blocks[0].attributes?.content ).toBe( 'Rewritten hero.' );

		// The rewrite prompt is seeded with the pattern's current copy.
		expect( completion.mock.calls[2][0] ).toContain( 'Demo hero' );

		expect( onPhase.mock.calls.map( call => call[0]) ).toEqual(
			expect.arrayContaining([ 'briefing', 'selecting', 'building' ])
		);
	});

	it( 'pattern pipeline: outlines and generates the sections with no matching pattern', async() => {
		const completion = jest.fn()

			// Req 1 — two conceptual sections.
			.mockResolvedValueOnce( JSON.stringify({
				mission: 'A landing page.',
				design: {},
				sections: [
					{ id: 'hero', intent: 'A hero.' },
					{ id: 'contact', intent: 'A contact prompt.' }
				]
			}) )

			// Req 2 — hero gets a pattern, contact has none.
			.mockResolvedValueOnce( JSON.stringify({
				assignments: [
					{ sectionId: 'hero', patternName: 'otter/hero' },
					{ sectionId: 'contact', patternName: null }
				]
			}) )

			// Req 3 — outline only the missing 'contact' section.
			.mockResolvedValueOnce( JSON.stringify({
				roots: [{ sectionId: 'contact', name: 'core/paragraph', notes: 'Contact.' }]
			}) )

			// Req 5 — rewrite the hero pattern (sections fill in brief order).
			.mockResolvedValueOnce( JSON.stringify({
				roots: [{ name: 'core/paragraph', attributes: { content: 'Hero copy.' }}]
			}) )

			// Req 5 — fill the generated contact section.
			.mockResolvedValueOnce( JSON.stringify({
				roots: [{ name: 'core/paragraph', attributes: { content: 'Reach us.' }}]
			}) );

		const result = await generateBlocksFromTask({
			task: 'A landing page.',
			blockTypes,
			patterns: [
				{
					name: 'otter/hero',
					title: 'Hero',
					description: 'A hero section.',
					categories: [ 'otter-blocks' ],
					content: '<!-- wp:paragraph {"content":"Demo hero"} --><p>Demo hero</p><!-- /wp:paragraph -->'
				}
			],
			requestCompletion: completion
		});

		// brief + selection + outline + 2 fills.
		expect( completion ).toHaveBeenCalledTimes( 5 );
		expect( result.blocks.map( block => block.attributes?.content ) ).toEqual([ 'Hero copy.', 'Reach us.' ]);
	});

	it( 'pattern pipeline: falls back to generation when a chosen pattern uses unsupported blocks', async() => {
		const completion = jest.fn()

			.mockResolvedValueOnce( JSON.stringify({
				mission: 'A page.',
				design: {},
				sections: [{ id: 'hero', intent: 'A hero.' }]
			}) )

			// The model picks a pattern whose content is an unregistered block.
			.mockResolvedValueOnce( JSON.stringify({
				assignments: [{ sectionId: 'hero', patternName: 'otter/broken' }]
			}) )

			// The broken pattern prunes away → hero becomes a "missing" section to outline.
			.mockResolvedValueOnce( JSON.stringify({
				roots: [{ sectionId: 'hero', name: 'core/paragraph', notes: 'Hero.' }]
			}) )

			// Fill the now-generated hero section.
			.mockResolvedValueOnce( JSON.stringify({
				roots: [{ name: 'core/paragraph', attributes: { content: 'Generated hero.' }}]
			}) );

		const result = await generateBlocksFromTask({
			task: 'A hero.',
			blockTypes,
			patterns: [
				{
					name: 'otter/broken',
					title: 'Broken',
					description: 'Uses an unsupported block.',
					categories: [ 'otter-blocks' ],
					content: '<!-- wp:acme/unregistered --><!-- /wp:acme/unregistered -->'
				}
			],
			requestCompletion: completion
		});

		// brief + selection + outline + fill (the pattern was unusable).
		expect( completion ).toHaveBeenCalledTimes( 4 );
		expect( result.blocks.map( block => block.attributes?.content ) ).toEqual([ 'Generated hero.' ]);
	});

	it( 'refine: patches only the targeted block and leaves siblings byte-for-byte identical', async() => {
		const base = jsonTreeToBlocks(
			[
				{ name: 'core/paragraph', attributes: { content: 'Keep this exactly.' }},
				{ name: 'core/paragraph', attributes: { content: 'Old second line.' }}
			],
			getBlockType
		);

		// The model is handed the current tree (ids + attributes) and the instruction.
		const completion = jest.fn().mockResolvedValueOnce( JSON.stringify({
			patches: [{ id: '1', attributes: { content: 'New second line.' }}]
		}) );

		const result = await refineGeneratedBlocks({
			task: 'A hero section.',
			instruction: 'rewrite the second paragraph',
			baseBlocks: base,
			blockTypes,
			requestCompletion: completion
		});

		expect( completion ).toHaveBeenCalledTimes( 1 );
		expect( completion.mock.calls[0][0] ).toContain( 'Old second line.' );
		expect( completion.mock.calls[0][0] ).toContain( 'rewrite the second paragraph' );

		// First paragraph untouched, second patched — structure preserved.
		expect( result.blocks.map( block => block.attributes?.content ) ).toEqual([
			'Keep this exactly.',
			'New second line.'
		]);
	});

	it( 'refine: targets a nested block by its id path and preserves the surrounding structure', async() => {
		const base = jsonTreeToBlocks(
			[
				{
					name: 'themeisle-blocks/advanced-columns',
					attributes: { id: 'section-1' },
					innerBlocks: [
						{
							name: 'themeisle-blocks/advanced-column',
							attributes: { id: 'col-1', width: 50 },
							innerBlocks: [
								{ name: 'core/paragraph', attributes: { content: 'Original nested copy.' }}
							]
						}
					]
				}
			],
			getBlockType
		);

		const completion = jest.fn().mockResolvedValueOnce( JSON.stringify({
			patches: [{ id: '0.0.0', attributes: { content: 'Refined nested copy.' }}]
		}) );

		const result = await refineGeneratedBlocks({
			task: '',
			instruction: 'tweak the nested paragraph',
			baseBlocks: base,
			blockTypes,
			requestCompletion: completion
		});

		const paragraph = result.blocks[0].innerBlocks?.[0].innerBlocks?.[0];
		expect( paragraph?.attributes?.content ).toBe( 'Refined nested copy.' );

		// Ancestors keep their attributes exactly.
		expect( result.blocks[0].attributes?.id ).toBe( 'section-1' );
		expect( result.blocks[0].innerBlocks?.[0].attributes ).toEqual({ id: 'col-1', width: 50 });
	});

	it( 'refine: leaves the result untouched when there are no patches', async() => {
		const base = jsonTreeToBlocks(
			[{ name: 'core/paragraph', attributes: { content: 'Unchanged.' }}],
			getBlockType
		);

		const completion = jest.fn().mockResolvedValueOnce( JSON.stringify({ patches: [] }) );

		const result = await refineGeneratedBlocks({
			task: '',
			instruction: 'do nothing applicable',
			baseBlocks: base,
			blockTypes,
			requestCompletion: completion
		});

		expect( result.blocks ).toBe( base );
	});

	it( 'refine: keeps the original result when the response is unparseable', async() => {
		const base = jsonTreeToBlocks(
			[{ name: 'core/paragraph', attributes: { content: 'Untouched.' }}],
			getBlockType
		);

		const completion = jest.fn().mockResolvedValueOnce( 'not json at all' );

		const result = await refineGeneratedBlocks({
			task: '',
			instruction: 'anything',
			baseBlocks: base,
			blockTypes,
			requestCompletion: completion
		});

		expect( result.blocks ).toBe( base );
	});

	it( 'refine: patches a child-only block selected in the editor (e.g. Otter button)', async() => {
		const base = [{
			clientId: 'btn-1',
			name: 'themeisle-blocks/button',
			attributes: { text: 'Old label' },
			innerBlocks: []
		}];

		const completion = jest.fn().mockResolvedValueOnce( JSON.stringify({
			patches: [{ id: '0', attributes: { text: 'Start Building Today — Get the Guide' }}]
		}) );

		const result = await refineGeneratedBlocks({
			task: 'Rewrite the button label.',
			instruction: 'Rewrite the button label.',
			baseBlocks: base,
			blockTypes,
			requestCompletion: completion
		});

		expect( result.blocks[0].clientId ).toBe( 'btn-1' );
		expect( result.blocks[0].attributes?.text ).toBe( 'Start Building Today — Get the Guide' );
		expect( result.diagnostics.droppedRoots ).toHaveLength( 0 );
	});

	it( 'validate: allows root blocks that require a parent when replacing in the editor', () => {
		const blocks = jsonTreeToBlocks(
			[{ name: 'themeisle-blocks/button', attributes: { text: 'Click me' }}],
			getBlockType
		);

		expect( validateGeneratedBlocks( blocks, getBlockType ).valid ).toBe( false );
		expect( validateGeneratedBlocks( blocks, getBlockType, { skipRootParentChecks: true }).valid ).toBe( true );
	});

	it( 'repair loop: re-prompts with validation errors and recovers a section', async() => {
		const completion = jest.fn()

			// Plan: one paragraph section.
			.mockResolvedValueOnce( JSON.stringify({
				mission: '',
				roots: [{ name: 'core/paragraph', notes: 'A line.' }]
			}) )

			// First fill is structurally invalid (orphan column) → triggers a retry.
			.mockResolvedValueOnce( JSON.stringify({
				roots: [{ name: 'themeisle-blocks/advanced-column', attributes: {}}]
			}) )

			// Retry succeeds.
			.mockResolvedValueOnce( JSON.stringify({
				roots: [{ name: 'core/paragraph', attributes: { content: 'Recovered copy.' }}]
			}) );

		const result = await generateBlocksFromTask({
			task: 'A paragraph.',
			blockTypes,
			requestCompletion: completion
		});

		// plan + failed fill + repaired fill (no quality call — clean copy).
		expect( completion ).toHaveBeenCalledTimes( 3 );
		expect( completion.mock.calls[2][0] ).toContain( 'invalid block structure' );
		expect( result.blocks.map( block => block.attributes?.content ) ).toEqual([ 'Recovered copy.' ]);
		expect( result.diagnostics.droppedRoots ).toHaveLength( 0 );
	});

	it( 'quality pass: fixes a low-contrast section with an attribute patch', async() => {
		const completion = jest.fn()

			// Plan.
			.mockResolvedValueOnce( JSON.stringify({
				mission: '',
				roots: [{ name: 'core/paragraph', notes: 'A line.' }]
			}) )

			// Fill returns readable copy but an unreadable color pair.
			.mockResolvedValueOnce( JSON.stringify({
				roots: [{
					name: 'core/paragraph',
					attributes: { content: 'A clear sentence of copy.', style: { color: { background: '#888888', text: '#777777' }}}
				}]
			}) )

			// Quality fix pass: patch the contrast issue on block id "0".
			.mockResolvedValueOnce( JSON.stringify({
				patches: [{ id: '0', attributes: { style: { color: { background: '#ffffff', text: '#111111' }}}}]
			}) );

		const result = await generateBlocksFromTask({
			task: 'A paragraph.',
			blockTypes,
			requestCompletion: completion
		});

		// plan + fill + one quality fix pass.
		expect( completion ).toHaveBeenCalledTimes( 3 );

		// The fix prompt carries the contrast issue keyed by block id.
		expect( completion.mock.calls[2][0] ).toContain( 'low text contrast' );

		const style = result.blocks[0].attributes?.style as { color?: { text?: string } };
		expect( style?.color?.text ).toBe( '#111111' );
	});

	it( 'keeps catalog blocks whose names only contain asset keywords as substrings', () => {
		const catalog = buildStructureCatalog([
			{ name: 'acme/profile-card', title: 'Profile Card', attributes: {}, supports: { inserter: true }},
			{ name: 'acme/sitemap-links', title: 'Sitemap Links', attributes: {}, supports: { inserter: true }},
			{ name: 'core/image', title: 'Image', attributes: {}, supports: { inserter: true }}
		]);

		expect( catalog.map( entry => entry.slug ) ).toEqual([
			'acme/profile-card',
			'acme/sitemap-links'
		]);
	});
});
