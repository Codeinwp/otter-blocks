/**
 * className extraction and splicing for style-only edits (recolor, restyle,
 * respacing, …). The style analog of text-nodes: instead of round-tripping the
 * whole block markup — which lets the model add, drop, or restructure blocks and
 * balloons the response past the upstream size/latency limit — we pull out only
 * each block's `className`, transform those, and write them back into a clone of
 * the original blocks. Layout, nesting, text, and every other attribute are
 * preserved byte-for-byte because we never send them to the model.
 *
 * This covers atomic-wind/* blocks fully (all their styling lives in Tailwind
 * classes on `className`); blocks that hold color/spacing elsewhere (a `style`
 * object, a `backgroundColor` slug) are only partially covered, so a selection
 * with no classNames at all falls back to the full rewrite.
 */
import type { BlockProps } from '../../../helpers/blocks';
import type { GetBlockType } from './types';
import { cloneBlocksForPreview } from '../apply-content';

// A single editable style target: where it lives (positional path through the
// tree), a short semantic label for the model's context, and its current
// className.
export type ClassNode = {
	path: number[];
	label: string;
	className: string;
};

// A short, human-legible label so the model knows what it is styling — the
// block's semantic tag when set (section, h2, article, span…), otherwise the
// un-namespaced slug (box, text, link, paragraph…).
const labelFor = ( block: BlockProps<unknown> ): string => {
	const tagName = ( block.attributes as Record<string, unknown> | undefined )?.tagName;

	if ( 'string' === typeof tagName && tagName.trim() ) {
		return tagName.trim();
	}

	return String( block.name ).replace( /^.*\//, '' );
};

/**
 * Depth-first list of every block that carries a non-empty `className`, in a
 * deterministic order. Blocks with no className are skipped — a style edit works
 * by transforming existing classes, and echoing blank targets back only bloats
 * the response and invites the model to invent classes on elements it shouldn't.
 */
export const collectClassNodes = (
	blocks: BlockProps<unknown>[],
	getBlockType: GetBlockType,
	path: number[] = []
): ClassNode[] => {
	const nodes: ClassNode[] = [];

	( blocks || [] ).forEach( ( block, index ) => {
		if ( ! block?.name ) {
			return;
		}

		const here = [ ...path, index ];

		// Only blocks whose type actually defines a `className` attribute, and that
		// currently hold a non-empty one.
		const hasClassAttribute = Boolean( getBlockType( block.name )?.attributes?.className );
		const className = ( block.attributes as Record<string, unknown> | undefined )?.className;

		if ( hasClassAttribute && 'string' === typeof className && className.trim() ) {
			nodes.push( { path: here, label: labelFor( block ), className } );
		}

		if ( block.innerBlocks?.length ) {
			nodes.push( ...collectClassNodes( block.innerBlocks as BlockProps<unknown>[], getBlockType, here ) );
		}
	} );

	return nodes;
};

const blockAtPath = (
	blocks: BlockProps<unknown>[],
	path: number[]
): BlockProps<unknown> | undefined => {
	if ( ! path.length ) {
		return undefined;
	}

	let node: BlockProps<unknown> | undefined = blocks[ path[ 0 ] as number ];

	for ( let depth = 1; depth < path.length; depth++ ) {
		const index = path[ depth ] as number;
		const inner = node?.innerBlocks as BlockProps<unknown>[] | undefined;
		node = inner ? inner[ index ] : undefined;
	}

	return node;
};

/**
 * Write transformed classNames back onto a fresh clone of the selection. The
 * clone keeps the exact structure (only clientIds change), so the nodes' paths
 * stay valid and only `className` is replaced. A missing, non-string, or blank
 * replacement leaves the original className untouched — the model never wipes an
 * element's styling by returning nothing.
 */
export const applyClassNodes = (
	blocks: BlockProps<unknown>[],
	nodes: ClassNode[],
	values: ( string | undefined )[]
): BlockProps<unknown>[] => {
	const clone = cloneBlocksForPreview( blocks );

	nodes.forEach( ( node, index ) => {
		const next = values[ index ];

		if ( 'string' !== typeof next || ! next.trim() ) {
			return;
		}

		const target = blockAtPath( clone, node.path );

		if ( target ) {
			const attributes = target.attributes as Record<string, unknown>;
			target.attributes = { ...attributes, className: next.trim() };
		}
	} );

	return clone;
};
