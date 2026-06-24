import type { BlockProps } from '../../../helpers/blocks';
import { buildBlockIndex, formatBlockIndexForPrompt } from '../block-index';
import {
	buildCatalogSearchEntries,
	formatBlockSearchResults,
	searchBlocks
} from '../block-search';
import {
	applyPatchesToBlocks,
	attachIds,
	blocksToTrees,
	buildIdToBlockNameMap,
	normalizePatchAttributes
} from '../block-patches';
import {
	jsonTreeToBlocks,
	validateGeneratedBlocks,
	type BlockGenerationResult,
	type GeneratedBlockTree
} from '../block-generation';
import { applyStructureEdits, hasStructureEdits } from '../structure-edits';
import {
	formatHistorySearchResults,
	searchSessionMemory,
	type SessionTurnMemory
} from '../session-memory';
import {
	formatPatternSearchResults,
	searchPatternCatalog
} from '../pattern-search';
import type { PatternLike } from '../block-generation';
import type { BlockTypeLike, GetBlockType } from '../agent/types';
import type {
	AgentToolCall,
	PatchToolArgs,
	SearchBlocksToolArgs,
	SearchHistoryToolArgs,
	SearchPatternsToolArgs,
	StructureToolArgs
} from './types';

const emptyPlan = () => ({
	mission: '',
	design: {},
	rationale: [],
	roots: []
});

type ExecuteContext = {
	baseBlocks: BlockProps<unknown>[];
	getBlockType: GetBlockType;
	blockTypes?: BlockTypeLike[];
	sessionMemory?: SessionTurnMemory[];
	patterns?: PatternLike[];
};

const executePatchTool = (
	toolCall: AgentToolCall & { tool: 'patch'; args: PatchToolArgs },
	ctx: ExecuteContext
): BlockGenerationResult => {
	const { baseBlocks, getBlockType } = ctx;
	const trees = blocksToTrees( baseBlocks );

	if ( ! trees.length ) {
		return { blocks: baseBlocks, plan: emptyPlan(), rationale: [], diagnostics: { droppedRoots: [] } };
	}

	const idTree = attachIds( trees );
	const idToBlockName = buildIdToBlockNameMap( idTree );
	const normalizedPatches = toolCall.args.patches
		.map( ( patch ) => ({
			id: patch.id,
			attributes: normalizePatchAttributes(
				idToBlockName[ patch.id ] || '',
				patch.attributes,
				getBlockType
			)
		}) )
		.filter( ( patch ) => Object.keys( patch.attributes ).length );

	if ( ! normalizedPatches.length ) {
		return { blocks: baseBlocks, plan: emptyPlan(), rationale: [], diagnostics: { droppedRoots: [] } };
	}

	const blocks = applyPatchesToBlocks( baseBlocks, normalizedPatches );
	const validation = validateGeneratedBlocks( blocks, getBlockType, { skipRootParentChecks: true } );

	if ( ! validation.valid ) {
		return {
			blocks: baseBlocks,
			plan: emptyPlan(),
			rationale: [],
			diagnostics: { droppedRoots: [{ root: { name: 'patch', innerBlocks: [] }, errors: validation.errors }] }
		};
	}

	const rationale = toolCall.reason ? [ toolCall.reason ] : [];

	return { blocks, plan: emptyPlan(), rationale, diagnostics: { droppedRoots: [] } };
};

const executeStructureTool = (
	toolCall: AgentToolCall & { tool: 'structure'; args: StructureToolArgs },
	ctx: ExecuteContext
): BlockGenerationResult => {
	const { baseBlocks, getBlockType } = ctx;

	if ( ! hasStructureEdits( toolCall.args ) ) {
		return { blocks: baseBlocks, plan: emptyPlan(), rationale: [], diagnostics: { droppedRoots: [] } };
	}

	const blocks = applyStructureEdits(
		baseBlocks,
		toolCall.args,
		( insertTrees: GeneratedBlockTree[] ) => jsonTreeToBlocks( insertTrees, getBlockType )
	);
	const validation = validateGeneratedBlocks( blocks, getBlockType, { skipRootParentChecks: true } );

	if ( ! validation.valid ) {
		return {
			blocks: baseBlocks,
			plan: emptyPlan(),
			rationale: [],
			diagnostics: { droppedRoots: [{ root: { name: 'structure', innerBlocks: [] }, errors: validation.errors }] }
		};
	}

	const rationale = toolCall.reason ? [ toolCall.reason ] : [];

	return { blocks, plan: emptyPlan(), rationale, diagnostics: { droppedRoots: [] } };
};

