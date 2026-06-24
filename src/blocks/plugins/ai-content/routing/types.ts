export type GenerationRoute = 'patch' | 'structure' | 'list' | 'history' | 'pattern' | 'full';
export type AgentMode = 'edit' | 'structure' | 'generate';
export type RouteSource = 'model' | 'heuristic';

export type ClassifyGenerationIntentArgs = {
	instruction: string;
	taskContext?: string;
	hasReferenceBlocks: boolean;
	isCreateMode: boolean;
	isExplicitRefine: boolean;
};

export type ResolveGenerationRouteArgs = ClassifyGenerationIntentArgs & {
	sessionHistory?: string[];
	requestCompletion?: ( prompt: string ) => Promise<string>;
	/** When set, skip routing and use this mode (toolbar quick actions, etc.). */
	forceRoute?: AgentMode;
	/** Transform-mode hint: prefer patch unless the user clearly wants a redesign. */
	preferEdit?: boolean;
};

export type RouteDecision = {
	mode: AgentMode;
	route: GenerationRoute;
	source: RouteSource;
};

export const agentModeToRoute = ( mode: AgentMode ): GenerationRoute => {
	if ( 'generate' === mode ) {
		return 'full';
	}

	if ( 'structure' === mode ) {
		return 'structure';
	}

	return 'patch';
};

export const routeToAgentMode = ( route: GenerationRoute ): AgentMode => {
	if ( 'full' === route ) {
		return 'generate';
	}

	if ( 'structure' === route ) {
		return 'structure';
	}

	if ( 'list' === route ) {
		return 'edit';
	}

	if ( 'history' === route ) {
		return 'edit';
	}

	if ( 'pattern' === route ) {
		return 'edit';
	}

	return 'edit';
};

/** Routes that mutate blocks locally without the full generate pipeline. */
export const LOCAL_ROUTES: GenerationRoute[] = [ 'patch', 'structure' ];
