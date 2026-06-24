/**
 * WordPress dependencies.
 */
import type { BlockProps } from '../../helpers/blocks';

/**
 * Internal dependencies.
 */
import { childId } from './block-patches';
import type { GeneratedBlockTree } from './block-generation';
import { isObject, parseJsonResponse } from './json-utils';

export type StructureInsert = {
	parentId: string;
	index: number;
	block: GeneratedBlockTree;
};

export type StructureMove = {
	id: string;
	parentId: string;
	index: number;
};

export type StructureEditPayload = {
	remove?: string[];
	insert?: StructureInsert[];
	move?: StructureMove[];
};

type ExtractResult = {
	blocks: BlockProps<unknown>[];
	extracted: BlockProps<unknown> | null;
};

/**
 * Parse a structure-edit response into remove / insert / move operations.
 */
export const parseStructureEditPayload = ( response: string ): StructureEditPayload => {
	const parsed = parseJsonResponse( response );

	if ( ! parsed || ! isObject( parsed ) ) {
		return {};
	}

	const remove = Array.isArray( parsed.remove )
		? parsed.remove
			.map( ( id ) => ( 'number' === typeof id ? String( id ) : id ) )
			.filter( ( id ): id is string => 'string' === typeof id && Boolean( id.trim() ) )
		: undefined;

	const insert = Array.isArray( parsed.insert )
		? ( parsed.insert.filter( isObject ) as Record<string, unknown>[] )
			.map( ( entry ) => {
				const parentId = 'string' === typeof entry.parentId
					? entry.parentId
					: ( 'number' === typeof entry.parentId ? String( entry.parentId ) : '' );
				const index = 'number' === typeof entry.index ? entry.index : 0;
				const block = isObject( entry.block ) ? entry.block as GeneratedBlockTree : null;

				if ( ! block?.name ) {
					return null;
				}

				return {
					parentId,
					index: Math.max( 0, index ),
					block
				};
			})
			.filter( ( entry ): entry is StructureInsert => Boolean( entry ) )
		: undefined;

	const move = Array.isArray( parsed.move )
		? ( parsed.move.filter( isObject ) as Record<string, unknown>[] )
			.map( ( entry ) => {
				const id = 'string' === typeof entry.id
					? entry.id
					: ( 'number' === typeof entry.id ? String( entry.id ) : '' );
				const parentId = 'string' === typeof entry.parentId
					? entry.parentId
					: ( 'number' === typeof entry.parentId ? String( entry.parentId ) : '' );
				const index = 'number' === typeof entry.index ? entry.index : 0;

				if ( ! id ) {
					return null;
				}

				return {
					id,
					parentId,
					index: Math.max( 0, index )
				};
			})
			.filter( ( entry ): entry is StructureMove => Boolean( entry ) )
		: undefined;

	return {
		remove: remove?.length ? remove : undefined,
		insert: insert?.length ? insert : undefined,
		move: move?.length ? move : undefined
	};
};

/**
 * Remove blocks by index-path id. Removing a parent removes its subtree.
 */
export const applyStructureRemovals = (
	blocks: BlockProps<unknown>[],
	removeIds: string[],
	prefix = ''
): BlockProps<unknown>[] => {
	const removeSet = new Set( removeIds );

	return blocks.flatMap( ( block, index ) => {
		const id = childId( prefix, index );

		if ( removeSet.has( id ) ) {
			return [];
		}

		return [{
			...block,
			innerBlocks: applyStructureRemovals(
				( block.innerBlocks || [] ) as BlockProps<unknown>[],
				removeIds,
				id
			)
		}];
	});
};

/**
 * Detach a single block by id, returning the updated tree and extracted block.
 */
export const extractBlockById = (
	blocks: BlockProps<unknown>[],
	targetId: string,
	prefix = ''
): ExtractResult => {
	let extracted: BlockProps<unknown> | null = null;

	const walk = ( list: BlockProps<unknown>[], currentPrefix: string ): BlockProps<unknown>[] => {
		const next: BlockProps<unknown>[] = [];

		list.forEach( ( block, index ) => {
			const id = childId( currentPrefix, index );

			if ( id === targetId ) {
				extracted = block;
				return;
			}

			next.push({
				...block,
				innerBlocks: walk(
					( block.innerBlocks || [] ) as BlockProps<unknown>[],
					id
				)
			});
		});

		return next;
	};

	return {
		blocks: walk( blocks, prefix ),
		extracted
	};
};

/**
 * Insert blocks at a parent id (empty string = root) and sibling index.
 */
export const insertIntoBlockTree = (
	blocks: BlockProps<unknown>[],
	parentId: string,
	index: number,
	newBlocks: BlockProps<unknown>[],
	prefix = ''
): BlockProps<unknown>[] => {
	if ( '' === parentId ) {
		const next = [ ...blocks ];
		next.splice( index, 0, ...newBlocks );
		return next;
	}

	return blocks.map( ( block, blockIndex ) => {
		const id = childId( prefix, blockIndex );

		if ( id === parentId ) {
			const inner = [ ...( ( block.innerBlocks || [] ) as BlockProps<unknown>[] ) ];
			inner.splice( index, 0, ...newBlocks );

			return {
				...block,
				innerBlocks: inner
			};
		}

		return {
			...block,
			innerBlocks: insertIntoBlockTree(
				( block.innerBlocks || [] ) as BlockProps<unknown>[],
				parentId,
				index,
				newBlocks,
				id
			)
		};
	});
};

/**
 * Apply remove → move → insert operations in order.
 */
export const applyStructureEdits = (
	baseBlocks: BlockProps<unknown>[],
	payload: StructureEditPayload,
	createBlocksFromTrees: ( trees: GeneratedBlockTree[] ) => BlockProps<unknown>[]
): BlockProps<unknown>[] => {
	let blocks = baseBlocks;

	if ( payload.remove?.length ) {
		blocks = applyStructureRemovals( blocks, payload.remove );
	}

	for ( const move of payload.move || [] ) {
		const { blocks: remaining, extracted } = extractBlockById( blocks, move.id );

		if ( extracted ) {
			blocks = insertIntoBlockTree( remaining, move.parentId, move.index, [ extracted ] );
		}
	}

	for ( const insert of payload.insert || [] ) {
		const newBlocks = createBlocksFromTrees([ insert.block ]);

		if ( newBlocks.length ) {
			blocks = insertIntoBlockTree( blocks, insert.parentId, insert.index, newBlocks );
		}
	}

	return blocks;
};

export const hasStructureEdits = ( payload: StructureEditPayload ): boolean => {
	return Boolean(
		payload.remove?.length ||
		payload.insert?.length ||
		payload.move?.length
	);
};
