import type { BlockProps } from '../../../helpers/blocks';
import {
	BLOCK_INDEX_PROMPT_LIMIT,
	formatAgentSessionForPrompt
} from '../agent-context';
import type { AgentSessionContext } from '../agent-context';
import { buildBlockIndex, formatBlockIndexForPromptCapped } from '../block-index';
import {
	attachIds,
	blocksToTrees,
	type IdentifiedNode
} from '../block-patches';
import {
	buildFullAttributeSchema,
	type ThemeColor
} from '../block-generation';
import { formatPatternLibraryPreview } from '../pattern-search';
import type { PatternLike } from '../block-generation';
import { PIPELINE_STEP } from '../prompts/phases';
import type { GetBlockType } from '../agent/types';
import type { SessionTurnMemory } from '../session-memory';

type AttributeSchemaEntry = {
	slug: string;
	attributes: string[];
};

const formatSchemaForPrompt = ( schema: AttributeSchemaEntry[] ): string => {
	return schema
		.map( ( entry ) => `${ entry.slug }: ${ entry.attributes.join( ', ' ) }` )
		.join( '\n' );
};

const formatPaletteForPrompt = ( colors: ThemeColor[] ): string => {
	return colors
		.filter( ( color ) => color?.slug && color?.color )
		.map( ( color ) => `${ color.slug } (${ color.color })${ color.name ? ` — ${ color.name }` : '' }` )
		.join( '\n' );
};

const collectSlugsFromTree = (
	tree: { name: string; innerBlocks?: { name: string; innerBlocks?: unknown[] }[] },
	slugs: Set<string>
) => {
	slugs.add( tree.name );
	( tree.innerBlocks || [] ).forEach( ( inner ) => collectSlugsFromTree( inner, slugs ) );
};

export type BuildToolCallPromptArgs = {
	instruction: string;
	taskContext?: string;
	referenceBlocks: BlockProps<unknown>[];
	blockTypes: Parameters<typeof import( '../block-generation' ).buildStructureCatalog>[0];
	themeColors: ThemeColor[];
	getBlockType: GetBlockType;
	hasReferenceBlocks: boolean;
	isCreateMode: boolean;
	isExplicitRefine: boolean;
	preferLocalTools?: boolean;
	sessionMemory?: SessionTurnMemory[];
	agentContext?: AgentSessionContext;
	patterns?: PatternLike[];
};

const TOOL_DEFINITIONS = [
	'Available tools (pick exactly ONE):',
	'',
	'1. patch — change attributes on existing blocks. Never add, remove, or reorder blocks.',
	'   args: { "patches": [ { "id": string, "attributes": object } ] }',
	'   Use block ids from the block index. Return ONLY attributes that change.',
	'',
	'2. structure — add, remove, or move blocks without rebuilding the layout.',
	'   args: { "remove"?: string[], "insert"?: [{ "parentId": string, "index": number, "block": { "name", "attributes", "innerBlocks" } }], "move"?: [{ "id", "parentId", "index" }] }',
	'   Use "" as parentId for root-level siblings. For removals, return ONLY the ids to delete.',
	'',
	'3. list — full block inventory; no changes.',
	'   args: {}',
	'',
	'4. search_blocks — fuzzy search over the layout AND the insertable block catalog.',
	'   args: { "query"?: string, "type"?: string, "scope"?: "layout"|"catalog"|"all" }',
	'   scope "catalog" when adding a new block type; "layout" when targeting existing blocks; default "all".',
	'   After catalog hits, use structure.insert with block.name = slug and attributes from the user request.',
	'',
	'5. search_history — search past turns in this session (undo / restore).',
	'   args: { "query"?: string, "step"?: number }',
	'',
	'6. generate — build or fully redesign a layout (multi-step pipeline).',
	'   args: {}',
	'   Use ONLY for new sections, first-time builds, or explicit full redesigns.'
].join( '\n' );

const ZERO_CANVAS_TOOL_DEFINITIONS = [
	'Available tools (pick exactly ONE):',
	'',
	'★ DEFAULT for general create requests (user describes what they want — hero, pricing, features, CTA, FAQ, etc.):',
	'   Step A → search_patterns with a query from their intent (any language).',
	'   Step B → adapt_pattern with the best patternName from search results — keeps layout, rewrites copy/colors. FAST.',
	'',
	'1. search_patterns — find a library layout close to the request.',
	'   args: { "query"?: string, "category"?: string }',
	'   Use first on create unless gathered facts already list a clear pattern match.',
	'',
	'2. adapt_pattern — ★ PREFERRED finish for single sections and most first builds.',
	'   args: { "patternName": string }',
	'   Pick exact name from pattern preview or gathered facts. One pattern per call.',
	'   After adapt_pattern, follow-ups use patch/structure — not generate.',
	'',
	'3. generate — LAST RESORT only.',
	'   args: {}',
	'   Use when: full multi-section page with gaps no pattern covers, or user explicitly wants a custom layout from scratch.',
	'   Slower than adapt_pattern — avoid when any library pattern is a reasonable fit.'
].join( '\n' );

