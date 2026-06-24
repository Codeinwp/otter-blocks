/**
 * Fuzzy search over layout blocks and the insertable block catalog — find existing
 * block ids or block slugs to insert (e.g. progress bar at the bottom).
 */

import Fuse from 'fuse.js';

import type { BlockTypeLike } from './agent/types';
import { buildStructureCatalog, type StructureCatalogEntry } from './block-generation';
import type { BlockIndexEntry } from './block-index';

export const BLOCK_SEARCH_RESULT_LIMIT = 6;

export type CatalogSearchEntry = StructureCatalogEntry & {
	title: string;
};

export type BlockSearchScope = 'layout' | 'catalog' | 'all';

export type SearchBlocksArgs = {
	query?: string;
	type?: string;
	scope?: BlockSearchScope;
};

export type BlockSearchResults = {
	layout: BlockIndexEntry[];
	catalog: CatalogSearchEntry[];
};

const QUERY_STOPWORDS = new Set([
	'a', 'an', 'the', 'with', 'and', 'or', 'on', 'in', 'of', 'for', 'to', 'that', 'block', 'blocks'
]);

const queryTerms = ( query: string ): string[] =>
	query
		.toLowerCase()
		.split( /\s+/ )
		.map( ( word ) => word.replace( /[^\w-]/g, '' ) )
		.filter( ( word ) => 2 <= word.length && ! QUERY_STOPWORDS.has( word ) );

const filterByType = <T extends { name?: string; slug?: string; typeTitle?: string; title?: string }>(
	entries: T[],
	type: string
): T[] => {
	const normalized = type.toLowerCase().trim();

	return entries.filter( ( entry ) => {
		const slug = entry.slug || entry.name || '';
		const label = entry.typeTitle || entry.title || '';

		return slug.toLowerCase().includes( normalized ) || label.toLowerCase().includes( normalized );
	});
};

const rankByQuery = <T extends { id?: string; slug?: string }>(
	entries: T[],
	query: string,
	keys: { name: keyof T & string; weight: number }[]
): T[] => {
	const terms = queryTerms( query );

	if ( ! terms.length ) {
		return entries;
	}

	const index = new Fuse( entries, {
		keys,
		includeScore: true,
		threshold: 0.4,
		ignoreLocation: true,
		minMatchCharLength: 2
	});

	let scores: Map<string, number> | null = null;

	terms.forEach( ( term ) => {
		const termScores = new Map<string, number>();

		index.search( term ).forEach( ( result ) => {
			const key = result.item.id || result.item.slug || '';

			if ( key && ( ! scores || scores.has( key ) ) ) {
				termScores.set( key, ( scores?.get( key ) || 0 ) + ( result.score || 0 ) );
			}
		});

		scores = termScores;
	});

	if ( ! scores?.size ) {
		return [];
	}

	const byKey = new Map(
		entries.map( ( entry ) => [ entry.id || entry.slug || '', entry ] )
	);

	return [ ...scores.entries() ]
		.sort( ( a, b ) => a[ 1 ] - b[ 1 ] )
		.map( ( [ key ] ) => byKey.get( key ) )
		.filter( ( entry ): entry is T => !! entry );
};

/**
 * Build searchable catalog entries from registered block types.
 */
export const buildCatalogSearchEntries = (
	blockTypes: BlockTypeLike[]
): CatalogSearchEntry[] => {
	const titles = new Map(
		blockTypes.map( ( blockType ) => [ blockType.name, blockType.title || blockType.name ] )
	);

	return buildStructureCatalog( blockTypes ).map( ( entry ) => ({
		...entry,
		title: titles.get( entry.slug ) || entry.slug
	}) );
};

const searchLayoutBlocks = (
	entries: BlockIndexEntry[],
	args: SearchBlocksArgs
): BlockIndexEntry[] => {
	let results = entries;

	if ( args.type?.trim() ) {
		results = filterByType( results, args.type );
	}

	if ( args.query?.trim() ) {
		results = rankByQuery( results, args.query, [
			{ name: 'summary', weight: 3 },
			{ name: 'typeTitle', weight: 2 },
			{ name: 'name', weight: 2 },
			{ name: 'id', weight: 1 }
		]);
	}

	return results.slice( 0, BLOCK_SEARCH_RESULT_LIMIT );
};

const searchCatalogBlocks = (
	entries: CatalogSearchEntry[],
	args: SearchBlocksArgs
): CatalogSearchEntry[] => {
	let results = entries;

	if ( args.type?.trim() ) {
		results = filterByType( results, args.type );
	}

	if ( args.query?.trim() ) {
		results = rankByQuery( results, args.query, [
			{ name: 'title', weight: 3 },
			{ name: 'description', weight: 2 },
			{ name: 'slug', weight: 2 }
		]);
	}

	return results.slice( 0, BLOCK_SEARCH_RESULT_LIMIT );
};

/**
 * Search layout blocks and/or the insertable block catalog.
 */
export const searchBlocks = (
	layoutEntries: BlockIndexEntry[],
	catalogEntries: CatalogSearchEntry[],
	args: SearchBlocksArgs = {}
): BlockSearchResults => {
	const scope = args.scope || 'all';

	return {
		layout: 'catalog' === scope ? [] : searchLayoutBlocks( layoutEntries, args ),
		catalog: 'layout' === scope ? [] : searchCatalogBlocks( catalogEntries, args )
	};
};

/** @deprecated Use searchBlocks — kept for direct layout-only callers. */
export const searchBlockIndex = (
	entries: BlockIndexEntry[],
	args: SearchBlocksArgs = {}
): BlockIndexEntry[] => searchBlocks( entries, [], { ...args, scope: 'layout' } ).layout;

export const formatBlockSearchEntry = ( entry: BlockIndexEntry ): string => {
	const label = entry.summary
		? `${ entry.typeTitle }: "${ entry.summary }"`
		: entry.typeTitle;

	return `${ entry.id } | ${ entry.name } | ${ label }`;
};

export const formatCatalogSearchEntry = ( entry: CatalogSearchEntry ): string => {
	const container = entry.container ? ' [container]' : '';

	return `${ entry.slug }: ${ entry.title } — ${ entry.description }${ container }`;
};

/**
 * Format block search hits for tool output or a follow-up tool-call prompt.
 */
export const formatBlockSearchResults = ( results: BlockSearchResults ): string => {
	const sections: string[] = [];

	if ( results.layout.length ) {
		sections.push(
			'Blocks in layout (use ids in patch or structure args):',
			...results.layout.map( formatBlockSearchEntry )
		);
	}

	if ( results.catalog.length ) {
		sections.push(
			'Available block types (use slug as block.name in structure.insert):',
			...results.catalog.map( formatCatalogSearchEntry )
		);
	}

	if ( ! sections.length ) {
		return 'No matching blocks found.';
	}

	return sections.join( '\n' );
};
