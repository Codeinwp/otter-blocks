import { parseJsonResponse } from '../json-utils';
import { buildRoutePrompt } from '../prompts/route';
import { classifyGenerationIntent } from './heuristics';
import type {
	AgentMode,
	ResolveGenerationRouteArgs,
	RouteDecision,
	RouteSource
} from './types';
import { agentModeToRoute, routeToAgentMode } from './types';

export { buildRoutePrompt };

export const parseRouteResponse = ( response: string ): AgentMode | null => {
	const parsed = parseJsonResponse( response );
	const mode = parsed?.mode;

	if ( 'edit' === mode || 'generate' === mode ) {
		return mode;
	}

	return null;
};

const toDecision = ( mode: AgentMode, source: RouteSource ): RouteDecision => ({
	mode,
	route: agentModeToRoute( mode ),
	source
});

const resolveWithoutModel = ( args: ResolveGenerationRouteArgs ): RouteDecision => {
	const route = classifyGenerationIntent( args );
	return toDecision( routeToAgentMode( route ), 'heuristic' );
};

/**
 * Decide edit (patch) vs generate (full pipeline). Uses a small model call when
 * possible, with deterministic shortcuts and regex fallback for stability.
 */
export const resolveGenerationRoute = async(
	args: ResolveGenerationRouteArgs
): Promise<RouteDecision> => {
	if ( args.forceRoute ) {
		return toDecision( args.forceRoute, 'heuristic' );
	}

	if ( ! args.hasReferenceBlocks ) {
		return toDecision( 'generate', 'heuristic' );
	}

	if ( args.isCreateMode && ! args.isExplicitRefine ) {
		return toDecision( 'generate', 'heuristic' );
	}

	if ( ! args.requestCompletion ) {
		return resolveWithoutModel( args );
	}

	try {
		const response = await args.requestCompletion( buildRoutePrompt( args ) );
		const mode = parseRouteResponse( response );

		if ( mode ) {
			if ( 'generate' === mode && args.preferEdit ) {
				const heuristicRoute = classifyGenerationIntent( args );

				if ( 'patch' === heuristicRoute ) {
					return toDecision( 'edit', 'heuristic' );
				}
			}

			return toDecision( mode, 'model' );
		}
	} catch {
		// Fall through to heuristics.
	}

	return resolveWithoutModel( args );
};
