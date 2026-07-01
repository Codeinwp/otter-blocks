/**
 * WordPress dependencies.
 */
import { cloneBlock, serialize } from '@wordpress/blocks';
import { select } from '@wordpress/data';

/**
 * Internal dependencies.
 */
import type { BlockProps } from '../../helpers/blocks';

const RICHTEXT_BLOCKS = [
	'core/paragraph',
	'core/heading'
];

const EDITOR_INTERNAL_ATTR_KEYS = new Set([ 'source', 'selector', 'attribute', 'role', 'meta' ]);

type BlockTypeLike = {
	attributes?: Record<string, Record<string, unknown>>
} | undefined;

type GetBlockType = ( name: string ) => BlockTypeLike;

/** Schema registry (by block type) + instance tree (by block id). */
export type BlockSchemaPayload = {
	schemas: Record<string, Record<string, Record<string, unknown>>>;
	tree: Record<string, BlockTreeNode>;
};

export type BlockTreeNode = {
	type: string;
	innerBlocks?: Record<string, BlockTreeNode>;
};

export const isRichTextBlock = ( blockName?: string ) => {
	return Boolean( blockName && RICHTEXT_BLOCKS.includes( blockName ) );
};

/**
 * Deep-clone editor blocks (attributes + innerBlocks) for modal preview and edit
 * references. BlockPreview needs detached copies with fresh clientIds.
 *
 * @param blocks Blocks from the editor selection or a prior result.
 */
export const cloneBlocksForPreview = ( blocks: BlockProps<unknown>[] ): BlockProps<unknown>[] => {
	return ( blocks || [] ).map( ( block ) =>
		cloneBlock( block as Parameters<typeof cloneBlock>[0] )
	);
};

const sanitizeAttributeDefinition = ( attr: Record<string, unknown> ): Record<string, unknown> => {
	const sanitized: Record<string, unknown> = {};

	for ( const [ key, value ] of Object.entries( attr ) ) {
		if ( ! EDITOR_INTERNAL_ATTR_KEYS.has( key ) ) {
			sanitized[ key ] = value;
		}
	}

	return sanitized;
};

export const getBlockInstanceKey = ( block: BlockProps<unknown> ): string => {
	const id = block.attributes?.id;

	if ( 'string' === typeof id && id ) {
		return id;
	}

	return block.clientId;
};

const isSerializedAttribute = ( attrDef: Record<string, unknown> ): boolean => {
	return ! attrDef.source;
};

const getSchemaForType = (
	name: string,
	getBlockType: GetBlockType
): Record<string, Record<string, unknown>> => {
	const blockType = getBlockType( name );

	if ( ! blockType?.attributes ) {
		return {};
	}

	const attrs: Record<string, Record<string, unknown>> = {};

	for ( const [ attrName, attrDef ] of Object.entries( blockType.attributes ) ) {
		if ( ! attrDef || 'object' !== typeof attrDef ) {
			continue;
		}

		if ( ! isSerializedAttribute( attrDef as Record<string, unknown> ) ) {
			continue;
		}

		attrs[ attrName ] = sanitizeAttributeDefinition( attrDef as Record<string, unknown> );
	}

	return attrs;
};

const buildTreeNode = (
	block: BlockProps<unknown>
): BlockTreeNode => {
	const node: BlockTreeNode = {
		type: block.name || ''
	};

	if ( block.innerBlocks?.length ) {
		node.innerBlocks = {};

		for ( const innerBlock of block.innerBlocks as BlockProps<unknown>[] ) {
			const key = getBlockInstanceKey( innerBlock );
			node.innerBlocks[ key ] = buildTreeNode( innerBlock );
		}
	}

	return node;
};

const collectTypesFromTree = ( node: BlockTreeNode, types: Set<string> ) => {
	if ( node.type ) {
		types.add( node.type );
	}

	if ( node.innerBlocks ) {
		for ( const child of Object.values( node.innerBlocks ) ) {
			collectTypesFromTree( child, types );
		}
	}
};

export const buildBlockSchemaPayload = (
	blocks: BlockProps<unknown>[],
	getBlockType: GetBlockType
): BlockSchemaPayload | null => {
	const tree: Record<string, BlockTreeNode> = {};
	const types = new Set<string>();

	for ( const block of blocks ) {
		const key = getBlockInstanceKey( block );
		const node = buildTreeNode( block );
		tree[ key ] = node;
		collectTypesFromTree( node, types );
	}

	if ( 0 === Object.keys( tree ).length ) {
		return null;
	}

	const schemas: Record<string, Record<string, Record<string, unknown>>> = {};

	for ( const type of types ) {
		const schema = getSchemaForType( type, getBlockType );

		if ( 0 < Object.keys( schema ).length ) {
			schemas[ type ] = schema;
		}
	}

	return {
		schemas,
		tree
	};
};

