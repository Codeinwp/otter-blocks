jest.mock( 'uuid', () => ({
	v4: () => 'mocked-uuid'
}) );

jest.mock( '@wordpress/blocks', () => require( './mocks/wordpress-blocks' ) );

import {
	AI_TOOLBAR_ACTIONS_OPTION,
	countCustomActions,
	createCustomAction,
	DEFAULT_BUILTIN_ACTIONS,
	getEnabledActions,
	getToolbarActionsFromSettings,
	mergeBuiltinDefaults,
	normalizeToolbarAction,
	normalizeToolbarActions
} from '../../plugins/ai-content/actions';

import {
	applyGeneratedContent,
	buildBlockContextMessage,
	collectBlockNames,
	extractBlockAttributeDefinitions,
	parseGeneratedContent,
	type BlockSchemaPayload
} from '../../plugins/ai-content/apply-content';

describe( 'ai-content actions', () => {
	it( 'normalizes legacy { title, prompt } settings', () => {
		const action = normalizeToolbarAction({
			title: 'Fix Grammar',
			prompt: 'Fix any grammatical errors in the following.'
		}, 0 );

		expect( action ).toMatchObject({
			title: 'Fix Grammar',
			prompt: 'Fix any grammatical errors in the following.',
			enabled: true,
			custom: true
		});
	});

	it( 'returns only the enabled actions as quick-start chips', () => {
		const actions = normalizeToolbarActions([
			{ id: 'rewrite', title: 'Rewrite', prompt: 'Rewrite', enabled: true, custom: false },
			{ id: 'summarize', title: 'Summarize', prompt: 'Summarize', enabled: false, custom: false }
		]);

		expect( getEnabledActions( actions ).map( ( action ) => action.id ) ).toEqual([ 'rewrite' ]);
	});

	it( 'creates custom actions with plain-text defaults', () => {
		const action = createCustomAction();

		expect( action.custom ).toBe( true );
		expect( action.enabled ).toBe( true );
		expect( action.prompt ).toBeTruthy();
		expect( action.prompt ).not.toContain( '{' );
	});

	it( 'counts custom actions', () => {
		const actions = normalizeToolbarActions([
			{ id: 'rewrite', title: 'Rewrite', prompt: 'Rewrite', enabled: true, custom: false },
			{ id: 'custom-1', title: 'Custom', prompt: 'Custom', enabled: true, custom: true }
		]);

		expect( countCustomActions( actions ) ).toBe( 1 );
	});

	it( 'merges missing built-in defaults', () => {
		const actions = normalizeToolbarActions([
			{ id: 'rewrite', title: 'Rewrite', prompt: 'Rewrite', enabled: true, custom: false }
		]);

		const merged = mergeBuiltinDefaults( actions );

		expect( merged.length ).toBeGreaterThan( 1 );
		expect( merged.some( ( action ) => 'summarize' === action.id ) ).toBe( true );
	});

	it( 'reads canonical toolbar actions from settings', () => {
		const getOption = ( key: string ) => {
			if ( AI_TOOLBAR_ACTIONS_OPTION === key ) {
				return [{ id: 'rewrite', title: 'Rewrite', prompt: 'Rewrite', enabled: true, custom: false }];
			}

			return [];
		};

		expect( getToolbarActionsFromSettings( getOption ) ).toHaveLength( 1 );
	});

	it( 'generates unique ids for custom actions', () => {
		const first = createCustomAction();
		const second = createCustomAction();

		expect( first.id ).not.toBe( second.id );
		expect( first.id.startsWith( 'custom-' ) ).toBe( true );
	});

	it( 'avoids id collisions when normalizing actions without ids', () => {
		const actions = normalizeToolbarActions([
			{ id: 'custom-1', title: 'Saved', prompt: 'Saved', enabled: true, custom: true },
			{ title: 'No Id A', prompt: 'A' },
			{ title: 'No Id B', prompt: 'B' }
		]);

		const ids = actions.map( ( action ) => action.id );

		expect( new Set( ids ).size ).toBe( ids.length );
		expect( ids ).toContain( 'custom-1' );
	});

	it( 'ships translate as a plain quick-start action (no magic tags or tone pills)', () => {
		const translate = DEFAULT_BUILTIN_ACTIONS.find( ( action ) => 'translate' === action.id );

		expect( translate ).toBeDefined();
		expect( translate?.prompt ).not.toContain( '{' );
		expect( translate ).not.toHaveProperty( 'tones' );
		expect( translate ).not.toHaveProperty( 'type' );
	});
});

