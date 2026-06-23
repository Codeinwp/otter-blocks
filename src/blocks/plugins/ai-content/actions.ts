/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import { isRichTextBlock } from './apply-content';

export { isRichTextBlock };

/**
 * A quick-start action shown as a chip in the section modal. Actions are plain
 * prompts: the modal attaches the selected block(s) markup + schema as context
 * automatically, so there are no magic tags, tone pills, or availability scopes.
 */
export type AIToolbarAction = {
	id: string;
	title: string;
	prompt: string;
	enabled: boolean;
	custom: boolean;
};

export const AI_TOOLBAR_ACTIONS_OPTION = 'themeisle_blocks_settings_ai_toolbar_actions';
export const LEGACY_TOOLBAR_ACTIONS_OPTION = 'themeisle_blocks_settings_prompt_actions';
export const MAX_CUSTOM_TOOLBAR_ACTIONS = 5;

export const KNOWN_ACTION_IDS = [
	'rewrite',
	'summarize',
	'expand',
	'shorten',
	'translate',
	'tone',
	'grammar',
	'simplify'
];

/*
 * Built-in quick-start prompts. They are plain instructions: the modal sends the
 * selected block markup + schema as context, so the prompt only has to describe
 * the change. Clicking a chip seeds the refine/generate bar.
 */
export const DEFAULT_BUILTIN_ACTIONS: AIToolbarAction[] = [
	{
		id: 'rewrite',
		title: __( 'Rewrite', 'otter-blocks' ),
		prompt: __( 'Rewrite this for clarity and flow.', 'otter-blocks' ),
		enabled: true,
		custom: false
	},
	{
		id: 'summarize',
		title: __( 'Summarize', 'otter-blocks' ),
		prompt: __( 'Summarize this concisely.', 'otter-blocks' ),
		enabled: true,
		custom: false
	},
	{
		id: 'expand',
		title: __( 'Expand', 'otter-blocks' ),
		prompt: __( 'Expand this with useful supporting detail.', 'otter-blocks' ),
		enabled: true,
		custom: false
	},
	{
		id: 'shorten',
		title: __( 'Shorten', 'otter-blocks' ),
		prompt: __( 'Make this shorter while preserving the key meaning.', 'otter-blocks' ),
		enabled: true,
		custom: false
	},
	{
		id: 'translate',
		title: __( 'Translate', 'otter-blocks' ),
		prompt: __( 'Translate this into English.', 'otter-blocks' ),
		enabled: true,
		custom: false
	},
	{
		id: 'tone',
		title: __( 'Change Tone', 'otter-blocks' ),
		prompt: __( 'Rewrite this in a more professional tone.', 'otter-blocks' ),
		enabled: true,
		custom: false
	},
	{
		id: 'grammar',
		title: __( 'Fix Grammar', 'otter-blocks' ),
		prompt: __( 'Fix any spelling and grammar mistakes, keeping the original tone.', 'otter-blocks' ),
		enabled: true,
		custom: false
	},
	{
		id: 'simplify',
		title: __( 'Simplify', 'otter-blocks' ),
		prompt: __( 'Simplify this so it is easier to read.', 'otter-blocks' ),
		enabled: true,
		custom: false
	}
];

type SettingsReader = ( key: string ) => unknown;

export const getToolbarActionsFromSettings = ( getOption: SettingsReader ): Partial<AIToolbarAction>[] => {
	const canonical = getOption( AI_TOOLBAR_ACTIONS_OPTION );

	if ( Array.isArray( canonical ) && 0 < canonical.length ) {
		return canonical as Partial<AIToolbarAction>[];
	}

	const legacy = getOption( LEGACY_TOOLBAR_ACTIONS_OPTION );

	if ( Array.isArray( legacy ) && 0 < legacy.length ) {
		return legacy as Partial<AIToolbarAction>[];
	}

	return DEFAULT_BUILTIN_ACTIONS;
};

export const countCustomActions = ( actions: AIToolbarAction[] ): number => {
	return actions.filter( ( action ) => action.custom ).length;
};

const generateCustomActionId = (): string => {
	const uuid = window.crypto?.randomUUID?.();

	if ( uuid ) {
		return `custom-${ uuid }`;
	}

	return `custom-${ Date.now() }-${ Math.random().toString( 36 ).slice( 2, 10 ) }`;
};

export const createCustomAction = (): AIToolbarAction => {
	return {
		id: generateCustomActionId(),
		title: __( 'Custom Action', 'otter-blocks' ),
		prompt: __( 'Transform the selected content.', 'otter-blocks' ),
		enabled: true,
		custom: true
	};
};

export const mergeBuiltinDefaults = ( actions: AIToolbarAction[] ): AIToolbarAction[] => {
	const existingIds = new Set( actions.map( ( action ) => action.id ) );
	const missing = DEFAULT_BUILTIN_ACTIONS.filter( ( action ) => ! existingIds.has( action.id ) );

	if ( ! missing.length ) {
		return actions;
	}

	return [ ...actions, ...missing ];
};

export const hasMissingBuiltinActions = ( actions: AIToolbarAction[] ): boolean => {
	const existingIds = new Set( actions.map( ( action ) => action.id ) );

	return DEFAULT_BUILTIN_ACTIONS.some( ( action ) => ! existingIds.has( action.id ) );
};

export const normalizeToolbarAction = ( action: Partial<AIToolbarAction>, index: number, usedIds?: Set<string> ): AIToolbarAction => {
	let id = action?.id || `custom-${ index }`;

	if ( ! action?.id && usedIds ) {
		let suffix = 0;

		while ( usedIds.has( id ) ) {
			suffix++;
			id = `custom-${ index }-${ suffix }`;
		}
	}

	usedIds?.add( id );

	return {
		id,
		title: action?.title || '',
		prompt: action?.prompt || '',
		enabled: false !== action?.enabled,
		custom: action?.custom ?? ! KNOWN_ACTION_IDS.includes( id )
	};
};

export const normalizeToolbarActions = ( actions: Partial<AIToolbarAction>[] = [] ): AIToolbarAction[] => {
	const usedIds = new Set<string>(
		actions
			.map( ( action ) => action?.id )
			.filter( ( id ): id is string => Boolean( id ) )
	);

	return actions.map( ( action, index ) => normalizeToolbarAction( action, index, usedIds ) );
};

/**
 * The enabled actions, shown as quick-start chips in the section modal.
 *
 * @param actions The normalized toolbar actions.
 * @return        The enabled actions.
 */
export const getEnabledActions = (
	actions: AIToolbarAction[]
): AIToolbarAction[] => {
	return actions.filter( ( action ) => action.enabled );
};
