/**
 * WordPress dependencies.
 */
import { createBlock } from '@wordpress/blocks';

/**
 * Internal dependencies.
 */
import type { BlockProps } from '../../helpers/blocks';
import { aiDebug } from './debug';

type AttributeDefinition = Record<string, unknown>;

type BlockTypeLike = {
	name: string;
	title?: string;
	description?: string;
	attributes?: Record<string, AttributeDefinition>;
	parent?: string[];
	ancestor?: string[];
	allowedBlocks?: string[];
	supports?: {
		inserter?: boolean;
		[ key: string ]: unknown;
	};
};

type GetBlockType = ( name: string ) => BlockTypeLike | undefined;

export type GeneratedBlockTree = {
	name: string;
	attributes?: Record<string, unknown>;
	innerBlocks?: GeneratedBlockTree[];
};

/**
 * Phase 1 — a slim entry the model uses to decide the block structure. Only the
 * slug, a short description and a container hint, to keep the prompt small.
 */
export type StructureCatalogEntry = {
	slug: string;
	description: string;
	container: boolean;
};

/**
 * Phase 1 output — a structural node with slugs and nesting only, no attributes.
 */
export type StructureNode = {
	name: string;
	innerBlocks?: StructureNode[];
};

/**
 * Phase 3 — the real attribute schema for the block types actually used in a
 * validated structure, so the model fills meaningful content and properties.
 */
export type AttributeSchemaEntry = {
	slug: string;
	attributes: string[];
};

export type BlockValidationResult = {
	valid: boolean;
	errors: string[];
};

export type DroppedGeneratedRoot = {
	root: GeneratedBlockTree;
	errors: string[];
};

export type BlockGenerationResult = {
	blocks: BlockProps<unknown>[];
	rationale: string[];
	diagnostics: {
		droppedRoots: DroppedGeneratedRoot[];
	};
};

type GenerateBlocksFromTaskArgs = {
	task: string;
	blockTypes: BlockTypeLike[];
	requestCompletion: ( prompt: string ) => Promise<string>;
};

type ModelGenerationPayload = {
	rationale?: string[];
	roots?: GeneratedBlockTree[];
};

const DESCRIPTION_MAX = 100;

const ASSET_OR_SERVICE_BLOCK_PATTERN = /\b(map|stripe|checkout|posts|product|slider|image|gallery|lottie|video|audio|file)\b/i;

/*
 * Blocks that hold inner blocks via an InnerBlocks template but do not advertise
 * it through `allowedBlocks`, and are not declared as a `parent`/`ancestor` by
 * any other block — so they cannot be auto-detected. Used only as a hint in the
 * phase 1 catalog; phase 2 validation is the real gate.
 */
const KNOWN_CONTAINERS = new Set([
	'core/group',
	'core/columns',
	'core/column',
	'core/buttons',
	'core/list',
	'core/quote',
	'core/cover',
	'core/media-text',
	'core/details',
	'themeisle-blocks/advanced-column',
	'themeisle-blocks/timeline-item',
	'themeisle-blocks/accordion-item',
	'themeisle-blocks/tabs-item',
	'themeisle-blocks/flip'
]);

/*
 * Any block that another block declares as its `parent` or `ancestor` is, by
 * definition, a container. This auto-detects most layout blocks (timeline,
 * accordion, tabs, sections, forms, …) without a hardcoded list.
 */
const collectContainerSlugs = ( blockTypes: BlockTypeLike[] ): Set<string> => {
	const slugs = new Set<string>();

	for ( const blockType of blockTypes ) {
		[ ...( blockType.parent || []), ...( blockType.ancestor || []) ].forEach( slug => slugs.add( slug ) );
	}

	return slugs;
};

const isObject = ( value: unknown ): value is Record<string, unknown> => {
	return Boolean( value && 'object' === typeof value && ! Array.isArray( value ) );
};

const isTextAttribute = ( attr: AttributeDefinition ) => {
	if ( 'local' === attr?.role || 'meta' === attr?.role ) {
		return false;
	}

	const source = attr?.source as string | undefined;

	// Reject attributes sourced from places that are not plain editable text
	// (e.g. `query`, `meta`). Everything below is text the model can author.
	if ( source && ! [ 'html', 'text', 'rich-text', 'plain-text', 'attribute', 'children' ].includes( source ) ) {
		return false;
	}

	return 'content' === attr?.role ||
		'string' === attr?.type ||
		'rich-text' === attr?.type;
};

