/**
 * Block-tree identity + patching toolkit. Blocks are addressed by a stable
 * index-path id ("0.1.0") so the model can target individual blocks — for
 * refining or quality fixes — without re-emitting the whole tree. Shared by the
 * generation engine and the quality checks so both agree on the same ids.
 */

/**
 * WordPress dependencies.
 */
import type { BlockProps } from '../../helpers/blocks';

/**
 * Internal dependencies.
 */
import type { GeneratedBlockTree } from './block-generation';
import { isObject, parseJsonResponse } from './json-utils';

/**
 * A block tree node tagged with its stable index-path id, plus name and current
 * attributes, ready to hand to the model.
 */
export type IdentifiedNode = {
	id: string;
	name: string;
	attributes: Record<string, unknown>;
	innerBlocks: IdentifiedNode[];
};

export type AttributePatch = {
	id: string;
	attributes: Record<string, unknown>;
};

type BlockTypeLike = {
	attributes?: Record<string, Record<string, unknown>>;
} | undefined;

type GetBlockType = ( name: string ) => BlockTypeLike;

const TEXT_ATTR_ALIASES = [ 'content', 'text', 'value', 'title', 'label' ] as const;

/**
 * The id of the child at `index` under `prefix` — the single source of truth for
 * the index-path scheme, so every walker produces matching ids.
 *
 * @param prefix The parent id, or '' at the root.
 * @param index  The child index.
 */
export const childId = ( prefix: string, index: number ): string => ( prefix ? `${ prefix }.${ index }` : `${ index }` );

/**
 * Serialize native editor blocks into slug + attribute trees, so a prior
 * generation result can be handed to the model as a reference.
 *
 * @param blocks The native blocks.
 */
export const blocksToTrees = ( blocks: BlockProps<unknown>[] ): GeneratedBlockTree[] => {
	return ( blocks || [])
		.filter( block => block?.name )
		.map( block => ({
			name: block.name,
			attributes: block.attributes || {},
			innerBlocks: blocksToTrees( ( block.innerBlocks || []) as BlockProps<unknown>[] )
		}) );
};

/**
 * Tag a tree with index-path ids for the prompt.
 *
 * @param trees  The block trees.
 * @param prefix The parent id (internal recursion).
 */
export const attachIds = ( trees: GeneratedBlockTree[], prefix = '' ): IdentifiedNode[] => {
	return trees.map( ( tree, index ) => {
		const id = childId( prefix, index );
		return {
			id,
			name: tree.name,
			attributes: tree.attributes || {},
			innerBlocks: attachIds( tree.innerBlocks || [], id )
		};
	});
};

/**
 * Merge attribute patches onto the base tree by id. Blocks with no patch are
 * returned untouched, so structure and every unchanged attribute stay exactly
 * as they were.
 *
 * @param trees       The base block trees.
 * @param patchesById Patch attributes keyed by block id.
 * @param prefix      The parent id (internal recursion).
 */
export const applyAttributePatches = (
	trees: GeneratedBlockTree[],
	patchesById: Record<string, Record<string, unknown>>,
	prefix = ''
): GeneratedBlockTree[] => {
	return trees.map( ( tree, index ) => {
		const id = childId( prefix, index );
		const patch = patchesById[ id ];

		return {
			name: tree.name,
			attributes: patch ? { ...( tree.attributes || {}), ...patch } : ( tree.attributes || {}),
			innerBlocks: applyAttributePatches( tree.innerBlocks || [], patchesById, id )
		};
	});
};

/**
 * Build a quick id → attributes lookup from a list of patches.
 *
 * @param patches The patches.
 */
export const patchesToMap = ( patches: AttributePatch[] ): Record<string, Record<string, unknown>> => {
	return patches.reduce<Record<string, Record<string, unknown>>>( ( acc, patch ) => {
		acc[ patch.id ] = patch.attributes;
		return acc;
	}, {});
};

/**
 * Map id-path nodes to block slugs for patch normalization.
 */
export const buildIdToBlockNameMap = ( nodes: IdentifiedNode[] ): Record<string, string> => {
	const map: Record<string, string> = {};

	const walk = ( list: IdentifiedNode[] ) => {
		for ( const node of list ) {
			map[ node.id ] = node.name;

			if ( node.innerBlocks?.length ) {
				walk( node.innerBlocks );
			}
		}
	};

	walk( nodes );

	return map;
};

/**
 * Remap common model mistakes (e.g. `text` on a block that uses `content`) and
 * drop keys that are not registered on the block type.
 */
export const normalizePatchAttributes = (
	blockName: string,
	attributes: Record<string, unknown>,
	getBlockType: GetBlockType
): Record<string, unknown> => {
	const blockType = getBlockType( blockName );

	if ( ! blockType?.attributes ) {
		return {};
	}

	const allowed = blockType.attributes;
	const normalized: Record<string, unknown> = { ...attributes };

	for ( const [ key, value ] of Object.entries( attributes ) ) {
		if ( key in allowed ) {
			continue;
		}

		const aliasTarget = TEXT_ATTR_ALIASES.find(
			( candidate ) => candidate in allowed && candidate !== key
		);

		if ( aliasTarget ) {
			normalized[ aliasTarget ] = value;
			delete normalized[ key ];
		}
	}

	const filtered: Record<string, unknown> = {};

	for ( const [ key, value ] of Object.entries( normalized ) ) {
		if ( key in allowed ) {
			filtered[ key ] = value;
		}
	}

	return filtered;
};

/**
 * Merge patches onto live editor blocks by index-path id, preserving clientIds
 * and nesting so parent/child context stays intact on apply.
 */
export const applyPatchesToBlocks = (
	baseBlocks: BlockProps<unknown>[],
	patches: AttributePatch[],
	prefix = ''
): BlockProps<unknown>[] => {
	const patchesById = patchesToMap( patches );

	return ( baseBlocks || [] ).map( ( block, index ) => {
		const id = childId( prefix, index );
		const patchAttributes = patchesById[ id ];
		const innerBlocks = applyPatchesToBlocks(
			( block.innerBlocks || [] ) as BlockProps<unknown>[],
			patches,
			id
		);

		return {
			...block,
			attributes: patchAttributes
				? { ...( block.attributes || {}), ...patchAttributes }
				: ( block.attributes || {}),
			innerBlocks
		};
	});
};

/**
 * Parse a `{ "patches": [ { id, attributes } ] }` response, dropping entries
 * with no id or no attributes.
 *
 * @param response The raw model response.
 */
export const parsePatchPayload = ( response: string ): AttributePatch[] => {
	const parsed = parseJsonResponse( response );

	if ( ! parsed || ! Array.isArray( parsed.patches ) ) {
		return [];
	}

	return ( parsed.patches.filter( isObject ) as Record<string, unknown>[] )
		.map( patch => {
			const id = 'string' === typeof patch.id
				? patch.id
				: ( 'number' === typeof patch.id ? String( patch.id ) : '' );

			return {
				id,
				attributes: isObject( patch.attributes ) ? patch.attributes : {}
			};
		})
		.filter( patch => patch.id && Object.keys( patch.attributes ).length );
};
