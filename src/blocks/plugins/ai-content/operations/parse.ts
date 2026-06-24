import type { AttributePatch } from '../block-patches';
import { isObject, parseJsonResponse } from '../json-utils';
import { parseStructureEditPayload } from '../structure-edits';
import type {
	AgentToolCall,
	AgentToolName,
	AdaptPatternToolArgs,
	GenerateToolArgs,
	ListToolArgs,
	PatchToolArgs,
	SearchHistoryToolArgs,
	SearchBlocksToolArgs,
	SearchPatternsToolArgs,
	StructureToolArgs
} from './types';

const TOOL_NAMES: AgentToolName[] = [
	'patch',
	'structure',
	'list',
	'search_blocks',
	'search_history',
	'search_patterns',
	'adapt_pattern',
	'generate'
];

const isToolName = ( value: unknown ): value is AgentToolName => {
	return 'string' === typeof value && TOOL_NAMES.includes( value as AgentToolName );
};

const parsePatchArgs = ( args: unknown ): PatchToolArgs | null => {
	if ( ! isObject( args ) ) {
		return null;
	}

	const patches = Array.isArray( args.patches )
		? ( args.patches.filter( isObject ) as Record<string, unknown>[] )
			.map( ( patch ): AttributePatch => ({
				id: 'string' === typeof patch.id
					? patch.id
					: ( 'number' === typeof patch.id ? String( patch.id ) : '' ),
				attributes: isObject( patch.attributes ) ? patch.attributes : {}
			}) )
			.filter( ( patch ) => patch.id && Object.keys( patch.attributes ).length )
		: [];

	return patches.length ? { patches } : null;
};

const parseStructureArgs = ( args: unknown ): StructureToolArgs | null => {
	if ( ! isObject( args ) ) {
		return null;
	}

	const payload = parseStructureEditPayload( JSON.stringify( args ) );

	if ( ! payload.remove?.length && ! payload.insert?.length && ! payload.move?.length ) {
		return null;
	}

	return payload;
};

/**
 * Parse a tool-call JSON response from the model.
 *
 * Expected shape:
 * `{ "tool": "patch"|"structure"|"list"|"generate", "reason"?: string, "args": object }`
 */
export const parseToolCall = ( response: string ): AgentToolCall | null => {
	const parsed = parseJsonResponse( response );

	if ( ! parsed || ! isObject( parsed ) ) {
		return null;
	}

	const tool = parsed.tool ?? parsed.operation;

	if ( ! isToolName( tool ) ) {
		return null;
	}

	const reason = 'string' === typeof parsed.reason ? parsed.reason : undefined;

	if ( 'patch' === tool ) {
		const rawArgs = isObject( parsed.args ) ? parsed.args : parsed;
		const args = parsePatchArgs( rawArgs );

		if ( ! args ) {
			return null;
		}

		return { tool, reason, args };
	}

	if ( 'structure' === tool ) {
		const rawArgs = isObject( parsed.args ) ? parsed.args : parsed;
		const args = parseStructureArgs( rawArgs );

		if ( ! args ) {
			return null;
		}

		return { tool, reason, args };
	}

	if ( 'list' === tool ) {
		return { tool, reason, args: {} as ListToolArgs };
	}

	if ( 'search_blocks' === tool ) {
		const rawArgs = isObject( parsed.args ) ? parsed.args : {};
		const args: SearchBlocksToolArgs = {};

		if ( 'string' === typeof rawArgs.query && rawArgs.query.trim() ) {
			args.query = rawArgs.query.trim();
		}

		if ( 'string' === typeof rawArgs.type && rawArgs.type.trim() ) {
			args.type = rawArgs.type.trim();
		}

		if ( 'layout' === rawArgs.scope || 'catalog' === rawArgs.scope || 'all' === rawArgs.scope ) {
			args.scope = rawArgs.scope;
		}

		return { tool, reason, args };
	}

	if ( 'search_history' === tool ) {
		const rawArgs = isObject( parsed.args ) ? parsed.args : {};
		const args: SearchHistoryToolArgs = {};

		if ( 'string' === typeof rawArgs.query && rawArgs.query.trim() ) {
			args.query = rawArgs.query.trim();
		}

		if ( 'number' === typeof rawArgs.step ) {
			args.step = rawArgs.step;
		}

		return { tool, reason, args };
	}

	if ( 'search_patterns' === tool ) {
		const rawArgs = isObject( parsed.args ) ? parsed.args : {};
		const args: SearchPatternsToolArgs = {};

		if ( 'string' === typeof rawArgs.query && rawArgs.query.trim() ) {
			args.query = rawArgs.query.trim();
		}

		if ( 'string' === typeof rawArgs.category && rawArgs.category.trim() ) {
			args.category = rawArgs.category.trim();
		}

		return { tool, reason, args };
	}

	if ( 'adapt_pattern' === tool ) {
		const rawArgs = isObject( parsed.args ) ? parsed.args : parsed;
		const patternName = 'string' === typeof rawArgs.patternName ? rawArgs.patternName.trim() : '';

		if ( ! patternName ) {
			return null;
		}

		return { tool, reason, args: { patternName } };
	}

	return { tool, reason, args: {} as GenerateToolArgs };
};
