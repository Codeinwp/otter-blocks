/**
 * Text-node extraction and splicing for text-only edits (translate, grammar,
 * tone, …). Instead of round-tripping the whole block markup — which lets the
 * model add, drop, or restructure blocks ("huge chunks of content") — we pull
 * out only the editable text fragments, transform those, and write them back
 * into a clone of the original blocks. Layout, nesting, and every styling
 * attribute are preserved byte-for-byte because we never send them to the model.
 */
import type { BlockProps } from '../../../helpers/blocks';
import type { GetBlockType } from './types';
import { cloneBlocksForPreview } from '../apply-content';

// Attribute "sources" that hold user-facing rich text / copy. These are the only
// attributes a text edit is allowed to touch.
const TEXT_SOURCES = new Set( [ 'html', 'rich-text', 'text' ] );

// A single editable text fragment: where it lives (positional path through the
// tree + attribute key) and its current value.
export type TextNode = {
	path: number[];
	key: string;
	value: string;
};

// Rich-text attributes (source: 'rich-text') are stored in the editor as
// RichTextData objects, not strings — `toHTMLString()` yields the HTML (inline
// tags preserved). Plain string attributes (source: 'html' | 'text') come back
// as-is. Anything else is not editable text.
const readRichText = ( value: unknown ): string | null => {
	if ( 'string' === typeof value ) {
		return value;
	}

	if ( value && 'object' === typeof value && 'function' === typeof ( value as { toHTMLString?: unknown } ).toHTMLString ) {
		try {
			return ( value as { toHTMLString: () => string } ).toHTMLString();
		} catch ( error ) {
			return String( value );
		}
	}

	return null;
};

// Write a transformed fragment back in the SAME shape it was read: a plain
// string stays a string; a RichTextData stays a RichTextData (rebuilt from the
// new HTML via its own constructor, so we never need to import the class).
const writeRichText = ( existing: unknown, html: string ): unknown => {
	if ( 'string' === typeof existing || null === existing || undefined === existing ) {
		return html;
	}

	const ctor = ( existing as { constructor?: { fromHTMLString?: ( value: string ) => unknown } } ).constructor;

	if ( ctor && 'function' === typeof ctor.fromHTMLString ) {
		try {
			return ctor.fromHTMLString( html );
		} catch ( error ) {
			return html;
		}
	}

	return html;
};

const textKeysFor = ( blockName: string, getBlockType: GetBlockType ): string[] => {
	const attributes = getBlockType( blockName )?.attributes ?? {};

	return Object.keys( attributes )
		// Stable order so extraction and write-back always line up by index.
		.sort()
		.filter( ( key ) => TEXT_SOURCES.has( attributes[ key ]?.source as string ) );
};

/**
 * Depth-first list of every editable text fragment in the selection, in a
 * deterministic order. Empty/whitespace-only fragments are skipped so the model
 * never has to echo blanks back.
 */
export const collectTextNodes = (
	blocks: BlockProps<unknown>[],
	getBlockType: GetBlockType,
	path: number[] = []
): TextNode[] => {
	const nodes: TextNode[] = [];

	( blocks || [] ).forEach( ( block, index ) => {
		if ( ! block?.name ) {
			return;
		}

		const here = [ ...path, index ];

		textKeysFor( block.name, getBlockType ).forEach( ( key ) => {
			const value = readRichText( ( block.attributes as Record<string, unknown> | undefined )?.[ key ] );

			if ( null !== value && value.trim() ) {
				nodes.push( { path: here, key, value } );
			}
		} );

		if ( block.innerBlocks?.length ) {
			nodes.push( ...collectTextNodes( block.innerBlocks as BlockProps<unknown>[], getBlockType, here ) );
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
 * Write transformed fragments back onto a fresh clone of the selection. The
 * clone keeps the exact structure (only clientIds change), so the nodes' paths
 * stay valid and only the named text attributes are replaced. Any missing or
 * non-string replacement leaves the original text untouched.
 */
export const applyTextNodes = (
	blocks: BlockProps<unknown>[],
	nodes: TextNode[],
	values: ( string | undefined )[]
): BlockProps<unknown>[] => {
	const clone = cloneBlocksForPreview( blocks );

	nodes.forEach( ( node, index ) => {
		const next = values[ index ];

		if ( 'string' !== typeof next ) {
			return;
		}

		const target = blockAtPath( clone, node.path );

		if ( target ) {
			const attributes = target.attributes as Record<string, unknown>;
			target.attributes = { ...attributes, [ node.key ]: writeRichText( attributes[ node.key ], next ) };
		}
	} );

	return clone;
};
