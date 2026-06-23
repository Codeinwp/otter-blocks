import type { BlockProps } from '../../helpers/blocks';
import type {
	BlockGenerationResult,
	GenerationPlan,
	PatternLike,
	RootCompletion,
	ThemeColor
} from '../block-generation';
import type { RouteDecision } from '../routing/types';

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
	blockTypes: BlockTypeLike[];
	themeColors: ThemeColor[];
	patterns?: PatternLike[];
	isCreateMode: boolean;
	scope: 'section' | 'page';
	getBlockType: GetBlockType;
	requestCompletion: RequestCompletion;
	forceRoute?: 'edit' | 'generate';
	preferEdit?: boolean;
	onPhase?: ( phase: GenerationPhase ) => void;
	onPlanReady?: ( plan: GenerationPlan ) => void;
	onRootComplete?: ( completion: RootCompletion ) => void;
};

export type RunTurnResult = {
	generation: BlockGenerationResult;
	decision: RouteDecision;
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