describe( 'parseGeneratedContent', () => {
	it( 'parses plain text into a paragraph block via rawHandler', () => {
		const blocks = parseGeneratedContent( 'Hello world' );

		expect( blocks ).toHaveLength( 1 );
		expect( blocks[0].name ).toBe( 'core/paragraph' );
		expect( blocks[0].attributes?.content ).toBe( 'Hello world' );
	});

	it( 'parses raw HTML into blocks via rawHandler', () => {
		const blocks = parseGeneratedContent( '<ul><li>A</li><li>B</li></ul>' );

		expect( blocks.length ).toBeGreaterThan( 0 );
		expect( blocks[0].name ).toBe( 'core/list' );
	});

	it( 'parses block comment syntax via the block parser', () => {
		const blockMarkup = [
			'<!-- wp:paragraph -->',
			'<p>First</p>',
			'<!-- /wp:paragraph -->',
			'',
			'<!-- wp:heading {"level":2} -->',
			'<h2>Title</h2>',
			'<!-- /wp:heading -->'
		].join( '\n' );

		const blocks = parseGeneratedContent( blockMarkup );

		expect( blocks ).toHaveLength( 2 );
		expect( blocks[0].name ).toBe( 'core/paragraph' );
		expect( blocks[1].name ).toBe( 'core/heading' );
	});

	it( 'preserves block attributes from block comment syntax', () => {
		const blockMarkup = [
			'<!-- wp:heading {"level":3,"textAlign":"center"} -->',
			'<h3 class="has-text-align-center">Title</h3>',
			'<!-- /wp:heading -->'
		].join( '\n' );

		const blocks = parseGeneratedContent( blockMarkup );

		expect( blocks ).toHaveLength( 1 );
		expect( blocks[0].name ).toBe( 'core/heading' );
		expect( blocks[0].attributes?.content ).toBe( 'Title' );
		expect( blocks[0].attributes?.level ).toBe( 3 );
	});
});

describe( 'buildBlockContextMessage', () => {
	const mockGetBlockType = ( name: string ) => {
		const schemas: Record<string, { attributes: Record<string, Record<string, unknown>> }> = {
			'themeisle-blocks/form': {
				attributes: { id: { type: 'string' } }
			},
			'themeisle-blocks/form-input': {
				attributes: { label: { type: 'string' } }
			}
		};

		return schemas[ name ];
	};

	it( 'returns an empty string when there are no blocks', () => {
		expect( buildBlockContextMessage([], mockGetBlockType ) ).toBe( '' );
	});

	it( 'includes a schema map deduplicated by block type for the selection and inner blocks', () => {
		const blocks = [
			{
				clientId: 'form',
				name: 'themeisle-blocks/form',
				attributes: { id: 'form-1' },
				innerBlocks: [
					{ clientId: 'input-a', name: 'themeisle-blocks/form-input', attributes: { id: 'input-name' }},
					{ clientId: 'input-b', name: 'themeisle-blocks/form-input', attributes: { id: 'input-email' }}
				]
			}
		];

		const message = buildBlockContextMessage( blocks, mockGetBlockType );

		expect( message ).toContain( 'Block schema' );
		expect( message ).toContain( 'themeisle-blocks/form' );

		// The repeated input type contributes a single schema entry (deduplicated),
		// while its instances remain distinct in the tree.
		expect( message.match( /"label"/g ) ).toHaveLength( 1 );
		expect( message ).toContain( 'input-name' );
		expect( message ).toContain( 'input-email' );
	});
});

