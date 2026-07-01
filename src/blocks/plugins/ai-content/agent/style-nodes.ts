/**
 * Style-attribute extraction and splicing for style-only edits (recolor, restyle,
 * respacing, …). The style analog of text-nodes: instead of round-tripping the
 * whole block markup — which lets the model add, drop, or restructure blocks and
 * balloons the response past the upstream size/latency limit — we pull out only
 * each block's STYLE-BEARING attributes, transform those, and write them back
 * into a clone of the original blocks. Nesting, text, and every non-style
 * attribute are preserved byte-for-byte because we never send them to the model.
 *
 * Coverage is not limited to atomic-wind's `className`: it also picks up the
 * standard WordPress style attributes (`style`, `backgroundColor`, `textColor`,
 * `fontSize`, …) and any attribute a classic/Otter block *declares* whose name
 * looks like styling (`headingColor`, `padding`, `borderRadius`, …). A block that
 * exposes no style attributes at all yields no node, so the caller falls back to
 * the full rewrite.
 */
import type { BlockProps } from '../../../helpers/blocks';
import type { GetBlockType } from './types';
import { isObject } from '../json-utils';
import { cloneBlocksForPreview } from '../apply-content';

// Attribute "sources" that hold user-facing copy — never sent to a style edit.
const TEXT_SOURCES = new Set( [ 'html', 'rich-text', 'text' ] );

// Standard WordPress style attributes, always included when a block declares
// them (some — like `style` — don't match the name pattern below).
const STANDARD_STYLE_KEYS = new Set( [
	'className', 'style', 'backgroundColor', 'textColor', 'gradient',
	'fontSize', 'fontFamily', 'borderColor', 'align', 'textAlign'
] );

// A declared attribute whose NAME looks like styling. Catches the flat attributes
// classic Otter blocks use (headingColor, highlightBackground, paddingTop,
// fontVariant, borderRadius, boxShadow, …).
const STYLE_NAME_RE = /color|background|gradient|font|padding|margin|border|radius|shadow|width|height|align|opacity|spacing/i;

// Responsive variants (paddingTablet, fontSizeMobile) are skipped — the base
// value usually cascades, and echoing every breakpoint back only bloats the
// response and risks malformed nested objects.
// ponytail: base attrs only. If a restyle needs to target a specific breakpoint,
// that block falls through to the full rewrite.
const RESPONSIVE_SUFFIX_RE = /(?:Tablet|Mobile)$/;

// A single element's editable style bundle: where it lives (positional path), a
// short semantic label for the model's context, and the current values of just
// its style attributes.
export type StyleNode = {
	path: number[];
	label: string;
	attrs: Record<string, unknown>;
};

// A short, human-legible label so the model knows what it is styling — the
// block's semantic tag when set (section, h2, article, span…), otherwise the
// un-namespaced slug (box, text, link, advanced-heading…).
const labelFor = ( block: BlockProps<unknown> ): string => {
	const tagName = ( block.attributes as Record<string, unknown> | undefined )?.tagName;

	if ( 'string' === typeof tagName && tagName.trim() ) {
		return tagName.trim();
	}

	return String( block.name ).replace( /^.*\//, '' );
};

// The style attribute keys a block type declares, in a stable order so
// extraction and write-back always line up.
const styleKeysFor = ( blockName: string, getBlockType: GetBlockType ): string[] => {
	const attributes = getBlockType( blockName )?.attributes ?? {};

	return Object.keys( attributes )
		.sort()
		.filter( ( key ) => {
			const source = attributes[ key ]?.source as string | undefined;

			if ( TEXT_SOURCES.has( source ?? '' ) || RESPONSIVE_SUFFIX_RE.test( key ) ) {
				return false;
			}

			return STANDARD_STYLE_KEYS.has( key ) || STYLE_NAME_RE.test( key );
		} );
};

// Whether a value is worth sending: skip undefined/null, blank strings, and empty
// objects, so the bundle only carries styling the block actually has set.
const isMeaningful = ( value: unknown ): boolean => {
	if ( undefined === value || null === value ) {
		return false;
	}

	if ( 'string' === typeof value ) {
		return '' !== value.trim();
	}

	if ( isObject( value ) ) {
		return 0 < Object.keys( value ).length;
	}

	return true;
};

/**
 * Depth-first list of every block that carries at least one set style attribute,
 * in a deterministic order. Each node holds only that block's style values —
 * never its text or structure.
 */
export const collectStyleNodes = (
	blocks: BlockProps<unknown>[],
	getBlockType: GetBlockType,
	path: number[] = []
): StyleNode[] => {
	const nodes: StyleNode[] = [];

	( blocks || [] ).forEach( ( block, index ) => {
		if ( ! block?.name ) {
			return;
		}

		const here = [ ...path, index ];
		const source = block.attributes as Record<string, unknown> | undefined;
		const attrs: Record<string, unknown> = {};

		styleKeysFor( block.name, getBlockType ).forEach( ( key ) => {
			const value = source?.[ key ];

			if ( isMeaningful( value ) ) {
				attrs[ key ] = value;
			}
		} );

		if ( Object.keys( attrs ).length ) {
			nodes.push( { path: here, label: labelFor( block ), attrs } );
		}

		if ( block.innerBlocks?.length ) {
			nodes.push( ...collectStyleNodes( block.innerBlocks as BlockProps<unknown>[], getBlockType, here ) );
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
 * Write transformed style bundles back onto a fresh clone of the selection. Only
 * the keys we originally sent for a node are merged — the model can neither
 * invent new attributes nor touch text/structure — and a missing/blank/wrong-type
 * value leaves that attribute untouched.
 */
export const applyStyleNodes = (
	blocks: BlockProps<unknown>[],
	nodes: StyleNode[],
	values: ( Record<string, unknown> | undefined )[]
): BlockProps<unknown>[] => {
	const clone = cloneBlocksForPreview( blocks );

	nodes.forEach( ( node, index ) => {
		const next = values[ index ];

		if ( ! isObject( next ) ) {
			return;
		}

		const target = blockAtPath( clone, node.path );

		if ( ! target ) {
			return;
		}

		const merged = { ...( target.attributes as Record<string, unknown> ) };

		// Only the keys we sent for this node are candidates for update.
		Object.keys( node.attrs ).forEach( ( key ) => {
			if ( ! ( key in next ) ) {
				return;
			}

			const value = next[ key ];

			// className must never be blanked; other keys accept any non-null value
			// (string, number, object) as long as the model returned it.
			if ( 'className' === key ) {
				if ( 'string' === typeof value && value.trim() ) {
					merged[ key ] = value.trim();
				}

				return;
			}

			if ( undefined !== value && null !== value ) {
				merged[ key ] = value;
			}
		} );

		target.attributes = merged;
	} );

	return clone;
};

// Whether a returned bundle changed any of the keys it was sent — drives the
// "Restyled N elements" rationale.
export const styleNodeChanged = ( node: StyleNode, next: unknown ): boolean => {
	if ( ! isObject( next ) ) {
		return false;
	}

	return Object.keys( node.attrs ).some( ( key ) => (
		key in next && JSON.stringify( next[ key ] ) !== JSON.stringify( node.attrs[ key ] )
	) );
};