const isCatalogBlockAllowed = ( blockType: BlockTypeLike ) => {
	if ( false === blockType.supports?.inserter ) {
		return false;
	}

	// Match against the block name only. Titles are translated and prone to
	// substring false positives (e.g. "Profile" contains "file").
	return ! ASSET_OR_SERVICE_BLOCK_PATTERN.test( blockType.name );
};

const canHaveInnerBlocks = ( blockType: BlockTypeLike, containerSlugs: Set<string> ) => {
	return Boolean( blockType.allowedBlocks?.length ) ||
		containerSlugs.has( blockType.name ) ||
		KNOWN_CONTAINERS.has( blockType.name );
};

const trimDescription = ( description: string ) => {
	const clean = ( description || '' ).replace( /\s+/g, ' ' ).trim();

	if ( clean.length <= DESCRIPTION_MAX ) {
		return clean;
	}

	return `${ clean.slice( 0, DESCRIPTION_MAX - 1 ).trimEnd() }…`;
};

const textAttributesOf = ( blockType: BlockTypeLike | undefined ): string[] => {
	return Object.entries( blockType?.attributes || {})
		.filter( ( [ , attr ] ) => isTextAttribute( attr ) )
		.map( ( [ attrName ] ) => attrName );
};

/**
 * Phase 1 — build the slim structure catalog (slug + short description +
 * container hint). Core and Otter blocks pass the inserter/asset filter.
 */
export const buildStructureCatalog = (
	blockTypes: BlockTypeLike[]
): StructureCatalogEntry[] => {
	const containerSlugs = collectContainerSlugs( blockTypes );

	return blockTypes
		.filter( isCatalogBlockAllowed )
		.map( blockType => ({
			slug: blockType.name,
			description: trimDescription( blockType.description || '' ),
			container: canHaveInnerBlocks( blockType, containerSlugs )
		}) );
};

/**
 * Phase 3 — build the attribute schema for the given slugs only, so the prompt
 * carries the real properties for the blocks that were actually chosen.
 */
export const buildAttributeSchema = (
	blockTypes: BlockTypeLike[],
	slugs: Set<string>
): AttributeSchemaEntry[] => {
	return blockTypes
		.filter( blockType => slugs.has( blockType.name ) )
		.map( blockType => ({
			slug: blockType.name,
			attributes: textAttributesOf( blockType )
		}) );
};

const getAllowedAttributes = (
	attributes: Record<string, unknown> | undefined,
	blockType: BlockTypeLike | undefined
) => {
	if ( ! attributes || ! blockType?.attributes ) {
		return {};
	}

	const allowed: Record<string, unknown> = {};

	for ( const [ key, value ] of Object.entries( attributes ) ) {
		if ( key in blockType.attributes ) {
			allowed[ key ] = value;
		}
	}

	return allowed;
};

export const jsonTreeToBlocks = (
	trees: GeneratedBlockTree[],
	getBlockType: GetBlockType
): BlockProps<unknown>[] => {
	return trees
		.filter( tree => tree?.name )
		.map( tree => {
			const blockType = getBlockType( tree.name );
			const innerBlocks = jsonTreeToBlocks( tree.innerBlocks || [], getBlockType );
			const attributes = getAllowedAttributes( tree.attributes, blockType );

			if ( ! blockType ) {
				return {
					name: tree.name,
					attributes,
					innerBlocks
				} as BlockProps<unknown>;
			}

			return createBlock(
				tree.name,
				attributes,
				innerBlocks as Parameters<typeof createBlock>[2]
			) as BlockProps<unknown>;
		});
};

const validateBlockTree = (
	block: BlockProps<unknown>,
	getBlockType: GetBlockType,
	parentName: string | undefined,
	ancestors: string[],
	errors: string[]
) => {
	const blockType = getBlockType( block.name );

	if ( ! blockType ) {
		errors.push( `${ block.name } is not registered.` );
		return;
	}

	if ( blockType.parent?.length && ! parentName ) {
		errors.push( `${ block.name } requires parent ${ blockType.parent.join( ', ' ) }.` );
	}

	if ( blockType.parent?.length && parentName && ! blockType.parent.includes( parentName ) ) {
		errors.push( `${ block.name } requires parent ${ blockType.parent.join( ', ' ) }, received ${ parentName }.` );
	}

	if ( blockType.ancestor?.length && ! blockType.ancestor.some( ancestor => ancestors.includes( ancestor ) ) ) {
		errors.push( `${ block.name } requires ancestor ${ blockType.ancestor.join( ', ' ) }.` );
	}

	const parentType = parentName ? getBlockType( parentName ) : undefined;

	if ( parentType?.allowedBlocks?.length && ! parentType.allowedBlocks.includes( block.name ) ) {
		errors.push( `${ block.name } is not allowed inside ${ parentName }.` );
	}

	for ( const innerBlock of block.innerBlocks || [] ) {
		validateBlockTree(
			innerBlock as BlockProps<unknown>,
			getBlockType,
			block.name,
			[ ...ancestors, block.name ],
			errors
		);
	}
};

