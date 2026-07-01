/**
 * Style-only edit turn. Sends just each block's style attributes (never markup
 * or text) and splices the transformed values back into a clone of the original
 * blocks, so layout, nesting, and copy can't change. Keeps recolors/restyles off
 * the whole-markup REWRITE path, whose response bloats past the size/latency limit.
 */
import { validateGeneratedBlocks } from '../block-generation';
import type { ThemeColor } from '../block-generation';
import { isObject, parseJsonResponse } from '../json-utils';
import { formatSessionHistoryForPrompt } from '../session-history';
import { PIPELINE_STEP } from '../prompts/phases';
import type { BlockProps } from '../../../helpers/blocks';
import { applyStyleNodes, collectStyleNodes, styleNodeChanged } from './style-nodes';
import type { StyleNode } from './style-nodes';
import type { RouteDecision, RunTurnArgs, RunTurnResult } from './types';

const emptyPlan = () => ( { mission: '', design: {}, rationale: [], roots: [] } );

const formatPalette = ( colors: ThemeColor[] ): string =>
	colors
		.filter( ( color ) => color?.slug && color?.color )
		.map( ( color ) => `${ color.slug } (${ color.color })${ color.name ? ` — ${ color.name }` : '' }` )
		.join( '\n' );

export const buildStyleEditPrompt = ( args: {
	nodes: StyleNode[];
	instruction: string;
	taskContext?: string;
	sessionHistory: string[];
	themeColors: ThemeColor[];
	hasAtomic: boolean;
} ): string => {
	const palette = formatPalette( args.themeColors );

	// Only the label + style attributes go to the model — never the text or structure.
	const elements = args.nodes.map( ( node ) => ( { el: node.label, attrs: node.attrs } ) );

	return [
		PIPELINE_STEP.STYLE_EDIT,
		...formatSessionHistoryForPrompt( args.sessionHistory ),
		...( args.taskContext && args.taskContext !== args.instruction ? [ `Original task for context: ${ args.taskContext }` ] : [] ),
		`Apply this styling change to every element: ${ args.instruction }`,
		'Rules:',
		[
			`- Return EXACTLY ${ args.nodes.length } items, in the same order. Never add, remove, split, merge, or reorder items.`,
			'- Each item is an "attrs" object holding the SAME keys you were given for that element — return every key, changed or not.',
			'- Preserve the shape and type of every value exactly (a string stays a string, a number a number, an object keeps its keys); only change styling values.',
			'- Colors are hex strings ("#2A3A5C"), theme color slugs, or (for className) Tailwind utilities. Keep the layout/structure intact and keep text readable against its background.',
			'- If an element should not change, return its attrs unchanged.'
		].join( '\n' ),
		...( palette ? [ `Prefer these theme color slugs where they fit:\n${ palette }` ] : [] ),
		...( args.hasAtomic
			? [ 'Elements with a "className" are Atomic Wind blocks styled with Tailwind v4 utilities — colors ("bg-slate-900", "text-white"), arbitrary values ("bg-[#0f172a]"), gradients ("bg-gradient-to-br from-slate-950 to-violet-950"), opacity ("bg-white/10"), state/responsive variants ("hover:bg-violet-200", "md:text-5xl"). Keep "m-0" on any className that already has it.' ]
			: [] ),
		`Elements (JSON array of ${ args.nodes.length } objects, each { "el": semantic tag, "attrs": current style attributes }):`,
		JSON.stringify( elements ),
		'Return strict JSON: { "items": Array<{ [key: string]: any }> } — exactly the same number of attrs objects, in order.'
	].join( '\n\n' );
};

const parseItems = ( response: string, expected: number ): ( Record<string, unknown> | undefined )[] => {
	const parsed = parseJsonResponse( response );
	const items = parsed && Array.isArray( parsed.items ) ? parsed.items : null;

	if ( ! items ) {
		return [];
	}

	// Map positionally; undefined for anything short or non-object.
	return Array.from( { length: expected }, ( _unused, index ) => {
		const value = items[ index ];

		return isObject( value ) ? value : undefined;
	} );
};

export const runStyleEditTurn = async( args: RunTurnArgs ): Promise<RunTurnResult> => {
	args.onPhase?.( 'refining' );

	const nodes: StyleNode[] = collectStyleNodes( args.referenceBlocks, args.getBlockType );

	const decision: RouteDecision = { mode: 'edit', route: 'style', source: 'model' };

	// No styled elements — no-op so the caller can fall back to a full rewrite.
	if ( ! nodes.length ) {
		return {
			generation: {
				blocks: [],
				plan: emptyPlan(),
				rationale: [],
				diagnostics: { droppedRoots: [] }
			},
			decision,
			toolCall: { tool: 'style', reason: 'No styled elements in selection.' }
		};
	}

	const hasAtomic = args.referenceBlocks.some( function detect( block ): boolean {
		return String( block?.name ).startsWith( 'atomic-wind/' ) ||
			true === ( block?.innerBlocks as BlockProps<unknown>[] | undefined )?.some( detect );
	} );

	const response = await args.requestCompletion(
		buildStyleEditPrompt( {
			nodes,
			instruction: args.instruction,
			taskContext: args.activePrompt,
			sessionHistory: args.sessionHistory,
			themeColors: args.themeColors,
			hasAtomic
		} )
	);

	const items = parseItems( response, nodes.length );

	// How many elements the model actually restyled — drives the rationale.
	const changed = nodes.reduce( ( count, node, index ) => (
		styleNodeChanged( node, items[ index ] ) ? count + 1 : count
	), 0 );

	const blocks: BlockProps<unknown>[] = applyStyleNodes( args.referenceBlocks, nodes, items );

	const validation = validateGeneratedBlocks( blocks, args.getBlockType, { skipRootParentChecks: true } );

	return {
		generation: {
			blocks,
			plan: emptyPlan(),
			rationale: changed ? [ `Restyled ${ changed } element${ 1 === changed ? '' : 's' }.` ] : [],
			diagnostics: {
				droppedRoots: validation.valid
					? []
					: [{ root: { name: 'style', innerBlocks: [] }, errors: validation.errors }]
			}
		},
		decision,
		toolCall: { tool: 'style', reason: args.instruction }
	};
};
