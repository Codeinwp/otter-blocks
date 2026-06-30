import type { BlockProps } from '../../../helpers/blocks';
import type {
	BlockGenerationResult,
	GenerationPlan,
	PatternLike,
	RootCompletion,
	ThemeColor
} from '../block-generation';

export type RequestCompletion = ( prompt: string ) => Promise<string>;

// The collapsed routing surface. A turn is either net-new generation ('full')
// or an edit of a selection — a text splice ('text'), a styling rewrite
// ('style'), or a full redesign rewrite ('rewrite').
export type GenerationRoute = 'full' | 'text' | 'style' | 'rewrite';

// How a selection edit is classified by the DECIDE_EDIT step.
export type EditKind = 'text' | 'style' | 'redesign';

export type RouteSource = 'model' | 'heuristic';

export type RouteDecision = {
	mode: 'edit' | 'generate';
	route: GenerationRoute;
	source: RouteSource;
};

export type AgentToolName = 'generate' | 'text' | 'style' | 'rewrite';

export type AgentToolCall = {
	tool: AgentToolName;
	reason: string;
	args?: unknown;
};

export type GenerationPhase =
	| 'planning'
	| 'refining';

export type BlockTypeLike = {
	name: string;
	title?: string;
	description?: string;
	attributes?: Record<string, Record<string, unknown>>;
};

export type GetBlockType = ( name: string ) => BlockTypeLike | undefined;

export type RunTurnArgs = {
	instruction: string;
	activePrompt: string;
	refineInstruction?: string;
	referenceBlocks: BlockProps<unknown>[];
	sessionHistory: string[];
	blockTypes: BlockTypeLike[];
	themeColors: ThemeColor[];
	patterns?: PatternLike[];
	isCreateMode: boolean;
	scope: 'section' | 'page';
	getBlockType: GetBlockType;
	requestCompletion: RequestCompletion;
	forceRoute?: 'edit' | 'structure' | 'generate';
	preferEdit?: boolean;
	onPhase?: ( phase: GenerationPhase ) => void;
	onPlanReady?: ( plan: GenerationPlan ) => void;
	onRootComplete?: ( completion: RootCompletion ) => void;
};

export type RunTurnResult = {
	generation: BlockGenerationResult;
	decision: RouteDecision;
	toolCall: AgentToolCall;
};

export type GenerateTurnArgs = Pick<
	RunTurnArgs,
	| 'activePrompt'
	| 'sessionHistory'
	| 'blockTypes'
	| 'themeColors'
	| 'patterns'
	| 'isCreateMode'
	| 'scope'
	| 'getBlockType'
	| 'requestCompletion'
	| 'onPhase'
	| 'onPlanReady'
	| 'onRootComplete'
> & {
	referenceBlocks: BlockProps<unknown>[];
};
