export type GenerationRoute = 'patch' | 'structure' | 'full';
export type AgentMode = 'edit' | 'generate';
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
	return 'generate' === mode ? 'full' : 'patch';
};

export const routeToAgentMode = ( route: GenerationRoute ): AgentMode => {
	return 'full' === route ? 'generate' : 'edit';
};
