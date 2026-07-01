/**
 * Style-only edit turn. Sends just each block's className (never the markup) and
 * writes the transformed classNames back into a clone of the original blocks. The
 * result is guaranteed to be the same blocks — same layout, same nesting, same
 * copy — with only their styling classes changed. The model cannot add, remove,
 * or reword anything because it never sees or returns any markup or text.
 *
 * This is the style analog of run-text-edit, and it exists to keep a recolor /
 * restyle off the whole-markup REWRITE path: the response is bounded by the
 * number of classNames (not the full serialized tree), so it never truncates or
 * trips the upstream size/latency limit that a large rewrite hits.
 */
import { validateGeneratedBlocks } from '../block-generation';
import type { ThemeColor } from '../block-generation';
import { parseJsonResponse } from '../json-utils';
import { formatSessionHistoryForPrompt } from '../session-history';
import { PIPELINE_STEP } from '../prompts/phases';
import type { BlockProps } from '../../../helpers/blocks';
import { applyClassNodes, collectClassNodes } from './class-nodes';
import type { ClassNode } from './class-nodes';
import type { RouteDecision, RunTurnArgs, RunTurnResult } from './types';

const emptyPlan = () => ( { mission: '', design: {}, rationale: [], roots: [] } );

const formatPalette = ( colors: ThemeColor[] ): string =>
	colors
		.filter( ( color ) => color?.slug && color?.color )
		.map( ( color ) => `${ color.slug } (${ color.color })${ color.name ? ` — ${ color.name }` : '' }` )
		.join( '\n' );

export const buildStyleEditPrompt = ( args: {
	nodes: ClassNode[];
	instruction: string;
	taskContext?: string;
	sessionHistory: string[];
	themeColors: ThemeColor[];
	hasAtomic: boolean;
} ): string => {
	const palette = formatPalette( args.themeColors );

	// Only the label + className go to the model — never the text or structure.
	const elements = args.nodes.map( ( node ) => ( { el: node.label, class: node.className } ) );

	return [
		PIPELINE_STEP.STYLE_EDIT,
		...formatSessionHistoryForPrompt( args.sessionHistory ),
		...( args.taskContext && args.taskContext !== args.instruction ? [ `Original task for context: ${ args.taskContext }` ] : [] ),
		`Apply this styling change to every element: ${ args.instruction }`,
		'Rules:',
		[
			`- Return EXACTLY ${ args.nodes.length } items, in the same order. Never add, remove, split, merge, or reorder items.`,
			'- Each item is the COMPLETE updated className string for that element — not a diff, not a fragment.',
			'- Change only styling: colors, backgrounds, borders, shadows, spacing, sizing, typography. Keep the layout/structure classes (flex, grid, gap, positioning) unless the change requires them.',
			'- Keep every class a valid Tailwind v4 utility, and keep text readable against its background.',
			'- If an element should not change, return its className unchanged.'
		].join( '\n' ),
		...( palette ? [ `Prefer these theme color slugs where they fit:\n${ palette }` ] : [] ),
		...( args.hasAtomic
			? [ 'These are Atomic Wind blocks: styling is Tailwind v4 utilities on "className" — colors ("bg-slate-900", "text-white"), arbitrary values ("bg-[#0f172a]"), gradients ("bg-gradient-to-br from-slate-950 to-violet-950"), opacity ("bg-white/10"), state/responsive variants ("hover:bg-violet-200", "md:text-5xl"). Keep "m-0" on any element that already has it.' ]
			: [] ),
		`Elements (JSON array of ${ args.nodes.length } objects, each { "el": semantic tag, "class": current className }):`,
		JSON.stringify( elements ),
		'Return strict JSON: { "items": string[] } with exactly the same number of className strings, in order.'
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

export const runStyleEditTurn = async( args: RunTurnArgs ): Promise<RunTurnResult> => {
	args.onPhase?.( 'refining' );

	const nodes: ClassNode[] = collectClassNodes( args.referenceBlocks, args.getBlockType );

	const decision: RouteDecision = { mode: 'edit', route: 'style', source: 'model' };

	// No styled elements in the selection — nothing a className edit can do.
	// Surface as a no-op so the caller can fall back to a full rewrite.
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

	// How many classNames the model actually changed — drives the rationale.
	const changed = items.reduce( ( count, value, index ) => (
		'string' === typeof value && value.trim() && value.trim() !== nodes[ index ]?.className ? count + 1 : count
	), 0 );

	const blocks: BlockProps<unknown>[] = applyClassNodes( args.referenceBlocks, nodes, items );

	const validation = validateGeneratedBlocks( blocks, args.getBlockType, { skipRootParentChecks: true } );

	return {
		generation: {
			blocks,
			plan: emptyPlan(),
			rationale: changed ? [ `Restyled ${ changed } element${ 1 === changed ? '' : 's' }.` ] : [],
			diagnostics: {
				droppedRoots: validation.valid
					? []
					: [ { root: { name: 'style', innerBlocks: [] }, errors: validation.errors } ]
			}
		},
		decision,
		toolCall: { tool: 'style', reason: args.instruction }
	};
};
