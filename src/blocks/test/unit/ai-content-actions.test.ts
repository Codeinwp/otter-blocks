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

	it( 'maps richtext availability to paragraph and heading blocks', () => {
		const actions = normalizeToolbarActions([
			{ id: 'rewrite', title: 'Rewrite', prompt: 'Rewrite', enabled: true, custom: false, availability: 'richtext' },
			{ id: 'custom-table', title: 'Convert to table', prompt: 'Convert', enabled: true, custom: true, availability: 'any' }
		]);

		expect( filterToolbarActionsForBlocks( actions, [ 'core/paragraph' ] ).map( ( action ) => action.id ) ).toEqual([ 'rewrite' ]);
		expect( filterToolbarActionsForBlocks( actions, [ 'core/heading' ] ).map( ( action ) => action.id ) ).toEqual([ 'rewrite' ]);
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
				blockType: 'paragraph',
				tone: 'Professional'
			}
		);

		expect( prompt ).toContain( 'Professional' );
		expect( prompt ).toContain( 'paragraph' );
		expect( prompt ).toContain( 'Hello world' );
		expect( prompt ).toContain( '<p>Hello world</p>' );
	});
});