/**
 * Build the default context the chat attaches for the selected block(s): the
 * serialized block markup plus a schema map deduplicated by block type and the
 * instance tree of the selection and its inner blocks. This replaces magic tags
 * — the model receives the structure of any block type automatically.
 *
 * @param {import('../../helpers/blocks').BlockProps<unknown>[]} blocks       The selected blocks.
 * @param {GetBlockType}                                         getBlockType Optional block-type resolver.
 * @return {string} The context message, or an empty string when there is nothing to describe.
 */
export const buildBlockContextMessage = (
	blocks: BlockProps<unknown>[],
	getBlockType?: GetBlockType
): string => {
	if ( ! blocks?.length ) {
		return '';
	}

	const markup = extractBlockMarkup( blocks );
	const resolveBlockType: GetBlockType = getBlockType ?? ( ( name ) => select( 'core/blocks' )?.getBlockType( name ) );
	const payload = buildBlockSchemaPayload( blocks, resolveBlockType );

	const parts: string[] = [];

	if ( markup.trim() ) {
		parts.push( 'Selected block markup (Gutenberg block comment syntax):', markup );
	}

	if ( payload ) {
		parts.push(
			'',
			'Block schema (deduplicated by block type) and the instance tree of the selection and its inner blocks:',
			JSON.stringify( payload, null, 2 )
		);
	}

	return parts.join( '\n' );
};

export const extractBlockTextContent = ( source: BlockProps<unknown> | BlockProps<unknown>[] ): string => {
	if ( Array.isArray( source ) ) {
		return source.reduce( ( content: string, block: BlockProps<unknown> ) => {
			return content + extractBlockTextContent( block );
		}, '' );
	}

	if ( isRichTextBlock( source.name ) ) {
		return ( source.attributes?.content as string ) || '';
	}

	return '';
};

export const extractBlockMarkup = ( blocks: BlockProps<unknown>[] ): string => {
	if ( ! blocks.length ) {
		return '';
	}

	try {
		return serialize( blocks as Parameters<typeof serialize>[0] );
	} catch {
		return '';
	}
};

const mergeAllowedAttributes = (
	targetAttributes: Record<string, unknown> | undefined,
	previewAttributes: Record<string, unknown> | undefined,
	blockType: BlockTypeLike
): Record<string, unknown> => {
	const base = { ...( targetAttributes || {}) };

	if ( ! previewAttributes || ! blockType?.attributes ) {
		return base;
	}

	for ( const [ key, value ] of Object.entries( previewAttributes ) ) {
		if ( key in blockType.attributes ) {
			base[ key ] = value;
		}
	}

	return base;
};

/**
 * Whether two block trees share the same slug nesting (same shape, no add/remove).
 * @param editorBlocks
 * @param previewBlocks
 */
export const blocksStructureMatches = (
	editorBlocks: BlockProps<unknown>[],
	previewBlocks: BlockProps<unknown>[]
): boolean => {
	if ( editorBlocks.length !== previewBlocks.length ) {
		return false;
	}

	return editorBlocks.every( ( editorBlock, index ) => {
		const previewBlock = previewBlocks[ index ];

		if ( ! previewBlock || editorBlock.name !== previewBlock.name ) {
			return false;
		}

		return blocksStructureMatches(
			( editorBlock.innerBlocks || [] ) as BlockProps<unknown>[],
			( previewBlock.innerBlocks || [] ) as BlockProps<unknown>[]
		);
	});
};

/**
 * Copy attributes from the preview clone onto live editor blocks, preserving
 * editor clientIds and nesting. Used when transform edits keep the same shape.
 * @param editorBlocks
 * @param previewBlocks
 * @param getBlockType
 */
export const mergePreviewCloneOntoBlocks = (
	editorBlocks: BlockProps<unknown>[],
	previewBlocks: BlockProps<unknown>[],
	getBlockType: GetBlockType
): BlockProps<unknown>[] => {
	if ( ! blocksStructureMatches( editorBlocks, previewBlocks ) ) {
		return previewBlocks;
	}

	return editorBlocks.map( ( editorBlock, index ) => {
		const previewBlock = previewBlocks[ index ];
		const blockType = getBlockType( editorBlock.name || '' );

		return {
			...editorBlock,
			attributes: mergeAllowedAttributes(
				editorBlock.attributes as Record<string, unknown> | undefined,
				previewBlock.attributes as Record<string, unknown> | undefined,
				blockType
			),
			innerBlocks: mergePreviewCloneOntoBlocks(
				( editorBlock.innerBlocks || [] ) as BlockProps<unknown>[],
				( previewBlock.innerBlocks || [] ) as BlockProps<unknown>[],
				getBlockType
			)
		};
	});
};

export const getSelectedBlockClientIds = (
	isMultipleSelection: boolean,
	selectedClientIds: string[],
	singleClientId: string
): string[] => {
	return isMultipleSelection ? selectedClientIds : [ singleClientId ];
};
