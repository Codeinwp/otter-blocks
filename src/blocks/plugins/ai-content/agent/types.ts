import type { BlockProps } from '../../helpers/blocks';
import type {
	BlockGenerationResult,
	GeneratedBlockTree,
	GenerationPlan,
	PatternLike,
	RootCompletion,
	ThemeColor
} from '../block-generation';
import type { AgentContextEntry, AgentSessionContext } from '../agent-context';
import type { RouteDecision } from '../routing/types';
import type { AgentToolCall } from '../operations/types';
import type { SessionTurnMemory } from '../session-memory';

export type RequestCompletion = ( prompt: string ) => Promise<string>;

export type GenerationPhase =
	| 'planning'
	| 'briefing'
	| 'selecting'
	| 'outlining'
	| 'building'
	| 'polishing'
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
	sessionMemory?: SessionTurnMemory[];
	agentContext?: AgentSessionContext;
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
	removedBlocks?: Record<string, GeneratedBlockTree>;
	/** Search artifact from this turn, stored in session context for later turns. */
	contextEntry?: AgentContextEntry;
	agentContext: AgentSessionContext;
};

export type EditTurnArgs = Pick<
	RunTurnArgs,
	| 'instruction'
	| 'activePrompt'
	| 'sessionHistory'
	| 'blockTypes'
	| 'themeColors'
	| 'getBlockType'
	| 'requestCompletion'
	| 'onPhase'
> & {
	baseBlocks: BlockProps<unknown>[];
	referenceContext: string;
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
