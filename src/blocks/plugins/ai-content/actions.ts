/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import { isRichTextBlock, resolveBlockContentForPrompt, resolveBlockMarkupForPrompt } from './apply-content';

export { isRichTextBlock };

export type AIToolbarAction = {
	id: string;
	title: string;
	prompt: string;
	enabled: boolean;
	custom: boolean;
	availability: 'richtext' | 'any';
	type?: 'prompt' | 'tone';
	tones?: string[];
};

export const AI_TOOLBAR_ACTIONS_OPTION = 'themeisle_blocks_settings_ai_toolbar_actions';
export const LEGACY_TOOLBAR_ACTIONS_OPTION = 'themeisle_blocks_settings_prompt_actions';
export const MAX_CUSTOM_TOOLBAR_ACTIONS = 5;

export const DEFAULT_TONE_OPTIONS = [
	__( 'Professional', 'otter-blocks' ),
	__( 'Casual', 'otter-blocks' ),
	__( 'Friendly', 'otter-blocks' ),
	__( 'Confident', 'otter-blocks' ),
	__( 'Formal', 'otter-blocks' ),
	__( 'Empathetic', 'otter-blocks' )
];

export const TRANSLATE_LANGUAGE_OPTIONS = [
	__( 'English', 'otter-blocks' ),
	__( 'Spanish', 'otter-blocks' ),
	__( 'French', 'otter-blocks' ),
	__( 'German', 'otter-blocks' ),
	__( 'Italian', 'otter-blocks' ),
	__( 'Portuguese', 'otter-blocks' ),
	__( 'Romanian', 'otter-blocks' )
];

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
 * The default prompt templates intentionally keep the new lines so the block
 * content is separated from the instruction. They must stay in sync with the
 * server-side defaults.
 */
/* eslint-disable @wordpress/i18n-no-collapsible-whitespace */
export const DEFAULT_BUILTIN_ACTIONS: AIToolbarAction[] = [
	{
		id: 'rewrite',
		title: __( 'Rewrite', 'otter-blocks' ),
		prompt: __( 'Rewrite this block for clarity and flow:\n\n{block_content}', 'otter-blocks' ),
		enabled: true,
		custom: false,
		availability: 'richtext',
		type: 'prompt'
	},
	{
		id: 'summarize',
		title: __( 'Summarize', 'otter-blocks' ),
		prompt: __( 'Summarize this block concisely:\n\n{block_content}', 'otter-blocks' ),
		enabled: true,
		custom: false,
		availability: 'richtext',
		type: 'prompt'
	},
	{
		id: 'expand',
		title: __( 'Expand', 'otter-blocks' ),
		prompt: __( 'Expand this block with useful supporting detail:\n\n{block_content}', 'otter-blocks' ),
		enabled: true,
		custom: false,
		availability: 'richtext',
		type: 'prompt'
	},
	{
		id: 'shorten',
		title: __( 'Shorten', 'otter-blocks' ),
		prompt: __( 'Make this block shorter while preserving the key meaning:\n\n{block_content}', 'otter-blocks' ),
		enabled: true,
		custom: false,
		availability: 'richtext',
		type: 'prompt'
	},
	{
		id: 'translate',
		title: __( 'Translate', 'otter-blocks' ),
		prompt: __( 'Translate this block into {tone}:\n\n{block_content}', 'otter-blocks' ),
		enabled: true,
		custom: false,
		availability: 'richtext',
		type: 'tone',
		tones: TRANSLATE_LANGUAGE_OPTIONS
	},
	{
		id: 'tone',
		title: __( 'Change Tone', 'otter-blocks' ),
		prompt: __( 'Rewrite this block in a {tone} tone:\n\n{block_content}', 'otter-blocks' ),
		enabled: true,
		custom: false,
		availability: 'richtext',
		type: 'tone',
		tones: DEFAULT_TONE_OPTIONS
	},
	{
		id: 'grammar',
		title: __( 'Fix Grammar', 'otter-blocks' ),
		prompt: __( 'Correct spelling and grammar mistakes in this block while keeping the original tone:\n\n{block_content}', 'otter-blocks' ),
		enabled: true,
		custom: false,
		availability: 'richtext',
		type: 'prompt'
	},
	{
		id: 'simplify',
		title: __( 'Simplify', 'otter-blocks' ),
		prompt: __( 'Simplify this block so it is easier to read:\n\n{block_content}', 'otter-blocks' ),
		enabled: true,
		custom: false,
		availability: 'richtext',
		type: 'prompt'
	}
];
/* eslint-enable @wordpress/i18n-no-collapsible-whitespace */

export const RICHTEXT_BLOCKS = [
	'core/paragraph',
	'core/heading'
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

		// eslint-disable-next-line @wordpress/i18n-no-collapsible-whitespace
		prompt: __( 'Transform the following content:\n\n{block_content}', 'otter-blocks' ),
		enabled: true,
		custom: true,
		availability: 'richtext',
		type: 'prompt'
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
		custom: action?.custom ?? ! KNOWN_ACTION_IDS.includes( id ),
		availability: 'any' === action?.availability ? 'any' : 'richtext',
		type: 'tone' === action?.type ? 'tone' : 'prompt',
		tones: action?.tones?.length ? action.tones : ( 'tone' === action?.type ? DEFAULT_TONE_OPTIONS : undefined )
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

export const filterToolbarActionsForBlocks = (
	actions: AIToolbarAction[],
	blockNames: string[]
): AIToolbarAction[] => {
	const allRichText = blockNames.every( isRichTextBlock );
	const allNonRichText = blockNames.every( ( name ) => ! isRichTextBlock( name ) );

	return actions.filter( ( action ) => {
		if ( ! action.enabled ) {
			return false;
		}

		if ( allRichText ) {
			return 'richtext' === action.availability;
		}

		if ( allNonRichText ) {
			return 'any' === action.availability;
		}

		return false;
	});
};

export type MagicTagContext = {
	blockContent: string;
	blockMarkup?: string;
	blockAttributes?: string;
	blockType?: string;
	tone?: string;
};

export const replaceMagicTags = ( template: string, context: MagicTagContext ): string => {
	if ( ! template ) {
		return resolveBlockContentForPrompt( context );
	}

	let result = template;

	result = result.replace( /\{text_input\}/gi, () => context.blockContent || '' );
	result = result.replace( /\{block_content\}/gi, () => resolveBlockContentForPrompt( context ) );
	result = result.replace( /\{block_markup\}/gi, () => resolveBlockMarkupForPrompt( context ) );
	result = result.replace( /\{block_attributes\}/gi, () => context.blockAttributes || '' );
	result = result.replace( /\{block_type\}/gi, () => context.blockType || '' );
	result = result.replace( /\{tone\}/gi, () => context.tone || '' );

	return result;
};

export const getActionPrompt = ( action: AIToolbarAction, tone?: string | null ): string => {
	if ( 'tone' === action.type && tone ) {

		// Only resolve the tone here. The block related magic tags must survive
		// until the prompt is fully resolved at generation time.
		return action.prompt.replace( /\{tone\}/gi, () => tone );
	}

	return action.prompt;
};
