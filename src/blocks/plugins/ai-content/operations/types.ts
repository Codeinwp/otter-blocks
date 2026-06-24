import type { AttributePatch } from '../block-patches';
import type { StructureEditPayload } from '../structure-edits';

/** Editor tools the agent can invoke — each maps to a local executor. */
export type AgentToolName =
	| 'patch'
	| 'structure'
	| 'list'
	| 'search_blocks'
	| 'search_history'
	| 'search_patterns'
	| 'adapt_pattern'
	| 'generate';

export type PatchToolArgs = {
	patches: AttributePatch[];
};

export type StructureToolArgs = StructureEditPayload;

export type ListToolArgs = Record<string, never>;

export type SearchBlocksToolArgs = {
	query?: string;
	type?: string;
	scope?: 'layout' | 'catalog' | 'all';
};

export type SearchHistoryToolArgs = {
	query?: string;
	step?: number;
};

export type SearchPatternsToolArgs = {
	query?: string;
	category?: string;
};

export type AdaptPatternToolArgs = {
	patternName: string;
};

export type GenerateToolArgs = Record<string, never>;

export type AgentToolArgs =
	| PatchToolArgs
	| StructureToolArgs
	| ListToolArgs
	| SearchBlocksToolArgs
	| SearchHistoryToolArgs
	| SearchPatternsToolArgs
	| AdaptPatternToolArgs
	| GenerateToolArgs;

export type AgentToolCall = {
	tool: AgentToolName;
	reason?: string;
	args: AgentToolArgs;
};

export const toolToRoute = ( tool: AgentToolName ): 'patch' | 'structure' | 'list' | 'history' | 'pattern' | 'full' => {
	if ( 'generate' === tool ) {
		return 'full';
	}

	if ( 'search_history' === tool ) {
		return 'history';
	}

	if ( 'search_patterns' === tool || 'adapt_pattern' === tool ) {
		return 'pattern';
	}

	if ( 'list' === tool || 'search_blocks' === tool ) {
		return 'list';
	}

	if ( 'structure' === tool ) {
		return 'structure';
	}

	return 'patch';
};
