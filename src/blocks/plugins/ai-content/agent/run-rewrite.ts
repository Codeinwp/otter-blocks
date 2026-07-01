/**
 * WordPress dependencies.
 */
import { parse, serialize } from '@wordpress/blocks';

/**
 * Internal dependencies.
 */
import {
	ATOMIC_WIND_ATTRIBUTE_HINT,
	buildRepairFeedback,
	jsonTreeToBlocks,
	validateGeneratedBlocks
} from '../block-generation';
import type { BlockProps } from '../../../helpers/blocks';
import type { GeneratedBlockTree, ThemeColor } from '../block-generation';
import { buildBlockSchemaPayload } from '../apply-content';
import { parseJsonResponse } from '../json-utils';
import { formatSessionHistoryForPrompt } from '../session-history';
import { PIPELINE_STEP } from '../prompts/phases';
import type { AgentToolCall, RouteDecision } from './types';
import { applyTextNodes, collectTextNodes } from './text-nodes';
import type { RunTurnArgs, RunTurnResult } from './types';

const emptyPlan = () => ({ mission: '', design: {}, rationale: [], roots: [] });

const formatPalette = ( colors: ThemeColor[] ): string =>
	colors
		.filter( ( color ) => color?.slug && color?.color )
		.map( ( color ) => `${ color.slug } (${ color.color })${ color.name ? ` — ${ color.name }` : '' }` )
		.join( '\n' );

type RewritePromptArgs = {
	markup: string;
	instruction: string;
	taskContext?: string;
	sessionHistory: string[];
	themeColors: ThemeColor[];
	hasAtomic: boolean;
	/**
	 * JSON attribute schema (deduped by block type) for the selection, so the model
	 * knows every valid attribute it may set — not just those already in the markup.
	 */
	blockSchema?: string;
	/**
	 * 'style' constrains the rewrite to visual/layout changes and forbids text edits
	 * (text is re-injected after as a guarantee); 'redesign' allows any change.
	 */
	editKind?: 'style' | 'redesign';
};

/**
 * Full-markup rewrite prompt: sends the entire serialized selection and asks for the
 * entire updated markup back — full fidelity on complex nested blocks, no
 * reconstructing the tree from positional patches.
 */
export const buildBlockRewritePrompt = ( args: RewritePromptArgs ): string => {
	const palette = formatPalette( args.themeColors );

	return [
		PIPELINE_STEP.REWRITE,
		...formatSessionHistoryForPrompt( args.sessionHistory ),
		'You are editing an existing WordPress (Gutenberg) block layout built with Otter Blocks.',
		'Below is the COMPLETE current block markup — serialized blocks with their comment delimiters. Treat it as the full, authoritative source of truth, including every nested block and attribute.',
		'Current block markup:',
		args.markup,
		...( args.blockSchema ? [ `Attribute schema for every block type in the selection (deduplicated by type) — the full set of valid attributes you may set on each, beyond those already present in the markup:\n${ args.blockSchema }` ] : [] ),
		...( args.taskContext && args.taskContext !== args.instruction ? [ `Original task for context: ${ args.taskContext }` ] : [] ),
		`Apply this change: ${ args.instruction }`,
		'Rules:',
		[
			'- Return the COMPLETE updated markup for the ENTIRE layout above — every block, in order, edited and unedited. Never omit, summarize, truncate, or use placeholders for unchanged blocks.',
			...( 'style' === args.editKind
				? [
					'- This is a STYLING change only. Keep ALL text/copy exactly as given — do not translate, rephrase, or reword anything. Change only visual and layout attributes (colors, spacing, alignment, sizes, backgrounds, borders, classNames).',
					'- Keep the same blocks and the same nesting. Do not add or remove blocks.'
				]
				: [
					'- Change only what the request requires; preserve all other blocks, their attributes, nesting, and text exactly as given.',
					'- You may add, remove, reorder, or re-nest blocks when the request calls for it.'
				] ),
			'- Keep each block comment\'s JSON attributes consistent with its HTML so every block stays valid. Use only block types already in the markup and attributes valid for them (see the attribute schema above); never invent block types or attributes.'
		].join( '\n' ),
		...( palette ? [ `When the change involves colors, prefer these theme color slugs where they fit:\n${ palette }` ] : [] ),
		...( args.hasAtomic ? [ ATOMIC_WIND_ATTRIBUTE_HINT ] : [] ),
		'Return strict JSON: { "summary": string (one short sentence describing what you changed), "markup": string (the full serialized block markup) }.'
	].join( '\n\n' );
};

// How many times an invalid rewrite is re-attempted with the validation errors
// fed back — the same self-repair contract the generation pipeline uses.
const REWRITE_REPAIR_ATTEMPTS = 2;

type RewriteAttempt = {
	blocks: BlockProps<unknown>[];
	summary: string;
	errors: string[];
};

