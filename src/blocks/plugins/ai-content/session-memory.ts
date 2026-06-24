/**
 * Rich in-memory session log for AI tool calls — prompts, operations, and
 * removed-block snapshots so follow-ups like "add it back" can be resolved.
 */

import Fuse from 'fuse.js';

import type { BlockProps } from '../../helpers/blocks';
import type { GeneratedBlockTree } from './block-generation';
import { blocksToTrees } from './block-patches';
import { extractBlockById } from './structure-edits';
import type { AgentToolArgs, AgentToolName } from './operations/types';
import type { StructureEditPayload } from './structure-edits';
import type { GenerationRoute } from './routing/types';

/** Turns kept in every tool-call prompt (compact summaries). */
export const SESSION_MEMORY_PROMPT_LIMIT = 6;

/** Full in-session archive searchable via search_history. */
export const SESSION_MEMORY_ARCHIVE_LIMIT = 20;

export type SessionOperationLog = {
	tool: AgentToolName;
	remove?: string[];
	insert?: StructureEditPayload['insert'];
	move?: StructureEditPayload['move'];
	patches?: { id: string; attributes: Record<string, unknown> }[];
};

export type SessionTurnMemory = {
	step: number;
	prompt: string;
	tool: AgentToolName;
	route: GenerationRoute;
	summary: string;
	/** Token-limited payload from a local search in this turn. */
	gathered?: string;
	operation?: SessionOperationLog;
	/** Block trees removed in this step, keyed by index-path id — used to restore. */
	removedBlocks?: Record<string, GeneratedBlockTree>;
};

export type SearchHistoryArgs = {
	query?: string;
	step?: number;
};

export type SessionTurnSource = {
	meta: {
		prompt: string;
		route: GenerationRoute;
		tool?: AgentToolName;
		operation?: SessionOperationLog;
		removedBlocks?: Record<string, GeneratedBlockTree>;
		contextEntry?: import( './agent-context' ).AgentContextEntry;
	};
};

const trimArchive = <T>( entries: T[], limit = SESSION_MEMORY_ARCHIVE_LIMIT ): T[] => {
	if ( entries.length <= limit ) {
		return entries;
	}

	return entries.slice( -limit );
};

const routeToTool = ( route: GenerationRoute ): AgentToolName => {
	if ( 'full' === route ) {
		return 'generate';
	}

	if ( 'structure' === route ) {
		return 'structure';
	}

	if ( 'list' === route || 'history' === route || 'pattern' === route ) {
		return 'list';
	}

	return 'patch';
};

const summarizeFromMeta = ( tool: AgentToolName, operation?: SessionOperationLog ): string => {
	if ( ! operation ) {
		if ( 'generate' === tool ) {
			return 'Generated a new layout.';
		}

		if ( 'list' === tool || 'search_blocks' === tool ) {
			return 'Listed blocks.';
		}

		return `${ tool } operation.`;
	}

	const parts: string[] = [];

	if ( operation.remove?.length ) {
		parts.push( `removed block ids: ${ operation.remove.join( ', ' ) }` );
	}

	if ( operation.insert?.length ) {
		parts.push( `inserted ${ operation.insert.length } block(s)` );
	}

	if ( operation.move?.length ) {
		parts.push( `moved ${ operation.move.length } block(s)` );
	}

	if ( operation.patches?.length ) {
		parts.push( `patched ${ operation.patches.length } block(s): ${ operation.patches.map( ( p ) => p.id ).join( ', ' ) }` );
	}

	return parts.join( '; ' ) || `${ tool } operation.`;
};

/**
 * Build structured session memory from modal turns (oldest first).
 */
export const buildSessionMemory = ( turns: SessionTurnSource[] ): SessionTurnMemory[] => {
	return trimArchive(
		turns.map( ( turn, index ) => {
			const tool = turn.meta.tool || routeToTool( turn.meta.route );

			return {
				step: index + 1,
				prompt: turn.meta.prompt,
				tool,
				route: turn.meta.route,
				summary: summarizeFromMeta( tool, turn.meta.operation ),
				gathered: turn.meta.contextEntry?.payload,
				operation: turn.meta.operation,
				removedBlocks: turn.meta.removedBlocks
			};
		})
	);
};

