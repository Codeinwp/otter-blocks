import { parseJsonResponse } from '../json-utils';
import { buildRoutePrompt } from '../prompts/route';
import { classifyGenerationIntent } from './heuristics';
import type {
	AgentMode,
	GenerationRoute,
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

const toDecision = ( route: GenerationRoute, source: RouteSource ): RouteDecision => ({
	mode: routeToAgentMode( route ),
	route,
	source
});

const resolveWithoutModel = ( args: ResolveGenerationRouteArgs ): RouteDecision => {
	return toDecision( classifyGenerationIntent( args ), 'heuristic' );
};

/**
 * Decide edit (patch) vs generate (full pipeline) using deterministic heuristics.
 * Skips a separate routing model call for speed and simpler UX.
 */
export const resolveGenerationRoute = async(
	args: ResolveGenerationRouteArgs
): Promise<RouteDecision> => {
	if ( args.forceRoute ) {
		return toDecision( agentModeToRoute( args.forceRoute ), 'heuristic' );
	}

	if ( ! args.hasReferenceBlocks ) {
		return toDecision( 'full', 'heuristic' );
	}

	if ( args.isCreateMode && ! args.isExplicitRefine ) {
		return toDecision( 'full', 'heuristic' );
	}

	return resolveWithoutModel( args );
};