const hasRecentPatternSearch = ( context?: AgentSessionContext ): boolean => {
	return Boolean(
		context?.entries?.some( ( entry ) => 'pattern_search' === entry.kind )
	);
};

const formatCreateModePatternGuidance = (
	isCreateMode: boolean,
	hasPatterns: boolean,
	isExplicitRefine: boolean
): string[] => {
	if ( ! isCreateMode || ! hasPatterns || isExplicitRefine ) {
		return [];
	}

	return [
		'Create-mode guidance: The user gave a general intent. Strongly prefer search_patterns → adapt_pattern over generate. Library patterns are faster and more reliable than building structure from zero.'
	];
};

const formatPatternAdaptNudge = ( context?: AgentSessionContext ): string[] => {
	if ( ! hasRecentPatternSearch( context ) ) {
		return [];
	}

	return [
		'Next step: Pattern search results are in gathered facts below — call adapt_pattern with the best matching patternName. Only use generate if none of the hits fit.'
	];
};

export const buildToolCallPrompt = ( args: BuildToolCallPromptArgs ): string => {
	const trees = blocksToTrees( args.referenceBlocks );
	const idTree: IdentifiedNode[] = attachIds( trees );
	const indexEntries = buildBlockIndex( idTree, args.getBlockType );
	const blockIndex = formatBlockIndexForPromptCapped( indexEntries, BLOCK_INDEX_PROMPT_LIMIT );
	const slugs = new Set<string>();
	trees.forEach( ( tree ) => collectSlugsFromTree( tree, slugs ) );
	const schema = buildFullAttributeSchema( args.blockTypes, slugs );
	const palette = formatPaletteForPrompt( args.themeColors );
	const rootUsesAtomic = [ ...slugs ].some( ( slug ) => slug.startsWith( 'atomic-wind/' ) );
	const hasPatterns = Boolean( args.patterns?.length );
	const preferPatternAdapt = args.isCreateMode && hasPatterns && ! args.isExplicitRefine;
	const patternPreview = hasPatterns ? formatPatternLibraryPreview( args.patterns || [], 12 ) : '';

	const contextLines = [
		`hasReferenceBlocks: ${ args.hasReferenceBlocks ? 'true' : 'false' }`,
		`isCreateMode: ${ args.isCreateMode ? 'true' : 'false' }`,
		`isFollowUpRefine: ${ args.isExplicitRefine ? 'true' : 'false' }`,
		`preferLocalTools: ${ args.preferLocalTools ? 'true' : 'false' }`,
		`preferPatternAdapt: ${ preferPatternAdapt ? 'true' : 'false' }`
	];

	if ( args.taskContext && args.taskContext !== args.instruction ) {
		contextLines.push( `taskContext: ${ args.taskContext }` );
	}

	const availableTools = args.hasReferenceBlocks
		? TOOL_DEFINITIONS
		: ( hasPatterns ? ZERO_CANVAS_TOOL_DEFINITIONS : [
			'Available tools (pick exactly ONE):',
			'',
			'1. generate — build a new layout from the user request.',
			'   args: {}'
		].join( '\n' ) );

	return [
		PIPELINE_STEP.TOOL_CALL,
		'',
		'You are a tool-calling agent for the WordPress block editor.',
		'Read the user instruction and invoke exactly ONE tool with the minimal args needed.',
		'Never return a full block tree — only the tool name and its args object.',
		'',
		availableTools,
		'',
		'Return strict JSON: { "tool": string, "reason": string, "args": object }',
		'',
		'Rules:',
		'- Remove/delete/hide a block → structure with args.remove ids only.',
		'- Change text, color, font, spacing, or copy → patch.',
		'- Add/insert/move/reorder blocks → structure (search_blocks catalog first when the block type is unclear).',
		'- Undo / restore → search_history, then structure.insert with removedBlocks from session.',
		'- Full inventory → list. Find blocks → search_blocks.',
		...( preferPatternAdapt ? [
			'- CREATE + general intent → search_patterns first, then adapt_pattern (not generate).',
			'- CREATE + gathered pattern hits → adapt_pattern with exact patternName.',
			'- generate only when no pattern fits or user needs a full custom multi-section page.'
		] : [
			'- New layout or first build → generate when no patterns; with patterns → search_patterns then adapt_pattern.'
		] ),
		'',
		...formatCreateModePatternGuidance( args.isCreateMode, hasPatterns, args.isExplicitRefine ),
		...formatPatternAdaptNudge( args.agentContext ),
		'',
		'Context:',
		...contextLines,
		...formatAgentSessionForPrompt({
			memory: args.sessionMemory,
			context: args.agentContext
		}),
		...( patternPreview ? [ patternPreview ] : [] ),
		...( blockIndex ? [ blockIndex ] : [] ),
		...( palette ? [ `Theme color palette:\n${ palette }` ] : [] ),
		...( rootUsesAtomic ? [ 'Atomic Wind primitives (atomic-wind/box, text, icon, link) are available.' ] : [] ),
		...( schema.length ? [
			'Settable attributes (blocks in layout only):',
			formatSchemaForPrompt( schema )
		] : [] ),
		'',
		`User instruction: ${ args.instruction }`
	].join( '\n' );
};
