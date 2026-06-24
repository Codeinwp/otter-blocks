/**
 * Internal dependencies.
 */
import {
	appendAgentContextEntry,
	buildContextEntryFromPayload,
	emptyAgentContext,
	type AgentContextEntry,
	type AgentContextPayload,
	type AgentSessionContext
} from '../agent-context';
import { buildBlockContextMessage } from '../apply-content';
import { adaptPatternToTask } from '../block-generation';
import { hasStructureEdits } from '../structure-edits';
import { executeToolCall, planToolCall } from '../operations';
import type { AdaptPatternToolArgs, PatchToolArgs } from '../operations';
import {
	captureRemovedBlockSnapshots,
	summarizeToolOperation
} from '../session-memory';
import { runEditTurn } from './run-edit';
import { runGenerateTurn } from './run-generate';
import { runStructureEditTurn } from './run-structure-edit';
import type { RunTurnArgs, RunTurnResult } from './types';

const hasPatchArgs = ( args: PatchToolArgs ): boolean => {
	return Boolean( args.patches?.length );
};

const executeCtx = ( args: RunTurnArgs ) => ({
	baseBlocks: args.referenceBlocks,
	getBlockType: args.getBlockType,
	blockTypes: args.blockTypes,
	sessionMemory: args.sessionMemory,
	patterns: args.patterns
});

const nextContextStep = ( args: RunTurnArgs ): number => ( args.sessionMemory?.length ?? 0 ) + 1;

const stashSearchContext = (
	args: RunTurnArgs,
	agentContext: AgentSessionContext,
	contextPayload?: AgentContextPayload
): { agentContext: AgentSessionContext; contextEntry?: AgentContextEntry } => {
	if ( ! contextPayload ) {
		return { agentContext };
	}

	const contextEntry: AgentContextEntry = buildContextEntryFromPayload(
		nextContextStep( args ),
		contextPayload
	);

	return {
		agentContext: appendAgentContextEntry( agentContext, contextEntry ),
		contextEntry
	};
};

const replanAfterSearch = async(
	args: RunTurnArgs,
	agentContext: AgentSessionContext,
	searchResult: ReturnType<typeof executeToolCall>
) => {
	const stash = stashSearchContext( args, agentContext, searchResult?.contextPayload );

	return {
		...await planToolCall({ ...args, agentContext: stash.agentContext }),
		agentContext: stash.agentContext,
		contextEntry: stash.contextEntry
	};
};

/**
 * Run one user turn: AI tool call → optional search replan → local execution.
 */