export const validateGeneratedBlocks = (
	blocks: BlockProps<unknown>[],
	getBlockType: GetBlockType
): BlockValidationResult => {
	const errors: string[] = [];

	for ( const block of blocks ) {
		validateBlockTree( block, getBlockType, undefined, [], errors );
	}

	return {
		valid: 0 === errors.length,
		errors
	};
};

/**
 * Phase 2 — prune the model's skeleton down to a structurally legal tree using
 * the registry's nesting rules (registration, parent, ancestor, allowedBlocks).
 * Returns the cleaned tree; dropped nodes are collected with a reason.
 */
export const validateStructure = (
	nodes: StructureNode[],
	getBlockType: GetBlockType,
	parentName: string | undefined,
	ancestors: string[],
	dropped: DroppedGeneratedRoot[]
): StructureNode[] => {
	const kept: StructureNode[] = [];

	for ( const node of nodes || [] ) {
		if ( ! node?.name ) {
			continue;
		}

		const blockType = getBlockType( node.name );
		const reject = ( reason: string ) => dropped.push({ root: node as GeneratedBlockTree, errors: [ reason ] });

		if ( ! blockType ) {
			reject( `${ node.name } is not registered.` );
			continue;
		}

		if ( blockType.parent?.length && ( ! parentName || ! blockType.parent.includes( parentName ) ) ) {
			reject( `${ node.name } requires parent ${ blockType.parent.join( ', ' ) }.` );
			continue;
		}

		if ( blockType.ancestor?.length && ! blockType.ancestor.some( ancestor => ancestors.includes( ancestor ) ) ) {
			reject( `${ node.name } requires ancestor ${ blockType.ancestor.join( ', ' ) }.` );
			continue;
		}

		const parentType = parentName ? getBlockType( parentName ) : undefined;

		if ( parentType?.allowedBlocks?.length && ! parentType.allowedBlocks.includes( node.name ) ) {
			reject( `${ node.name } is not allowed inside ${ parentName }.` );
			continue;
		}

		kept.push({
			name: node.name,
			innerBlocks: validateStructure(
				node.innerBlocks || [],
				getBlockType,
				node.name,
				[ ...ancestors, node.name ],
				dropped
			)
		});
	}

	return kept;
};

const parseModelPayload = ( response: string ): ModelGenerationPayload => {
	try {
		// Models frequently wrap JSON in a ```json … ``` fence despite being
		// asked for strict JSON. Strip it before parsing.
		const cleaned = response.trim().replace( /^```(?:json)?\s*/i, '' ).replace( /\s*```$/, '' );
		const parsed = JSON.parse( cleaned );

		if ( ! isObject( parsed ) ) {
			return {};
		}

		return {
			rationale: Array.isArray( parsed.rationale ) ? parsed.rationale.filter( item => 'string' === typeof item ) : [],
			roots: Array.isArray( parsed.roots ) ? parsed.roots.filter( isObject ) as GeneratedBlockTree[] : []
		};
	} catch {
		return {};
	}
};

const collectSlugs = ( node: StructureNode, slugs: Set<string> ) => {
	slugs.add( node.name );
	( node.innerBlocks || []).forEach( inner => collectSlugs( inner, slugs ) );
};

const buildStructurePrompt = (
	task: string,
	catalog: StructureCatalogEntry[]
) => {
	return [
		'You are planning the structure of a WordPress block layout for a user task.',
		'Pick blocks from the catalog by slug and arrange them into a nested tree.',
		'Only nest blocks inside a block whose "container" is true.',
		'Do NOT include any attributes yet — only "name" (a catalog slug) and "innerBlocks".',
		'Prefer simple, reusable structures. Keep the reasoning ordered and human-readable.',
		'Return strict JSON: { "rationale": string[], "roots": [ { "name": string, "innerBlocks": [...] } ] }.',
		'Block catalog (slug, description, container):',
		JSON.stringify( catalog ),
		'Task:',
		task
	].join( '\n\n' );
};