const executeListTool = (
	toolCall: AgentToolCall & { tool: 'list' },
	ctx: ExecuteContext
): BlockGenerationResult => {
	const trees = blocksToTrees( ctx.baseBlocks );
	const idTree = attachIds( trees );
	const listing = formatBlockIndexForPrompt( buildBlockIndex( idTree, ctx.getBlockType ) );
	const rationale = [
		...( toolCall.reason ? [ toolCall.reason ] : [] ),
		...( listing ? [ listing ] : [] )
	];

	return {
		blocks: ctx.baseBlocks,
		plan: emptyPlan(),
		rationale,
		diagnostics: { droppedRoots: [] }
	};
};

const executeSearchBlocksTool = (
	toolCall: AgentToolCall & { tool: 'search_blocks'; args: SearchBlocksToolArgs },
	ctx: ExecuteContext
): BlockGenerationResult => {
	const trees = blocksToTrees( ctx.baseBlocks );
	const idTree = attachIds( trees );
	const index = buildBlockIndex( idTree, ctx.getBlockType );
	const catalog = buildCatalogSearchEntries( ctx.blockTypes || [] );
	const results = searchBlocks( index, catalog, toolCall.args );
	const formatted = formatBlockSearchResults( results );
	const rationale = [
		...( toolCall.reason ? [ toolCall.reason ] : [] ),
		formatted
	];

	return {
		blocks: ctx.baseBlocks,
		plan: emptyPlan(),
		rationale,
		diagnostics: { droppedRoots: [] },
		contextPayload: {
			kind: 'block_search',
			query: toolCall.args.query,
			payload: formatted
		}
	};
};

const executeSearchHistoryTool = (
	toolCall: AgentToolCall & { tool: 'search_history'; args: SearchHistoryToolArgs },
	ctx: ExecuteContext
): BlockGenerationResult => {
	const results = searchSessionMemory( ctx.sessionMemory || [], toolCall.args );
	const formatted = formatHistorySearchResults( results );
	const rationale = [
		...( toolCall.reason ? [ toolCall.reason ] : [] ),
		formatted
	];

	return {
		blocks: ctx.baseBlocks,
		plan: emptyPlan(),
		rationale,
		diagnostics: { droppedRoots: [] },
		contextPayload: {
			kind: 'history_search',
			query: toolCall.args.query,
			payload: formatted
		}
	};
};

const executeSearchPatternsTool = (
	toolCall: AgentToolCall & { tool: 'search_patterns'; args: SearchPatternsToolArgs },
	ctx: ExecuteContext
): BlockGenerationResult => {
	const results = searchPatternCatalog( ctx.patterns || [], toolCall.args );
	const formatted = formatPatternSearchResults( results );
	const rationale = [
		...( toolCall.reason ? [ toolCall.reason ] : [] ),
		formatted
	];

	return {
		blocks: ctx.baseBlocks,
		plan: emptyPlan(),
		rationale,
		diagnostics: { droppedRoots: [] },
		contextPayload: {
			kind: 'pattern_search',
			query: toolCall.args.query,
			payload: formatted
		}
	};
};

/**
 * Execute a parsed tool call locally — no further AI calls for read-only tools.
 * Returns null for generate/adapt_pattern (handled in run-turn).
 */
export const executeToolCall = (
	toolCall: AgentToolCall,
	ctx: ExecuteContext
): BlockGenerationResult | null => {
	if ( 'generate' === toolCall.tool || 'adapt_pattern' === toolCall.tool ) {
		return null;
	}

	if ( 'patch' === toolCall.tool ) {
		return executePatchTool( toolCall, ctx );
	}

	if ( 'structure' === toolCall.tool ) {
		return executeStructureTool( toolCall, ctx );
	}

	if ( 'search_blocks' === toolCall.tool ) {
		return executeSearchBlocksTool( toolCall, ctx );
	}

	if ( 'search_history' === toolCall.tool ) {
		return executeSearchHistoryTool( toolCall, ctx );
	}

	if ( 'search_patterns' === toolCall.tool ) {
		return executeSearchPatternsTool( toolCall, ctx );
	}

	return executeListTool( toolCall, ctx );
};
