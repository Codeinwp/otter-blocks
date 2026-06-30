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
	buildBlockContextMessage
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