/**
 * Compact session log included in every tool-call prompt.
 * @deprecated Prefer formatAgentSessionForPrompt from agent-context.
 */
export const formatSessionMemoryForPrompt = (
	memory: SessionTurnMemory[],
	limit = SESSION_MEMORY_PROMPT_LIMIT
): string[] => {
	const recent = memory.length <= limit ? memory : memory.slice( -limit );

	if ( ! recent.length ) {
		return [];
	}

	const lines = recent.map( ( entry ) => {
		const restoreHint = entry.removedBlocks && Object.keys( entry.removedBlocks ).length
			? ` [removed snapshots: ${ Object.keys( entry.removedBlocks ).join( ', ' ) }]`
			: '';

		return `Step ${ entry.step }: "${ entry.prompt }" → ${ entry.tool }: ${ entry.summary }${ restoreHint }`;
	});

	return [
		[
			'Session memory (recent turns, oldest first). Use for follow-ups like "add it back", "undo that", or "same as before":',
			...lines
		].join( '\n' )
	];
};

const searchHistoryIndex = ( memory: SessionTurnMemory[] ) => new Fuse( memory, {
	keys: [
		{ name: 'prompt', weight: 3 },
		{ name: 'summary', weight: 2 },
		{ name: 'tool', weight: 1 },
		'operation.remove',
		'operation.patches.id'
	],
	threshold: 0.4,
	ignoreLocation: true,
	minMatchCharLength: 2
});

const searchHistoryByQuery = ( memory: SessionTurnMemory[], query: string ): SessionTurnMemory[] => {
	const normalized = query.trim();

	if ( ! normalized ) {
		return memory;
	}

	return searchHistoryIndex( memory ).search( normalized ).map( ( result ) => result.item );
};

/**
 * Search the full in-session archive (local — no AI tokens).
 */
export const searchSessionMemory = (
	memory: SessionTurnMemory[],
	args: SearchHistoryArgs = {}
): SessionTurnMemory[] => {
	if ( 'number' === typeof args.step ) {
		return memory.filter( ( entry ) => entry.step === args.step );
	}

	if ( args.query?.trim() ) {
		return searchHistoryByQuery( memory, args.query );
	}

	return [ ...memory ];
};

/**
 * Format search_history results for display or a follow-up tool-call prompt.
 */
export const formatHistorySearchResults = ( results: SessionTurnMemory[] ): string => {
	if ( ! results.length ) {
		return 'No matching session history entries.';
	}

	return results.map( ( entry ) => {
		const blocks = entry.removedBlocks
			? `\n  removedBlocks: ${ JSON.stringify( entry.removedBlocks ) }`
			: '';

		return [
			`Step ${ entry.step }: "${ entry.prompt }"`,
			`  tool: ${ entry.tool }`,
			`  summary: ${ entry.summary }`,
			entry.operation ? `  operation: ${ JSON.stringify( entry.operation ) }` : '',
			blocks
		].filter( Boolean ).join( '\n' );
	}).join( '\n\n' );
};

/**
 * Summarize a tool call for session storage.
 */
export const summarizeToolOperation = (
	tool: AgentToolName,
	args: AgentToolArgs
): SessionOperationLog => {
	if ( 'patch' === tool && 'patches' in args ) {
		return {
			tool,
			patches: args.patches.map( ( patch ) => ({
				id: patch.id,
				attributes: patch.attributes
			}) )
		};
	}

	if ( 'structure' === tool ) {
		return {
			tool,
			remove: args.remove,
			insert: args.insert,
			move: args.move
		};
	}

	if ( 'adapt_pattern' === tool && 'patternName' in args ) {
		return { tool, patches: [{ id: args.patternName, attributes: {} }] };
	}

	return { tool };
};

/**
 * Snapshot blocks before a structure remove so they can be restored later.
 */
export const captureRemovedBlockSnapshots = (
	baseBlocks: BlockProps<unknown>[],
	removeIds: string[]
): Record<string, GeneratedBlockTree> => {
	const snapshots: Record<string, GeneratedBlockTree> = {};

	for ( const id of removeIds ) {
		const { extracted } = extractBlockById( baseBlocks, id );

		if ( extracted ) {
			const [ tree ] = blocksToTrees([ extracted ]);
			snapshots[ id ] = tree;
		}
	}

	return snapshots;
};