export const runAgentTurn = async( args: RunTurnArgs ): Promise<RunTurnResult> => {
	let agentContext = args.agentContext ?? emptyAgentContext();
	let contextEntry: AgentContextEntry | undefined;

	let { toolCall, decision } = await planToolCall({ ...args, agentContext });

	if ( 'search_blocks' === toolCall.tool ) {
		const searchResult = executeToolCall( toolCall, executeCtx( args ) );
		const replan = await replanAfterSearch( args, agentContext, searchResult );

		agentContext = replan.agentContext;
		contextEntry = replan.contextEntry ?? contextEntry;
		toolCall = replan.toolCall;
		decision = replan.decision;
	}

	if ( 'search_history' === toolCall.tool ) {
		const searchResult = executeToolCall( toolCall, executeCtx( args ) );
		const replan = await replanAfterSearch( args, agentContext, searchResult );

		agentContext = replan.agentContext;
		contextEntry = replan.contextEntry ?? contextEntry;
		toolCall = replan.toolCall;
		decision = replan.decision;
	}

	if ( 'search_patterns' === toolCall.tool ) {
		const searchResult = executeToolCall( toolCall, executeCtx( args ) );
		const replan = await replanAfterSearch( args, agentContext, searchResult );

		agentContext = replan.agentContext;
		contextEntry = replan.contextEntry ?? contextEntry;
		toolCall = replan.toolCall;
		decision = replan.decision;
	}

	let removedBlocks: RunTurnResult['removedBlocks'];

	if ( 'structure' === toolCall.tool && 'remove' in toolCall.args && toolCall.args.remove?.length ) {
		removedBlocks = captureRemovedBlockSnapshots( args.referenceBlocks, toolCall.args.remove );
	}

	if ( 'adapt_pattern' === toolCall.tool ) {
		const patternArgs = toolCall.args as AdaptPatternToolArgs;
		const generation = await adaptPatternToTask({
			patternName: patternArgs.patternName,
			task: args.activePrompt,
			patterns: args.patterns || [],
			blockTypes: args.blockTypes,
			themeColors: args.themeColors,
			requestCompletion: args.requestCompletion,
			onPhase: ( phase ) => args.onPhase?.( phase )
		});

		return {
			generation,
			decision,
			toolCall,
			removedBlocks,
			contextEntry,
			agentContext
		};
	}

	if ( 'generate' === toolCall.tool ) {
		const generation = await runGenerateTurn({
			activePrompt: args.activePrompt,
			referenceBlocks: args.referenceBlocks,
			sessionHistory: args.sessionHistory,
			blockTypes: args.blockTypes,
			themeColors: args.themeColors,
			patterns: args.patterns,
			isCreateMode: args.isCreateMode,
			scope: args.scope,
			getBlockType: args.getBlockType,
			requestCompletion: args.requestCompletion,
			onPhase: args.onPhase,
			onPlanReady: args.onPlanReady,
			onRootComplete: args.onRootComplete
		});

		return {
			generation,
			decision,
			toolCall,
			removedBlocks,
			contextEntry,
			agentContext
		};
	}

	const executed = executeToolCall( toolCall, executeCtx( args ) );

	if ( executed ) {
		return {
			generation: executed,
			decision,
			toolCall,
			removedBlocks,
			contextEntry,
			agentContext
		};
	}

	// Heuristic fallback when the tool was chosen but args were not parseable.
	if ( 'patch' === toolCall.tool && ! hasPatchArgs( toolCall.args as PatchToolArgs ) ) {
		args.onPhase?.( 'refining' );

		const generation = await runEditTurn({
			instruction: args.instruction,
			activePrompt: args.activePrompt,
			baseBlocks: args.referenceBlocks,
			sessionHistory: args.sessionHistory,
			blockTypes: args.blockTypes,
			themeColors: args.themeColors,
			getBlockType: args.getBlockType,
			referenceContext: buildBlockContextMessage( args.referenceBlocks, args.getBlockType ),
			requestCompletion: args.requestCompletion,
			onPhase: args.onPhase
		});

		return {
			generation,
			decision,
			toolCall,
			removedBlocks,
			contextEntry,
			agentContext
		};
	}

	if ( 'structure' === toolCall.tool && ! hasStructureEdits( toolCall.args ) ) {
		const generation = await runStructureEditTurn({
			instruction: args.instruction,
			activePrompt: args.activePrompt,
			baseBlocks: args.referenceBlocks,
			sessionHistory: args.sessionHistory,
			blockTypes: args.blockTypes,
			themeColors: args.themeColors,
			getBlockType: args.getBlockType,
			referenceContext: buildBlockContextMessage( args.referenceBlocks, args.getBlockType ),
			requestCompletion: args.requestCompletion,
			onPhase: args.onPhase
		});

		return {
			generation,
			decision,
			toolCall,
			removedBlocks,
			contextEntry,
			agentContext
		};
	}

	return {
		generation: {
			blocks: args.referenceBlocks,
			plan: { mission: '', design: {}, rationale: [], roots: [] },
			rationale: [],
			diagnostics: { droppedRoots: [] }
		},
		decision,
		toolCall,
		removedBlocks,
		contextEntry,
		agentContext
	};
};

/** Build operation log for modal session storage. */
export const buildSessionOperationFromTool = ( toolCall: RunTurnResult['toolCall'] ) => {
	return summarizeToolOperation( toolCall.tool, toolCall.args );
};

export const getTrackingFeatureValue = (
	decision: RunTurnResult['decision'],
	refineInstruction?: string,
	hasGeneratedResult?: boolean
): string => {
	const prefix = 'model' === decision.source ? 'tool' : 'tool-fallback';

	if ( 'history' === decision.route ) {
		return `${ prefix }:search_history`;
	}

	if ( 'pattern' === decision.route ) {
		return `${ prefix }:pattern`;
	}

	if ( 'list' === decision.route ) {
		return `${ prefix }:list`;
	}

	if ( 'structure' === decision.route ) {
		return `${ prefix }:structure`;
	}

	if ( 'patch' === decision.route ) {
		const action = refineInstruction || hasGeneratedResult ? 'refine' : 'edit';
		return `${ prefix }:${ action }:patch`;
	}

	return `${ prefix }:generate`;
};