/**
 * Request one rewrite, rebuild it through createBlock (attributes drive the saved
 * markup, healing literal-HTML drift), and validate. Returns blocks + validation
 * errors for the caller's repair loop.
 */
const requestRewrite = async(
	args: RunTurnArgs,
	prompt: string
): Promise<RewriteAttempt> => {
	const parsed = parseJsonResponse( await args.requestCompletion( prompt ) );
	const newMarkup = parsed && 'string' === typeof parsed.markup ? parsed.markup : '';
	const summary = parsed && 'string' === typeof parsed.summary ? parsed.summary : '';

	const parsedBlocks = newMarkup
		? parse( newMarkup ).filter( ( block ) => block?.name )
		: [];

	const blocks = jsonTreeToBlocks(
		parsedBlocks as unknown as GeneratedBlockTree[],
		args.getBlockType
	);

	if ( ! blocks.length ) {
		return { blocks, summary, errors: [ 'The rewrite returned no parseable blocks.' ] };
	}

	const validation = validateGeneratedBlocks( blocks, args.getBlockType, { skipRootParentChecks: true } );

	return { blocks, summary, errors: validation.valid ? [] : validation.errors };
};

/**
 * Run one block edit by rewriting the whole selection's markup — robust for simple
 * and complex/nested selections. Built on the same machinery as generation: a
 * validate→repair loop plus the deterministic quality gate. A 'style' edit also
 * force-restores the original copy so styling changes can never reword anything.
 */
export const runBlockRewriteTurn = async(
	args: RunTurnArgs,
	editKind: 'style' | 'redesign' = 'redesign'
): Promise<RunTurnResult> => {
	args.onPhase?.( 'refining' );

	const markup = serialize( args.referenceBlocks as Parameters<typeof serialize>[ 0 ] );
	const hasAtomic = markup.includes( 'atomic-wind/' );

	// Attribute schema for every block type in the selection (incl. nested), so the
	// rewrite can use the full valid attribute set — not just what the markup exposes.
	const schemaPayload = buildBlockSchemaPayload( args.referenceBlocks, args.getBlockType );
	const blockSchema = schemaPayload && Object.keys( schemaPayload.schemas ).length
		? JSON.stringify( schemaPayload.schemas, null, 2 )
		: '';

	const basePrompt = buildBlockRewritePrompt({
		markup,
		instruction: args.instruction,
		taskContext: args.activePrompt,
		sessionHistory: args.sessionHistory,
		themeColors: args.themeColors,
		hasAtomic,
		blockSchema,
		editKind
	});

	const route = 'style' === editKind ? 'style' : 'rewrite';
	const decision: RouteDecision = { mode: 'edit', route, source: 'model' };

	// Validate → repair loop: re-prompt with the validation errors appended until
	// we get a valid tree or run out of attempts.
	let attempt: RewriteAttempt = { blocks: [], summary: '', errors: [] };

	for ( let i = 0; i < REWRITE_REPAIR_ATTEMPTS; i++ ) {
		const prompt = 0 === i ? basePrompt : `${ basePrompt }\n\n${ buildRepairFeedback( attempt.errors ) }`;
		attempt = await requestRewrite( args, prompt );

		if ( attempt.blocks.length && ! attempt.errors.length ) {
			break;
		}
	}

	const summary = attempt.summary;
	const toolCall: AgentToolCall = { tool: route, reason: summary };
	const rationale = summary ? [ summary ] : [];

	let blocks = attempt.blocks;

	if ( ! blocks.length ) {
		// Nothing parseable came back — surface as a failed turn so the modal
		// prompts the user to retry rather than silently keeping the original.
		return {
			generation: {
				blocks: [],
				plan: emptyPlan(),
				rationale,
				diagnostics: { droppedRoots: [] }
			},
			decision,
			toolCall
		};
	}

	// A styling edit must never change copy. If the text shape is unchanged (same
	// fragment count) force the original text back in; if it changed, leave the
	// model's output rather than mis-map fragments.
	if ( 'style' === editKind ) {
		const before = collectTextNodes( args.referenceBlocks, args.getBlockType );
		const after = collectTextNodes( blocks, args.getBlockType );

		if ( before.length && before.length === after.length ) {
			blocks = applyTextNodes( blocks, after, before.map( ( node ) => node.value ) );
		}
	}

	const validation = validateGeneratedBlocks( blocks, args.getBlockType, { skipRootParentChecks: true } );

	return {
		generation: {
			blocks,
			plan: emptyPlan(),
			rationale,
			diagnostics: {
				droppedRoots: validation.valid
					? []
					: [ { root: { name: 'rewrite', innerBlocks: [] }, errors: validation.errors } ]
			}
		},
		decision,
		toolCall
	};
};
