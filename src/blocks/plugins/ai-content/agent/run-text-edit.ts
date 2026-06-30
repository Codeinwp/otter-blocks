/**
 * Text-only edit turn. Sends just the selection's text fragments (never the
 * markup) and writes the transformed fragments back into a clone of the original
 * blocks. The result is guaranteed to be the same blocks — same layout, same
 * styles, same nesting — with only the copy changed. The model cannot add or
 * remove blocks because it never sees or returns any markup.
 */
import {
	validateGeneratedBlocks
} from '../block-generation';
import { parseJsonResponse } from '../json-utils';
import { formatSessionHistoryForPrompt } from '../session-history';
import { PIPELINE_STEP } from '../prompts/phases';
import type { BlockProps } from '../../../helpers/blocks';
import { aiDebug } from '../debug';
import { applyTextNodes, collectTextNodes } from './text-nodes';
import type { TextNode } from './text-nodes';
import type { RouteDecision, RunTurnArgs, RunTurnResult } from './types';

const emptyPlan = () => ( { mission: '', design: {}, rationale: [], roots: [] } );

export const buildTextEditPrompt = ( args: {
	fragments: string[];
	instruction: string;
	taskContext?: string;
	sessionHistory: string[];
} ): string => {
	return [
		PIPELINE_STEP.TEXT_EDIT,
		...formatSessionHistoryForPrompt( args.sessionHistory ),
		...( args.taskContext && args.taskContext !== args.instruction ? [ `Original task for context: ${ args.taskContext }` ] : [] ),
		`Apply this change to every fragment: ${ args.instruction }`,
		'Rules:',
		[
			`- Return EXACTLY ${ args.fragments.length } items, in the same order. Never add, remove, split, merge, or reorder items.`,
			'- Apply the change to the wording only. Preserve any inline HTML tags (<strong>, <em>, <a href>, <br>, …) and their attributes exactly.',
			'- Keep URLs, shortcodes, placeholders, and entities intact.',
			'- If a fragment should not change, return it unchanged.'
		].join( '\n' ),
		`Text fragments (JSON array of ${ args.fragments.length } strings):`,
		JSON.stringify( args.fragments ),
		'Return strict JSON: { "items": string[] } with exactly the same number of strings, in order.'
	].join( '\n\n' );
};

const parseItems = ( response: string, expected: number ): ( string | undefined )[] => {
	const parsed = parseJsonResponse( response );
	const items = parsed && Array.isArray( parsed.items ) ? parsed.items : null;

	if ( ! items ) {
		return [];
	}

	// Map positionally; ignore anything beyond the expected count and keep
	// originals (undefined) for anything short.
	return Array.from( { length: expected }, ( _unused, index ) => {
		const value = items[ index ];

		return 'string' === typeof value ? value : undefined;
	} );
};

export const runTextEditTurn = async( args: RunTurnArgs ): Promise<RunTurnResult> => {
	args.onPhase?.( 'refining' );

	const nodes: TextNode[] = collectTextNodes( args.referenceBlocks, args.getBlockType );

	aiDebug( `text-edit: collected ${ nodes.length } text fragment(s)`, nodes.map( ( node ) => ({ path: node.path.join( '.' ), key: node.key, value: node.value }) ) );

	const decision: RouteDecision = { mode: 'edit', route: 'text', source: 'model' };

	// No editable text in the selection — nothing a text edit can do. Surface as
	// a no-op failure so the caller can fall back (e.g. to a rewrite).
	if ( ! nodes.length ) {
		aiDebug( 'text-edit: NO fragments → falling back to rewrite (selected content has no editable text attributes)' );
		return {
			generation: {
				blocks: [],
				plan: emptyPlan(),
				rationale: [],
				diagnostics: { droppedRoots: [] }
			},
			decision,
			toolCall: { tool: 'text', reason: 'No editable text in selection.' }
		};
	}

	const response = await args.requestCompletion(
		buildTextEditPrompt( {
			fragments: nodes.map( ( node ) => node.value ),
			instruction: args.instruction,
			taskContext: args.activePrompt,
			sessionHistory: args.sessionHistory
		} )
	);

	const items = parseItems( response, nodes.length );
	const changed = items.filter( ( value ) => 'string' === typeof value ).length;

	aiDebug( `text-edit: model returned ${ changed }/${ nodes.length } usable fragment(s)`, items );

	const blocks: BlockProps<unknown>[] = applyTextNodes( args.referenceBlocks, nodes, items );

	const validation = validateGeneratedBlocks( blocks, args.getBlockType, { skipRootParentChecks: true } );

	return {
		generation: {
			blocks,
			plan: emptyPlan(),
			rationale: changed ? [ `Updated text in ${ changed } place${ 1 === changed ? '' : 's' }.` ] : [],
			diagnostics: {
				droppedRoots: validation.valid
					? []
					: [ { root: { name: 'text', innerBlocks: [] }, errors: validation.errors } ]
			}
		},
		decision,
		toolCall: { tool: 'text', reason: args.instruction }
	};
};
