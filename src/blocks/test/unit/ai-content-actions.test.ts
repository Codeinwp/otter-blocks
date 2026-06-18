jest.mock( 'uuid', () => ({
	v4: () => 'mocked-uuid'
}) );

jest.mock( '@wordpress/blocks', () => require( './mocks/wordpress-blocks' ) );

import {
	AI_TOOLBAR_ACTIONS_OPTION,
	countCustomActions,
	createCustomAction,
	DEFAULT_BUILTIN_ACTIONS,
	filterToolbarActionsForBlocks,
	getActionPrompt,
	getToolbarActionsFromSettings,
	mergeBuiltinDefaults,
	normalizeToolbarAction,
	normalizeToolbarActions,
	replaceMagicTags
} from '../../plugins/ai-content/actions';

import {
	applyGeneratedContent,
	collectBlockNames,
	extractBlockAttributeDefinitions,
	parseGeneratedContent,
	resolveBlockContentForPrompt,
	resolveBlockMarkupForPrompt,
	type BlockSchemaPayload
} from '../../plugins/ai-content/apply-content';

describe( 'ai-content actions', () => {
	it( 'normalizes legacy { title, prompt } settings', () => {
		const action = normalizeToolbarAction({
			title: 'Fix Grammar',
			prompt: 'Fix any grammatical errors in the following: {text_input}'
		}, 0 );

		expect( action ).toMatchObject({
			title: 'Fix Grammar',
			prompt: 'Fix any grammatical errors in the following: {text_input}',
			enabled: true,
			custom: true,
			availability: 'richtext',
			type: 'prompt'
		});
	});

	it( 'filters disabled actions from the toolbar', () => {
		const actions = normalizeToolbarActions([
			{ id: 'rewrite', title: 'Rewrite', prompt: 'Rewrite', enabled: true, custom: false, availability: 'richtext' },
			{ id: 'summarize', title: 'Summarize', prompt: 'Summarize', enabled: false, custom: false, availability: 'richtext' }
		]);

		expect( filterToolbarActionsForBlocks( actions, [ 'core/paragraph' ] ) ).toHaveLength( 1 );
		expect( filterToolbarActionsForBlocks( actions, [ 'core/paragraph' ] )[0].id ).toBe( 'rewrite' );
	});

	it( 'shows richtext and any actions on text blocks', () => {
		const actions = normalizeToolbarActions([
			{ id: 'rewrite', title: 'Rewrite', prompt: 'Rewrite', enabled: true, custom: false, availability: 'richtext' },
			{ id: 'custom-table', title: 'Convert to table', prompt: 'Convert', enabled: true, custom: true, availability: 'any' }
		]);

		// "Any block" actions are available everywhere, including rich text blocks.
		expect( filterToolbarActionsForBlocks( actions, [ 'core/paragraph' ] ).map( ( action ) => action.id ) ).toEqual([ 'rewrite', 'custom-table' ]);
		expect( filterToolbarActionsForBlocks( actions, [ 'core/heading' ] ).map( ( action ) => action.id ) ).toEqual([ 'rewrite', 'custom-table' ]);
	});

	it( 'maps any availability to non-text blocks', () => {
		const actions = normalizeToolbarActions([
			{ id: 'rewrite', title: 'Rewrite', prompt: 'Rewrite', enabled: true, custom: false, availability: 'richtext' },
			{ id: 'custom-table', title: 'Convert to table', prompt: 'Convert', enabled: true, custom: true, availability: 'any' }
		]);

		expect( filterToolbarActionsForBlocks( actions, [ 'core/list' ] ).map( ( action ) => action.id ) ).toEqual([ 'custom-table' ]);
	});

	it( 'creates custom actions with defaults', () => {
		const action = createCustomAction();

		expect( action.custom ).toBe( true );
		expect( action.enabled ).toBe( true );
		expect( action.availability ).toBe( 'richtext' );
		expect( action.prompt ).toContain( '{block_content}' );
	});

	it( 'counts custom actions', () => {
		const actions = normalizeToolbarActions([
			{ id: 'rewrite', title: 'Rewrite', prompt: 'Rewrite', enabled: true, custom: false, availability: 'richtext' },
			{ id: 'custom-1', title: 'Custom', prompt: 'Custom', enabled: true, custom: true, availability: 'richtext' }
		]);

		expect( countCustomActions( actions ) ).toBe( 1 );
	});

	it( 'merges missing built-in defaults', () => {
		const actions = normalizeToolbarActions([
			{ id: 'rewrite', title: 'Rewrite', prompt: 'Rewrite', enabled: true, custom: false, availability: 'richtext' }
		]);

		const merged = mergeBuiltinDefaults( actions );

		expect( merged.length ).toBeGreaterThan( 1 );
		expect( merged.some( ( action ) => 'summarize' === action.id ) ).toBe( true );
	});

	it( 'reads canonical toolbar actions from settings', () => {
		const getOption = ( key: string ) => {
			if ( AI_TOOLBAR_ACTIONS_OPTION === key ) {
				return [{ id: 'rewrite', title: 'Rewrite', prompt: 'Rewrite', enabled: true, custom: false, availability: 'richtext' }];
			}

			return [];
		};

		expect( getToolbarActionsFromSettings( getOption ) ).toHaveLength( 1 );
	});

	it( 'keeps block magic tags when resolving the tone in tone prompts', () => {
		const toneAction = normalizeToolbarAction({
			id: 'tone',
			title: 'Change Tone',
			prompt: 'Rewrite this block in a {tone} tone:\n\n{block_content}',
			enabled: true,
			custom: false,
			availability: 'richtext',
			type: 'tone'
		}, 0 );

		const prompt = getActionPrompt( toneAction, 'Professional' );

		expect( prompt ).toContain( 'Professional' );
		expect( prompt ).not.toContain( '{tone}' );
		expect( prompt ).toContain( '{block_content}' );
	});

	it( 'returns the raw template when no tone is selected', () => {
		const toneAction = normalizeToolbarAction({
			id: 'tone',
			title: 'Change Tone',
			prompt: 'Rewrite this block in a {tone} tone:\n\n{block_content}',
			enabled: true,
			custom: false,
			availability: 'richtext',
			type: 'tone'
		}, 0 );

		expect( getActionPrompt( toneAction ) ).toBe( toneAction.prompt );
	});

	it( 'generates unique ids for custom actions', () => {
		const first = createCustomAction();
		const second = createCustomAction();

		expect( first.id ).not.toBe( second.id );
		expect( first.id.startsWith( 'custom-' ) ).toBe( true );
	});

	it( 'avoids id collisions when normalizing actions without ids', () => {
		const actions = normalizeToolbarActions([
			{ id: 'custom-1', title: 'Saved', prompt: 'Saved', enabled: true, custom: true, availability: 'richtext' },
			{ title: 'No Id A', prompt: 'A' },
			{ title: 'No Id B', prompt: 'B' }
		]);

		const ids = actions.map( ( action ) => action.id );

		expect( new Set( ids ).size ).toBe( ids.length );
		expect( ids ).toContain( 'custom-1' );
	});

	it( 'ships translate as a tone-style language picker', () => {
		const translate = DEFAULT_BUILTIN_ACTIONS.find( ( action ) => 'translate' === action.id );

		expect( translate ).toBeDefined();
		expect( translate?.type ).toBe( 'tone' );
		expect( translate?.prompt ).toBe( 'Translate this block into {tone}:\n\n{block_content}' );
		expect( translate?.tones ).toEqual([ 'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Romanian' ]);
	});

	it( 'replaces magic tags in prompts', () => {
		const prompt = replaceMagicTags(
			'Rewrite in a {tone} tone for {block_type}:\n\n{block_content}\n\n{block_markup}',
			{
				blockContent: 'Hello world',
				blockMarkup: '<p>Hello world</p>',
				blockAttributes: '{ "paragraph-1": { "type": "core/paragraph" } }',
				blockType: 'paragraph',
				tone: 'Professional'
			}
		);

		expect( prompt ).toContain( 'Professional' );
		expect( prompt ).toContain( 'paragraph' );
		expect( prompt ).toContain( 'Hello world' );
		expect( prompt ).toContain( '<p>Hello world</p>' );
		expect( prompt ).toContain( 'Block schema:' );
	});

	it( 'appends attribute definitions to {block_markup}', () => {
		const markup = '<!-- wp:themeisle-blocks/form -->';
		const attrDefs = '{ "form-1": { "type": "themeisle-blocks/form" } }';

		const prompt = replaceMagicTags(
			'Rebuild:\n\n{block_markup}',
			{
				blockContent: '',
				blockMarkup: markup,
				blockAttributes: attrDefs
			}
		);

		expect( prompt ).toContain( markup );
		expect( prompt ).toContain( 'Block schema:' );
		expect( prompt ).toContain( attrDefs );
		expect( prompt ).not.toContain( 'WordPress Gutenberg block comment syntax' );
	});

	it( 'resolves {block_content} to markup bundle for structural blocks', () => {
		const formMarkup = '<!-- wp:themeisle-blocks/form -->';
		const attrDefs = '{ "themeisle-blocks/form-input": { "label": { "type": "string" } } }';

		const prompt = replaceMagicTags(
			'Improve this form:\n\n{block_content}',
			{
				blockContent: '',
				blockMarkup: formMarkup,
				blockAttributes: attrDefs
			}
		);

		expect( prompt ).toContain( formMarkup );
		expect( prompt ).toContain( 'Block schema:' );
		expect( prompt ).toContain( attrDefs );
		expect( prompt ).toContain( 'WordPress Gutenberg block comment syntax' );
	});

	it( 'keeps {block_content} as plain text for richtext blocks', () => {
		const prompt = replaceMagicTags(
			'Rewrite:\n\n{block_content}',
			{
				blockContent: 'Hello world',
				blockMarkup: '<!-- wp:paragraph --><p>Hello world</p><!-- /wp:paragraph -->',
				blockAttributes: '{ "core/paragraph": { "content": { "type": "string" } } }'
			}
		);

		expect( prompt ).toBe( 'Rewrite:\n\nHello world' );
	});

	it( 'resolves {block_attributes} independently from {block_content}', () => {
		const attrDefs = '{ "themeisle-blocks/form": { "id": { "type": "string" } } }';

		const prompt = replaceMagicTags(
			'Attributes:\n{block_attributes}',
			{
				blockContent: '',
				blockAttributes: attrDefs
			}
		);

		expect( prompt ).toBe( `Attributes:\n${ attrDefs }` );
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

describe( 'resolveBlockMarkupForPrompt', () => {
	it( 'returns markup with attribute definitions', () => {
		const markup = '<!-- wp:themeisle-blocks/form -->';
		const attrs = '{ "form-1": { "type": "themeisle-blocks/form" } }';

		const resolved = resolveBlockMarkupForPrompt({
			blockMarkup: markup,
			blockAttributes: attrs
		});

		expect( resolved ).toContain( markup );
		expect( resolved ).toContain( 'Block schema:' );
		expect( resolved ).toContain( attrs );
	});
});

describe( 'resolveBlockContentForPrompt', () => {
	it( 'returns richtext content without markup or definitions', () => {
		const resolved = resolveBlockContentForPrompt({
			blockContent: 'Hello world',
			blockMarkup: '<!-- wp:paragraph --><p>Hello world</p><!-- /wp:paragraph -->',
			blockAttributes: '{ "core/paragraph": {} }'
		});

		expect( resolved ).toBe( 'Hello world' );
	});

	it( 'returns markup bundle when richtext content is empty', () => {
		const markup = '<!-- wp:themeisle-blocks/form -->';
		const attrs = '{ "themeisle-blocks/form-input": { "label": { "type": "string" } } }';

		const resolved = resolveBlockContentForPrompt({
			blockContent: '',
			blockMarkup: markup,
			blockAttributes: attrs
		});

		expect( resolved ).toContain( markup );
		expect( resolved ).toContain( 'Block schema:' );
		expect( resolved ).toContain( attrs );
		expect( resolved ).toContain( 'WordPress Gutenberg block comment syntax' );
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
