/**
 * Style-attribute extraction and splicing for style-only edits. The style analog
 * of text-nodes: pull out only each block's style-bearing attributes, transform
 * them, and write them back onto a clone — text, nesting, and non-style attributes
 * stay untouched because the model never sees them. Avoids round-tripping whole
 * markup, which bloats the response past the size/latency limit.
 *
 * Coverage: atomic-wind `className`, standard WP style attributes, and any declared
 * attribute whose name looks like styling. A block with none yields no node, so the
 * caller falls back to the full rewrite.
 */
import type { BlockProps } from '../../../helpers/blocks';
import type { GetBlockType } from './types';
import { isObject } from '../json-utils';
import { cloneBlocksForPreview } from '../apply-content';

// Attribute "sources" that hold user-facing copy — never sent to a style edit.
const TEXT_SOURCES = new Set( [ 'html', 'rich-text', 'text' ] );

// Standard WP style attributes (some, like `style`, don't match the name RE below).
const STANDARD_STYLE_KEYS = new Set( [
	'className', 'style', 'backgroundColor', 'textColor', 'gradient',
	'fontSize', 'fontFamily', 'borderColor', 'align', 'textAlign'
] );

// A declared attribute whose name looks like styling — catches classic Otter's
// flat attrs (headingColor, paddingTop, borderRadius, ...).
const STYLE_NAME_RE = /color|background|gradient|font|padding|margin|border|radius|shadow|width|height|align|opacity|spacing/i;

// Responsive variants (paddingTablet, fontSizeMobile) are skipped — the base value
// usually cascades, and echoing every breakpoint bloats the response.
// base attrs only; a breakpoint-specific restyle falls to the full rewrite.
const RESPONSIVE_SUFFIX_RE = /(?:Tablet|Mobile)$/;

// One element's editable style bundle: positional path, a semantic label, and the
// current values of just its style attributes.
export type StyleNode = {
	path: number[];
	label: string;
	attrs: Record<string, unknown>;
};

// Human-legible label: the block's tagName when set, else the un-namespaced slug.
const labelFor = ( block: BlockProps<unknown> ): string => {
	const tagName = ( block.attributes as Record<string, unknown> | undefined )?.tagName;

	if ( 'string' === typeof tagName && tagName.trim() ) {
		return tagName.trim();
	}

	return String( block.name ).replace( /^.*\//, '' );
};

// The style attribute keys a block type declares, sorted so extraction and write-back line up.
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

// Worth sending? Skip null/undefined, blank strings, and empty objects.
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
 * Depth-first list of blocks carrying at least one set style attribute. Each node
 * holds only style values, never text or structure.
 * @param blocks
 * @param getBlockType
 * @param path
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
 * Write transformed style bundles back onto a clone of the selection. Only the keys
 * we originally sent are merged (no invented attributes, no text/structure change);
 * a missing/blank/wrong-type value leaves that attribute untouched.
 * @param blocks
 * @param nodes
 * @param values
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

			// className must never be blanked; other keys accept any non-null value.
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