const buildAttributePrompt = (
	task: string,
	root: StructureNode,
	schema: AttributeSchemaEntry[]
) => {
	return [
		'Fill in the attributes for this validated WordPress block structure.',
		'Keep the exact same tree of slugs and nesting — do not add, remove, or reorder blocks.',
		'Write specific, on-topic content for the user task into every text attribute (e.g. content, value, title, label). Each block must get unique, meaningful text — never repeat boilerplate or leave placeholder/sample text.',
		'Use ONLY the attributes listed for each slug. Do not invent attributes, clientIds, or rendered HTML. Leave styling attributes (colors, sizes, CSS) untouched unless essential.',
		'Return strict JSON: { "rationale": string[], "roots": [ { "name": string, "attributes": object, "innerBlocks": [...] } ] }.',
		'Allowed attributes per slug:',
		JSON.stringify( schema ),
		'Structure to fill:',
		JSON.stringify( root ),
		'Task:',
		task
	].join( '\n\n' );
};

export const generateBlocksFromTask = async({
	task,
	blockTypes,
	requestCompletion
}: GenerateBlocksFromTaskArgs): Promise<BlockGenerationResult> => {
	const getBlockType = ( name: string ) => blockTypes.find( blockType => blockType.name === name );
	const droppedRoots: DroppedGeneratedRoot[] = [];

	// Phase 1 — plan the structure with a slim, slug-only catalog.
	const catalog = buildStructureCatalog( blockTypes );
	const structurePrompt = buildStructurePrompt( task, catalog );
	aiDebug( 'Phase 1: requesting structure', {
		catalog: catalog.length,
		of: blockTypes.length,
		promptChars: structurePrompt.length
	});

	const structurePayload = parseModelPayload( await requestCompletion( structurePrompt ) );
	const rawRoots = ( structurePayload.roots || [] ) as StructureNode[];
	aiDebug( 'Phase 1: received skeleton', { roots: rawRoots.map( root => root?.name ) });

	// Phase 2 — prune the skeleton to a structurally legal tree.
	const validRoots = validateStructure( rawRoots, getBlockType, undefined, [], droppedRoots );
	aiDebug( 'Phase 2: validated structure', {
		kept: validRoots.map( root => root?.name ),
		dropped: droppedRoots.length
	});

	// Phase 3 — fill attributes per root with the real schema, composing in order.
	const blocks: BlockProps<unknown>[] = [];

	for ( let index = 0; index < validRoots.length; index++ ) {
		const root = validRoots[ index ];
		const slugs = new Set<string>();
		collectSlugs( root, slugs );

		const schema = buildAttributeSchema( blockTypes, slugs );
		const attributePrompt = buildAttributePrompt( task, root, schema );
		aiDebug( `Phase 3: filling root ${ index } "${ root.name }"`, {
			slugs: slugs.size,
			promptChars: attributePrompt.length
		});

		const filledPayload = parseModelPayload( await requestCompletion( attributePrompt ) );
		const filledRoot = filledPayload.roots?.[0];

		if ( ! filledRoot ) {
			aiDebug( `Phase 3: root ${ index } returned no content, dropping` );
			droppedRoots.push({ root: root as GeneratedBlockTree, errors: [ 'Attribute generation returned no block.' ] });
			continue;
		}

		const rootBlocks = jsonTreeToBlocks([ filledRoot ], getBlockType );
		const validation = validateGeneratedBlocks( rootBlocks, getBlockType );

		if ( ! validation.valid ) {
			aiDebug( `Phase 3: root ${ index } invalid after fill, dropping`, validation.errors );
			droppedRoots.push({ root: root as GeneratedBlockTree, errors: validation.errors });
			continue;
		}

		aiDebug( `Phase 3: root ${ index } ready`, { blocks: rootBlocks.length });
		blocks.push( ...rootBlocks );
	}

	aiDebug( 'Generation complete', {
		blocks: blocks.map( block => block.name ),
		dropped: droppedRoots.length
	});

	return {
		blocks,
		rationale: structurePayload.rationale || [],
		diagnostics: {
			droppedRoots
		}
	};
};
