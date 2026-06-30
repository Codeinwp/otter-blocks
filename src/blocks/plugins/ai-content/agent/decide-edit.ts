/**
 * Decider step. Before editing an existing selection, classify what the user's
 * request actually changes so we can route to the cheapest, safest path:
 *
 * - "text"     → only the wording changes. We extract the text, transform it,
 *                and splice it back; layout and styles are untouchable.
 * - "style"    → only the look changes. We rewrite the markup but force the
 *                original text back in, so copy is untouchable.
 * - "redesign" → a real rebuild. Full markup rewrite, anything may change.
 */
import { parseJsonResponse } from '../json-utils';
import { PIPELINE_STEP } from '../prompts/phases';
import { aiDebug } from '../debug';
import type { EditKind, RequestCompletion } from './types';

// Built-in quick actions whose intent is unambiguous — skip the model round-trip
// and treat them as text edits directly. Matched loosely against the prompt text
// so localized/custom phrasings of the same idea still hit the fast path.
const TEXT_INTENT_HINTS = [
	'translat',
	'grammar',
	'spelling',
	'rephrase',
	'rewrite this',
	'reword',
	'tone',
	'simplif',
	'shorten',
	'make this shorter',
	'expand',
	'summar',
	'proofread',
	'clarity and flow'
];

const looksLikeTextEdit = ( instruction: string ): boolean => {
	const text = instruction.toLowerCase();

	return TEXT_INTENT_HINTS.some( ( hint ) => text.includes( hint ) );
};

export const buildDeciderPrompt = ( instruction: string, taskContext?: string ): string => {
	return [
		PIPELINE_STEP.DECIDE_EDIT,
		'You are editing one existing block selection in the WordPress editor.',
		...( taskContext && taskContext !== instruction ? [ `Original task for context: ${ taskContext }` ] : [] ),
		`The user's request: ${ instruction }`,
		'Classify the request into exactly one kind:',
		[
			'- "text": only the wording/copy should change. Examples: translate, fix grammar, rephrase, change tone, shorten, expand, summarize. Layout, structure, and styles stay identical.',
			'- "style": only the visual styling/layout should change. Examples: change color, background, spacing, padding, alignment, size, font, borders, make it a card. The wording stays identical.',
			'- "redesign": the structure or content should be rebuilt. Examples: redesign this, rebuild it, add/remove blocks, turn it into a different section, generate new content.'
		].join( '\n' ),
		'When unsure between "text" and "style", pick the one the request most directly asks for. Only pick "redesign" when the request clearly wants new structure or new content.',
		'Return strict JSON: { "kind": "text" | "style" | "redesign", "reason": string (short) }.'
	].join( '\n\n' );
};

/**
 * Decide how an edit should be applied. Uses a fast deterministic path for the
 * obvious text quick-actions, and a small model call otherwise.
 */
export const decideEditKind = async( args: {
	instruction: string;
	taskContext?: string;
	requestCompletion: RequestCompletion;
} ): Promise<{ kind: EditKind; reason: string }> => {
	if ( looksLikeTextEdit( args.instruction ) ) {
		aiDebug( 'decider: fast-path → text', { instruction: args.instruction } );
		return { kind: 'text', reason: 'Recognized text-only quick action.' };
	}

	const response = await args.requestCompletion(
		buildDeciderPrompt( args.instruction, args.taskContext )
	);

	const parsed = parseJsonResponse( response );
	const kind = parsed && 'string' === typeof parsed.kind ? String( parsed.kind ).toLowerCase() : '';
	const reason = parsed && 'string' === typeof parsed.reason ? String( parsed.reason ) : '';

	if ( 'text' === kind || 'style' === kind || 'redesign' === kind ) {
		aiDebug( `decider: model → ${ kind }`, { reason } );
		return { kind: kind as EditKind, reason };
	}

	// Anything unrecognized falls back to a full rewrite — the safe superset.
	aiDebug( 'decider: unclassified → redesign (fallback)', { rawKind: kind, reason } );
	return { kind: 'redesign', reason: reason || 'Unclassified request.' };
};