describe( 'extractBlockAttributeDefinitions', () => {
	const mockGetBlockType = ( name: string ) => {
		const schemas: Record<string, { attributes: Record<string, Record<string, unknown>> }> = {
			'themeisle-blocks/form': {
				attributes: {
					id: { type: 'string' },
					optionName: { type: 'string' }
				}
			},
			'themeisle-blocks/form-input': {
				attributes: {
					label: { type: 'string' },
					isRequired: { type: 'boolean' },
					defaultValue: {
						type: 'string',
						source: 'attribute',
						selector: 'input.otter-form-input',
						attribute: 'value'
					}
				}
			},
			'themeisle-blocks/form-textarea': {
				attributes: {
					label: { type: 'string' }
				}
			}
		};

		return schemas[ name ];
	};

	it( 'collects inner block types from the selection tree', () => {
		const blocks = [
			{
				clientId: 'form',
				name: 'themeisle-blocks/form',
				attributes: {},
				innerBlocks: [
					{ clientId: 'input', name: 'themeisle-blocks/form-input', attributes: {}},
					{ clientId: 'textarea', name: 'themeisle-blocks/form-textarea', attributes: {}}
				]
			}
		];

		expect( collectBlockNames( blocks ) ).toEqual([
			'themeisle-blocks/form',
			'themeisle-blocks/form-input',
			'themeisle-blocks/form-textarea'
		]);
	});

	it( 'strips editor-internal attribute keys from definitions', () => {
		const blocks = [
			{
				clientId: 'input',
				name: 'themeisle-blocks/form-input',
				attributes: { id: 'input-1' }
			}
		];

		const definitions = JSON.parse(
			extractBlockAttributeDefinitions( blocks, mockGetBlockType )
		) as BlockSchemaPayload;

		expect( definitions.schemas['themeisle-blocks/form-input'] ).toEqual({
			label: { type: 'string' },
			isRequired: { type: 'boolean' }
		});
		expect( definitions.tree['input-1'] ).toEqual({ type: 'themeisle-blocks/form-input' });
	});

	it( 'maps inner blocks by instance id so duplicate types stay distinct', () => {
		const blocks = [
			{
				clientId: 'form',
				name: 'themeisle-blocks/form',
				attributes: { id: 'form-1' },
				innerBlocks: [
					{
						clientId: 'input-a',
						name: 'themeisle-blocks/form-input',
						attributes: { id: 'input-name', label: 'Name' }
					},
					{
						clientId: 'input-b',
						name: 'themeisle-blocks/form-input',
						attributes: { id: 'input-email', label: 'Email', type: 'email' }
					},
					{
						clientId: 'textarea',
						name: 'themeisle-blocks/form-textarea',
						attributes: { id: 'textarea-message', label: 'Message' }
					}
				]
			}
		];

		const definitions = JSON.parse(
			extractBlockAttributeDefinitions( blocks, mockGetBlockType )
		) as BlockSchemaPayload;

		expect( Object.keys( definitions.tree ) ).toEqual([ 'form-1' ]);
		expect( definitions.tree['form-1'].type ).toBe( 'themeisle-blocks/form' );
		expect( Object.keys( definitions.tree['form-1'].innerBlocks || {}) ).toEqual([
			'input-name',
			'input-email',
			'textarea-message'
		]);
		expect( definitions.tree['form-1'].innerBlocks?.['input-name'] ).toEqual({ type: 'themeisle-blocks/form-input' });
		expect( definitions.tree['form-1'].innerBlocks?.['input-email'] ).toEqual({ type: 'themeisle-blocks/form-input' });
		expect( definitions.tree['form-1'].innerBlocks?.['textarea-message'] ).toEqual({ type: 'themeisle-blocks/form-textarea' });
		expect( definitions.schemas['themeisle-blocks/form-input'] ).toEqual({
			label: { type: 'string' },
			isRequired: { type: 'boolean' }
		});
		expect( definitions.schemas['themeisle-blocks/form'] ).toEqual({
			id: { type: 'string' },
			optionName: { type: 'string' }
		});
	});

	it( 'outputs pretty-printed json with deduplicated type schemas', () => {
		const blocks = [
			{
				clientId: 'form',
				name: 'themeisle-blocks/form',
				attributes: { id: 'form-1' },
				innerBlocks: [
					{
						clientId: 'input-a',
						name: 'themeisle-blocks/form-input',
						attributes: { id: 'input-name' }
					},
					{
						clientId: 'input-b',
						name: 'themeisle-blocks/form-input',
						attributes: { id: 'input-email' }
					}
				]
			}
		];

		const serialized = extractBlockAttributeDefinitions( blocks, mockGetBlockType );

		expect( serialized ).toContain( '\n' );
		expect( serialized.match( /"themeisle-blocks\/form-input"/g ) ).toHaveLength( 3 );
		expect( serialized.match( /"label"/g ) ).toHaveLength( 1 );
	});
});

describe( 'applyGeneratedContent', () => {
	it( 'uses preservePlainTextAsBlock for richtext availability', () => {
		const sourceBlocks = [
			{ clientId: 'a', name: 'core/paragraph', attributes: { content: 'original' }}
		];

		const blocks = applyGeneratedContent( 'rewritten text', sourceBlocks, 'richtext' );

		expect( blocks ).toHaveLength( 1 );
		expect( blocks[0].name ).toBe( 'core/paragraph' );
	});

	it( 'uses parseGeneratedContent directly for any availability', () => {
		const sourceBlocks = [
			{ clientId: 'a', name: 'core/paragraph', attributes: {}}
		];

		const denseHtml = '<ul><li>Item</li></ul>';
		const blocks = applyGeneratedContent( denseHtml, sourceBlocks, 'any' );

		expect( blocks.length ).toBeGreaterThan( 0 );
		expect( blocks[0].name ).toBe( 'core/list' );
	});

	it( 'uses parseGeneratedContent for any availability with block syntax', () => {
		const sourceBlocks = [
			{ clientId: 'a', name: 'core/paragraph', attributes: {}}
		];

		const blockMarkup = [
			'<!-- wp:paragraph -->',
			'<p>A</p>',
			'<!-- /wp:paragraph -->',
			'',
			'<!-- wp:paragraph -->',
			'<p>B</p>',
			'<!-- /wp:paragraph -->'
		].join( '\n' );

		const blocks = applyGeneratedContent( blockMarkup, sourceBlocks, 'any' );

		expect( blocks ).toHaveLength( 2 );
		expect( blocks[0].name ).toBe( 'core/paragraph' );
		expect( blocks[1].name ).toBe( 'core/paragraph' );
	});
});
