/**
 * Compact block index for AI tool calls — lists every block with a stable id,
 * type, and text preview so the model can target precise operations.
 */

import type { IdentifiedNode } from './block-patches';

const TEXT_ATTR_KEYS = [ 'content', 'text', 'value', 'title', 'label', 'alt', 'url', 'buttonText', 'heading' ] as const;

export type BlockIndexEntry = {
	id: string;
	name: string;
	typeTitle: string;
	summary: string;
	parentId: string;
	depth: number;
};

type GetBlockType = ( name: string ) => { title?: string } | undefined;

const stripHtml = ( value: string ): string => {
	return value.replace( /<[^>]+>/g, ' ' ).replace( /\s+/g, ' ' ).trim();
};

const truncate = ( value: string, max = 60 ): string => {
	if ( value.length <= max ) {
		return value;
	}

	return `${ value.slice( 0, max - 1 ) }…`;
};

const summarizeAttributes = ( attributes: Record<string, unknown> ): string => {
	for ( const key of TEXT_ATTR_KEYS ) {
		const value = attributes[ key ];

		if ( 'string' === typeof value && value.trim() ) {
			return truncate( stripHtml( value.trim() ) );
		}
	}

	return '';
};

const walkIdentifiedTree = (
	nodes: IdentifiedNode[],
	getBlockType: GetBlockType,
	parentId = '',
	depth = 0,
	entries: BlockIndexEntry[] = []
): BlockIndexEntry[] => {
	for ( const node of nodes ) {
		const typeTitle = getBlockType( node.name )?.title || node.name;
		const summary = summarizeAttributes( node.attributes || {} );

		entries.push({
			id: node.id,
			name: node.name,
			typeTitle,
			summary,
			parentId,
			depth
		});

		if ( node.innerBlocks?.length ) {
			walkIdentifiedTree( node.innerBlocks, getBlockType, node.id, depth + 1, entries );
		}
	}

	return entries;
};

/**
 * Build a flat index of every block in an identified tree.
 */
export const buildBlockIndex = (
	idTree: IdentifiedNode[],
	getBlockType: GetBlockType
): BlockIndexEntry[] => {
	return walkIdentifiedTree( idTree, getBlockType );
};

/**
 * Format the block index for model prompts — one line per block.
 */
export const formatBlockIndexForPrompt = ( entries: BlockIndexEntry[] ): string => {
	if ( ! entries.length ) {
		return '';
	}

	const lines = entries.map( ( entry ) => {
		const indent = '  '.repeat( entry.depth );
		const label = entry.summary
			? `${ entry.typeTitle }: "${ entry.summary }"`
			: entry.typeTitle;

		return `${ indent }${ entry.id } | ${ entry.name } | ${ label }`;
	});

	return [
		'Block index (use these ids in tool args):',
		...lines
	].join( '\n' );
};

/**
 * Cap the block index in prompts — defer to search_blocks on large layouts.
 */
export const formatBlockIndexForPromptCapped = (
	entries: BlockIndexEntry[],
	limit = 24
): string => {
	if ( ! entries.length ) {
		return '';
	}

	if ( entries.length <= limit ) {
		return formatBlockIndexForPrompt( entries );
	}

	return [
		formatBlockIndexForPrompt( entries.slice( 0, limit ) ),
		`(${ entries.length } blocks total — use search_blocks to find more)`
	].join( '\n' );
};
