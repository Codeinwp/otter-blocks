import { classifyGenerationIntent } from '../routing/heuristics';
import type { RouteDecision } from '../routing/types';
import { routeToAgentMode } from '../routing/types';
import type { RunTurnArgs } from '../agent/types';
import type { AgentToolCall } from './types';
import { toolToRoute } from './types';
import { buildToolCallPrompt } from './prompt';
import { parseToolCall } from './parse';

export type PlanToolCallResult = {
	toolCall: AgentToolCall;
	decision: RouteDecision;
};

const toDecision = ( toolCall: AgentToolCall, source: RouteDecision['source'] ): RouteDecision => ({
	mode: routeToAgentMode( toolToRoute( toolCall.tool ) ),
	route: toolToRoute( toolCall.tool ),
	source
});

const heuristicToolFromRoute = (
	args: Pick<
		RunTurnArgs,
		| 'instruction'
		| 'activePrompt'
		| 'referenceBlocks'
		| 'isCreateMode'
		| 'refineInstruction'
		| 'patterns'
	>
): AgentToolCall => {
	const route = classifyGenerationIntent({
		instruction: args.instruction,
		taskContext: args.activePrompt,
		hasReferenceBlocks: 0 < args.referenceBlocks.length,
		isCreateMode: args.isCreateMode,
		isExplicitRefine: Boolean( args.refineInstruction )
	});

	const query = args.instruction?.trim() || args.activePrompt?.trim() || '';
	const hasPatterns = Boolean( args.patterns?.length );

	if ( 'full' === route ) {
		if ( hasPatterns && args.isCreateMode && ! args.refineInstruction ) {
			return {
				tool: 'search_patterns',
				reason: 'Heuristic fallback: pattern-first create.',
				args: { query }
			};
		}

		return { tool: 'generate', reason: 'Heuristic fallback: full generation.', args: {} };
	}

	if ( 'structure' === route ) {
		return { tool: 'structure', reason: 'Heuristic fallback: structure edit (args missing).', args: {} };
	}

	return { tool: 'patch', reason: 'Heuristic fallback: attribute patch (args missing).', args: { patches: [] } };
};

/**
 * Ask the model which tool to call and with what args (single AI turn).
 */
export const planToolCall = async( args: RunTurnArgs ): Promise<PlanToolCallResult> => {
	const hasReferenceBlocks = 0 < args.referenceBlocks.length;
	const preferLocalTools = args.preferEdit || 'edit' === args.forceRoute || 'structure' === args.forceRoute;

	if ( 'generate' === args.forceRoute ) {
		return {
			toolCall: { tool: 'generate', reason: 'Forced generate route.', args: {} },
			decision: toDecision({ tool: 'generate', args: {} }, 'heuristic' )
		};
	}

	args.onPhase?.( 'planning' );

	const response = await args.requestCompletion(
		buildToolCallPrompt({
			instruction: args.instruction,
			taskContext: args.activePrompt,
			referenceBlocks: args.referenceBlocks,
			blockTypes: args.blockTypes,
			themeColors: args.themeColors,
			getBlockType: args.getBlockType,
			hasReferenceBlocks,
			isCreateMode: args.isCreateMode,
			isExplicitRefine: Boolean( args.refineInstruction ),
			preferLocalTools,
			sessionMemory: args.sessionMemory,
			agentContext: args.agentContext,
			patterns: args.patterns
		})
	);

	const parsed = parseToolCall( response );

	if ( parsed ) {
		return {
			toolCall: parsed,
			decision: toDecision( parsed, 'model' )
		};
	}

	const fallback = heuristicToolFromRoute( args );

	return {
		toolCall: fallback,
		decision: toDecision( fallback, 'heuristic' )
	};
};
