jest.mock( '@wordpress/blocks', () => require( './mocks/wordpress-blocks' ) );

import {
	buildAttributeSchema,
	buildStructureCatalog,
	generateBlocksFromTask,
	jsonTreeToBlocks,
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
	it( 'phase 1: builds a slim, Atomic-Wind-only catalog with slug, trimmed description and container hint', () => {
		const catalog = buildStructureCatalog([
			{ name: 'atomic-wind/box', title: 'Box', description: 'A layout container. '.repeat( 10 ), attributes: { tagName: { type: 'string' } }, supports: { inserter: true }},
			{ name: 'atomic-wind/text', title: 'Text', description: 'A text primitive.', attributes: { content: { type: 'string', source: 'html' } }, supports: { inserter: true }},
			// Core + Otter blocks are excluded entirely — generation is atomic-only.
			...blockTypes
		]);

		expect( catalog.map( entry => entry.slug ) ).toEqual([
			'atomic-wind/box',
			'atomic-wind/text'
		]);

		// The box is the layout container; the text primitive is not.
		expect( catalog[0]).toMatchObject({ slug: 'atomic-wind/box', container: true });
		expect( catalog[1]).toMatchObject({ slug: 'atomic-wind/text', container: false });

		// Descriptions are trimmed and never carry attribute noise.
		expect( catalog[0].description.length ).toBeLessThanOrEqual( 100 );
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

	it( 'page scope: splits into a page outline then per-section outline + construct', async() => {
		const onRootComplete = jest.fn();
		const onPlanReady = jest.fn();

		// Sections build concurrently, so calls interleave — answer by content, not
		// call order. SECTION_OUTLINE tags the root with its section; CONSTRUCT reads
		// that tag back so each section gets its own copy regardless of timing.
		const completion = jest.fn( async( prompt: string ) => {
			if ( prompt.includes( 'PAGE_OUTLINE' ) ) {
				return JSON.stringify({
					mission: 'A cozy cabin page.',
					design: { style: 'frosted', palette: [ 'primary' ] },
					rationale: [ 'Hero then contact.' ],
					sections: [
						{ title: 'Hero', notes: 'Big welcome.' },
						{ title: 'Contact', notes: 'A way to reach us.' }
					]
				});
			}

			if ( prompt.includes( 'SECTION_OUTLINE' ) ) {
				const title = prompt.includes( '"Hero"' ) ? 'Hero' : 'Contact';
				return JSON.stringify({ roots: [ { name: 'core/paragraph', notes: `SECTION:${ title }` } ] });
			}

			// CONSTRUCT — the root's notes ("SECTION:…") are echoed in the prompt.
			const content = prompt.includes( 'SECTION:Hero' ) ? 'Welcome to the cabin.' : 'Reach us anytime.';
			return JSON.stringify({ roots: [ { name: 'core/paragraph', attributes: { content } } ] });
		});

		const result = await generateBlocksFromTask({
			task: 'A mountain cabin page.',
			scope: 'page',
			blockTypes,
			requestCompletion: completion,
			onPlanReady,
			onRootComplete
		});

		// One page outline + (outline + construct) per section = 5 calls. No single
		// call ever carries the whole page tree.
		expect( completion ).toHaveBeenCalledTimes( 5 );
		expect( completion.mock.calls[0][0] ).toContain( 'Pipeline step: PAGE_OUTLINE' );
		expect( completion.mock.calls.some( ( call ) => call[0].includes( 'Pipeline step: SECTION_OUTLINE' ) && call[0].includes( '"Hero"' ) ) ).toBe( true );
		expect( completion.mock.calls.filter( ( call ) => call[0].includes( 'Pipeline step: CONSTRUCT' ) ) ).toHaveLength( 2 );

		// Progress total is the section count, reported up front and once per section.
		expect( onPlanReady.mock.calls[0][0].roots ).toHaveLength( 2 );
		expect( onRootComplete ).toHaveBeenCalledTimes( 2 );

		// Assembled in section order even though the sections built concurrently.
		expect( result.blocks.map( block => block.attributes?.content ) ).toEqual([
			'Welcome to the cabin.',
			'Reach us anytime.'
		]);
		expect( result.plan.mission ).toBe( 'A cozy cabin page.' );
	});

	it( 'caps an oversized repeated run so the CONSTRUCT fills only a representative few', async() => {
		// SECTION_OUTLINE returns a gallery-like run of 7 same-slug siblings.
		const sixColumns = Array.from( { length: 7 }, () => ({ name: 'themeisle-blocks/advanced-column' }) );

		const completion = jest.fn()
			.mockResolvedValueOnce( JSON.stringify({ mission: '', sections: [ { title: 'Gallery' } ] }) )
			.mockResolvedValueOnce( JSON.stringify({ roots: [ { name: 'themeisle-blocks/advanced-columns', innerBlocks: sixColumns } ] }) )
			.mockResolvedValueOnce( JSON.stringify({
				roots: [ {
					name: 'themeisle-blocks/advanced-columns',
					attributes: {},
					innerBlocks: Array.from( { length: 4 }, () => ({ name: 'themeisle-blocks/advanced-column', attributes: { width: 25 } }) )
				} ]
			}) );

		await generateBlocksFromTask({
			task: 'A gallery with too many tiles.',
			scope: 'page',
			blockTypes,
			requestCompletion: completion
		});

		// The CONSTRUCT prompt (call #3) carries the capped structure — 4 columns,
		// not the 7 the outline produced.
		const constructPrompt = completion.mock.calls[2][0];
		const columnCount = ( constructPrompt.match( /themeisle-blocks\/advanced-column"/g ) || [] ).length;
		expect( columnCount ).toBe( 4 );
	});

	it( 'page scope: drops a section whose call throws and keeps building the rest', async() => {
		const onRootComplete = jest.fn();

		// Content-aware (sections build concurrently): the Gallery's SECTION_OUTLINE
		// throws; the others succeed and carry their own copy.
		const completion = jest.fn( async( prompt: string ) => {
			if ( prompt.includes( 'PAGE_OUTLINE' ) ) {
				return JSON.stringify({
					mission: '',
					sections: [ { title: 'Hero' }, { title: 'Gallery' }, { title: 'Contact' } ]
				});
			}

			if ( prompt.includes( 'SECTION_OUTLINE' ) ) {
				if ( prompt.includes( '"Gallery"' ) ) {
					throw new Error( 'rest_invalid_json' );
				}
				const title = prompt.includes( '"Hero"' ) ? 'Hero' : 'Contact';
				return JSON.stringify({ roots: [ { name: 'core/paragraph', notes: `SECTION:${ title }` } ] });
			}

			const content = prompt.includes( 'SECTION:Hero' ) ? 'Hero copy.' : 'Contact copy.';
			return JSON.stringify({ roots: [ { name: 'core/paragraph', attributes: { content } } ] });
		});

		const result = await generateBlocksFromTask({
			task: 'A page with a flaky section.',
			scope: 'page',
			blockTypes,
			requestCompletion: completion,
			onRootComplete
		});

		// The two healthy sections survive in order; the failing one is dropped.
		expect( result.blocks.map( block => block.attributes?.content ) ).toEqual([ 'Hero copy.', 'Contact copy.' ]);
		expect( result.diagnostics.droppedRoots ).toHaveLength( 1 );
		expect( result.diagnostics.droppedRoots[0].errors[0] ).toContain( 'rest_invalid_json' );

		// Every section still reports a progress step, including the dropped one.
		expect( onRootComplete ).toHaveBeenCalledTimes( 3 );
		expect( onRootComplete.mock.calls.filter( ( call ) => 0 === call[0].blocks.length ) ).toHaveLength( 1 );
	});

	it( 'page scope: a user abort propagates instead of being swallowed as a dropped section', async() => {
		const abort = Object.assign( new Error( 'Aborted' ), { name: 'AbortError' } );

		const completion = jest.fn()
			.mockResolvedValueOnce( JSON.stringify({ mission: '', sections: [ { title: 'Hero' } ] }) )
			.mockRejectedValueOnce( abort );

		await expect( generateBlocksFromTask({
			task: 'A page the user cancels.',
			scope: 'page',
			blockTypes,
			requestCompletion: completion
		}) ).rejects.toMatchObject({ name: 'AbortError' });
	});

	it( 'page scope: falls back to the single-outline flow when the page outline has no sections', async() => {
		const completion = jest.fn()
			// PAGE_OUTLINE returns no usable sections → fall back.
			.mockResolvedValueOnce( JSON.stringify({ mission: '', sections: [] }) )

			// Fallback single-outline PLAN + CONSTRUCT.
			.mockResolvedValueOnce( JSON.stringify({ mission: '', roots: [ { name: 'core/paragraph', notes: 'A line.' } ] }) )
			.mockResolvedValueOnce( JSON.stringify({ roots: [ { name: 'core/paragraph', attributes: { content: 'Fallback copy.' } } ] }) );

		const result = await generateBlocksFromTask({
			task: 'A page that degrades.',
			scope: 'page',
			blockTypes,
			requestCompletion: completion
		});

		expect( completion.mock.calls[1][0] ).toContain( 'OUTLINE (catalog)' );
		expect( result.blocks.map( block => block.attributes?.content ) ).toEqual([ 'Fallback copy.' ]);
	});

	it( 'is atomic-only: excludes core and Otter blocks and keeps every Atomic Wind primitive', () => {
		const catalog = buildStructureCatalog([
			{ name: 'core/paragraph', title: 'Paragraph', attributes: {}, supports: { inserter: true }},
			{ name: 'themeisle-blocks/advanced-heading', title: 'Heading', attributes: {}, supports: { inserter: true }},
			{ name: 'atomic-wind/box', title: 'Box', attributes: {}, supports: { inserter: true }},
			{ name: 'atomic-wind/text', title: 'Text', attributes: {}, supports: { inserter: true }},
			{ name: 'atomic-wind/icon', title: 'Icon', attributes: {}, supports: { inserter: true }},
			{ name: 'atomic-wind/link', title: 'Link', attributes: {}, supports: { inserter: true }},
			// Matches the asset/service filter on "image" — must still survive
			// because it is an Atomic Wind primitive.
			{ name: 'atomic-wind/image', title: 'Image', attributes: {}, supports: { inserter: true }}
		]);

		expect( catalog.map( entry => entry.slug ) ).toEqual([
			'atomic-wind/box',
			'atomic-wind/text',
			'atomic-wind/icon',
			'atomic-wind/link',
			'atomic-wind/image'
		]);
	});

	it( 'forces Atomic Wind primitives in the plan prompt, allowing only the form/map exceptions', () => {
		const atomicBlockTypes = [
			{ name: 'atomic-wind/box', title: 'Box', description: 'A box.', attributes: {}, supports: { inserter: true }},
			{ name: 'atomic-wind/text', title: 'Text', description: 'Text.', attributes: { content: { type: 'string', source: 'html' } }, supports: { inserter: true }}
		];

		const completion = jest.fn()
			.mockResolvedValueOnce( JSON.stringify({ mission: '', roots: [ { name: 'atomic-wind/box', notes: 'A box.', innerBlocks: [ { name: 'atomic-wind/text' } ] } ] }) )
			.mockResolvedValueOnce( JSON.stringify({ roots: [ { name: 'atomic-wind/box', attributes: {}, innerBlocks: [ { name: 'atomic-wind/text', attributes: { content: 'Hi.' } } ] } ] }) );

		return generateBlocksFromTask({
			task: 'A simple section.',
			blockTypes: atomicBlockTypes,
			requestCompletion: completion
		}).then( () => {
			const planPrompt = completion.mock.calls[0][0];
			// The plan steers to atomic primitives and never to generic Otter/core,
			// but permits the curated form/map blocks when the task calls for them.
			expect( planPrompt ).toContain( 'Build the structure from Atomic Wind primitives' );
			expect( planPrompt ).not.toContain( 'Prefer Otter blocks' );
			expect( planPrompt ).toContain( 'atomic-wind/box' );
			expect( planPrompt ).toContain( 'themeisle-blocks/leaflet-map' );
		});
	});

	it( 'includes the curated form and map blocks in the structure catalog', () => {
		const catalog = buildStructureCatalog([
			{ name: 'atomic-wind/box', description: 'A box.', supports: { inserter: true }, allowedBlocks: [] },
			{ name: 'themeisle-blocks/form', description: 'A form.', supports: { inserter: true } },
			{ name: 'themeisle-blocks/form-input', description: 'An input.', supports: { inserter: true }, ancestor: [ 'themeisle-blocks/form' ] },
			{ name: 'themeisle-blocks/leaflet-map', description: 'A map.', supports: { inserter: true } },
			// Excluded: not atomic-wind and not in the curated extras.
			{ name: 'themeisle-blocks/google-map', description: 'A keyed map.', supports: { inserter: true } },
			{ name: 'core/paragraph', description: 'A paragraph.', supports: { inserter: true } }
		]);

		const slugs = catalog.map( ( entry ) => entry.slug );

		expect( slugs ).toContain( 'themeisle-blocks/form' );
		expect( slugs ).toContain( 'themeisle-blocks/leaflet-map' );
		expect( slugs ).not.toContain( 'themeisle-blocks/google-map' );
		expect( slugs ).not.toContain( 'core/paragraph' );
		// The form is detected as a container (its input declares it as an ancestor).
		expect( catalog.find( ( entry ) => 'themeisle-blocks/form' === entry.slug )?.container ).toBe( true );
	});
});
