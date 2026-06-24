/**
 * Session context passed to every model call — compact transcript of what the
 * user asked, what the agent did, and token-limited facts gathered locally
 * (search hits, slugs, ids). Like a rolling chat + tool trace.
 */

import type { AgentToolName } from './operations/types';
import type { SessionTurnMemory } from './session-memory';

export type AgentContextKind = 'block_search' | 'pattern_search' | 'history_search';

/** Search artifacts kept across turns (reuse without re-searching). */
export const AGENT_CONTEXT_ENTRY_LIMIT = 4;

/** Block index lines included in the tool-call prompt before deferring to search. */
export const BLOCK_INDEX_PROMPT_LIMIT = 24;

export type AgentContextEntry = {
	step: number;
	kind: AgentContextKind;
	query?: string;
	/** Pre-formatted, token-limited search hits. */
	payload: string;
};

export type AgentContextPayload = {
	kind: AgentContextKind;
	query?: string;
	payload: string;
};

export type AgentSessionContext = {
	entries: AgentContextEntry[];
};

export type AgentContextTurnSource = {
	meta: {
		contextEntry?: AgentContextEntry;
	};
};

const trimEntries = <T>( entries: T[], limit: number ): T[] => {
	if ( entries.length <= limit ) {
		return entries;
	}

	return entries.slice( -limit );
};

export const emptyAgentContext = (): AgentSessionContext => ({ entries: [] });

export const buildAgentContext = (
	turns: AgentContextTurnSource[]
): AgentSessionContext => {
	const entries = turns
		.map( ( turn ) => turn.meta.contextEntry )
		.filter( ( entry ): entry is AgentContextEntry => !! entry );

	return { entries: trimEntries( entries, AGENT_CONTEXT_ENTRY_LIMIT ) };
};

export const appendAgentContextEntry = (
	context: AgentSessionContext | undefined,
	entry: AgentContextEntry
): AgentSessionContext => ({
	entries: trimEntries(
		[ ...( context?.entries || [] ), entry ],
		AGENT_CONTEXT_ENTRY_LIMIT
	)
});

const kindLabel: Record<AgentContextKind, string> = {
	block_search: 'Block search',
	pattern_search: 'Pattern search',
	history_search: 'History search'
};

export type FormatAgentSessionArgs = {
	memory?: SessionTurnMemory[];
	context?: AgentSessionContext;
};

/**
 * One session block for the model: prior turns (user + actions) plus reusable
 * gathered facts. Replaces duplicate sessionHistory / sessionMemory / search
 * result sections in the tool-call prompt.
 */
export const formatAgentSessionForPrompt = ({
	memory = [],
	context
}: FormatAgentSessionArgs ): string[] => {
	const sections: string[] = [];

	if ( memory.length ) {
		const turns = memory.map( ( entry ) => {
			const lines = [
				`Step ${ entry.step } — User: "${ entry.prompt }"`,
				`  → ${ entry.tool }: ${ entry.summary }`
			];

			if ( entry.gathered ) {
				lines.push( `  → gathered:\n${ entry.gathered }` );
			}

			if ( entry.removedBlocks && Object.keys( entry.removedBlocks ).length ) {
				lines.push(
					`  → removed snapshots (restore via structure.insert): ${ Object.keys( entry.removedBlocks ).join( ', ' ) }`
				);
			}

			return lines.join( '\n' );
		});

		sections.push([
			'Session — prior turns in this chat (oldest first). Continue from here; resolve follow-ups from this history:',
			...turns
		].join( '\n\n' ) );
	}

	const reusable = context?.entries || [];

	if ( reusable.length ) {
		const facts = reusable.map( ( entry ) => {
			const query = entry.query ? ` query="${ entry.query }"` : '';

			return `${ kindLabel[ entry.kind ] } (step ${ entry.step }${ query }):\n${ entry.payload }`;
		});

		sections.push([
			'Gathered facts (from local searches — reuse slugs/ids below; search again only if the user changes intent):',
			...facts
		].join( '\n\n' ) );
	}

	if ( ! sections.length ) {
		return [];
	}

	return [ sections.join( '\n\n' ) ];
};

/**
 * Build a context entry after a local search tool runs.
 */
export const buildContextEntryFromPayload = (
	step: number,
	payload: AgentContextPayload
): AgentContextEntry => ({
	step,
	kind: payload.kind,
	query: payload.query,
	payload: payload.payload
});

/**
 * Compact outcome line stored on the turn for the next session transcript.
 */
export const summarizeToolOutcome = (
	tool: AgentToolName,
	reason?: string
): string => reason?.trim() || tool;
