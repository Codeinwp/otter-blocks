/**
 * WordPress dependencies.
 */
import { createBlock } from '@wordpress/blocks';

/**
 * Internal dependencies.
 */
import type { BlockProps } from '../../helpers/blocks';

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
 * Root nodes may also carry a short `notes` hint describing the section's intent
 * and any structure/styling guidance, used to steer the attribute phase.
 */
export type StructureNode = {
	name: string;
	notes?: string;
	innerBlocks?: StructureNode[];
};

/**
 * The design direction the plan phase commits to, trickled down to every section
 * so the generated layout shares one visual identity.
 */
export type DesignDirection = {
	style?: string;
	palette?: string[];
	borderRadius?: string;
	spacing?: string;
	typography?: string;
};

/**
 * Phase 1 output — the full plan: a mission describing the finished result, a
 * design direction, the reasoning, and the section outline (roots with notes).
 */
export type GenerationPlan = {
	mission: string;
	design: DesignDirection;
	rationale: string[];
	roots: StructureNode[];
};

/**
 * Phase 3 — the real attribute schema for the block types actually used in a
 * validated structure, so the model fills meaningful content and properties.
 */
export type AttributeSchemaEntry = {
	slug: string;
	attributes: string[];
};

/**
 * A resolved editor palette color, as returned by
 * `select( 'core/block-editor' ).getSettings().colors`. The model is told to
 * reference these exact slugs so generated colors actually resolve in the theme.
 */
export type ThemeColor = {
	name?: string;
	slug: string;
	color: string;
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
	plan: GenerationPlan;
	rationale: string[];
	diagnostics: {
		droppedRoots: DroppedGeneratedRoot[];
	};
};

/**
 * Fired once per root as the attribute phase finishes it, so callers can insert
 * sections progressively. `blocks` is empty when the root was dropped.
 */
export type RootCompletion = {
	rootIndex: number;
	totalRoots: number;
	blocks: BlockProps<unknown>[];
	notes?: string;
	dropped?: DroppedGeneratedRoot;
};

type GenerateBlocksFromTaskArgs = {
	task: string;
	blockTypes: BlockTypeLike[];
	themeColors?: ThemeColor[];
	requestCompletion: ( prompt: string ) => Promise<string>;
	onPlanReady?: ( plan: GenerationPlan ) => void;
	onRootComplete?: ( completion: RootCompletion ) => void;
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
		.filter( ( [ attrName, attr ] ) => {
			if ( 'core/paragraph' === blockType?.name && 'align' === attrName ) {
				return false;
			}

			return isTextAttribute( attr );
		})
		.map( ( [ attrName ] ) => attrName );
};

/**
 * Phase 1 — build the slim structure catalog (slug + short description +
 * container hint). Core and Otter blocks pass the inserter/asset filter.
 *
 * @param blockTypes The registered block types to filter into the catalog.
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
 *
 * @param blockTypes The registered block types.
 * @param slugs      The block slugs actually used in the validated structure.
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

const normalizeGeneratedAttributes = (
	blockName: string,
	attributes: Record<string, unknown>
) => {
	if ( 'core/paragraph' !== blockName || 'string' !== typeof attributes.align ) {
		return attributes;
	}

	const { align, style, ...normalized } = attributes;
	const existingStyle = isObject( style ) ? style : {};
	const existingTypography = isObject( existingStyle.typography ) ? existingStyle.typography : {};

	return {
		...normalized,
		style: {
			...existingStyle,
			typography: {
				...existingTypography,
				textAlign: align
			}
		}
	};
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
			const attributes = normalizeGeneratedAttributes(
				tree.name,
				getAllowedAttributes( tree.attributes, blockType )
			);

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

export const sanitizeGeneratedBlocks = (
	blocks: BlockProps<unknown>[],
	getBlockType: GetBlockType
): BlockProps<unknown>[] => {
	return ( blocks || []).map( block => {
		const blockType = getBlockType( block.name );
		const attributes = normalizeGeneratedAttributes(
			block.name,
			getAllowedAttributes( block.attributes, blockType )
		);
		const innerBlocks = sanitizeGeneratedBlocks(
			( block.innerBlocks || []) as BlockProps<unknown>[],
			getBlockType
		);

		return {
			...block,
			attributes,
			innerBlocks
		};
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
 *
 * @param nodes        The model's raw structure nodes.
 * @param getBlockType Resolver for a registered block type by name.
 * @param parentName   The parent block slug, or undefined at the root.
 * @param ancestors    The ancestor block slugs accumulated down the tree.
 * @param dropped      Collects nodes removed during validation, with reasons.
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
			notes: node.notes,
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

const parseJsonResponse = ( response: string ): Record<string, unknown> | null => {
	try {
		// Models frequently wrap JSON in a ```json … ``` fence despite being
		// asked for strict JSON. Strip it before parsing.
		const cleaned = response.trim().replace( /^```(?:json)?\s*/i, '' ).replace( /\s*```$/, '' );
		const parsed = JSON.parse( cleaned );

		return isObject( parsed ) ? parsed : null;
	} catch {
		return null;
	}
};

const toStringArray = ( value: unknown ): string[] => {
	return Array.isArray( value ) ? value.filter( item => 'string' === typeof item ) : [];
};

const parseModelPayload = ( response: string ): ModelGenerationPayload => {
	const parsed = parseJsonResponse( response );

	if ( ! parsed ) {
		return {};
	}

	return {
		rationale: toStringArray( parsed.rationale ),
		roots: Array.isArray( parsed.roots ) ? parsed.roots.filter( isObject ) as GeneratedBlockTree[] : []
	};
};

const parseDesignDirection = ( value: unknown ): DesignDirection => {
	if ( ! isObject( value ) ) {
		return {};
	}

	const asString = ( field: unknown ) => ( 'string' === typeof field ? field : undefined );

	return {
		style: asString( value.style ),
		palette: toStringArray( value.palette ),
		borderRadius: asString( value.borderRadius ),
		spacing: asString( value.spacing ),
		typography: asString( value.typography )
	};
};

/**
 * Parse the phase 1 plan: mission, design direction, rationale and the section
 * outline. Tolerant — a degraded response still yields a usable plan so the
 * pipeline can keep building.
 *
 * @param response The raw model response for the plan prompt.
 */
const parsePlanPayload = ( response: string ): GenerationPlan => {
	const parsed = parseJsonResponse( response );

	if ( ! parsed ) {
		return { mission: '', design: {}, rationale: [], roots: [] };
	}

	return {
		mission: 'string' === typeof parsed.mission ? parsed.mission : '',
		design: parseDesignDirection( parsed.design ),
		rationale: toStringArray( parsed.rationale ),
		roots: Array.isArray( parsed.roots ) ? parsed.roots.filter( isObject ) as StructureNode[] : []
	};
};

const collectSlugs = ( node: StructureNode, slugs: Set<string> ) => {
	slugs.add( node.name );
	( node.innerBlocks || []).forEach( inner => collectSlugs( inner, slugs ) );
};

/*
 * Compact, token-efficient encodings for the prompt. The block catalog and the
 * attribute schema are input-only context, so a line-based format avoids the
 * repeated JSON keys and escaped quotes that bloat the request. The model still
 * replies in strict JSON.
 */
const formatCatalogForPrompt = ( catalog: StructureCatalogEntry[] ): string => {
	return catalog
		.map( entry => `${ entry.slug }${ entry.container ? ' [container]' : '' }: ${ entry.description }` )
		.join( '\n' );
};

const formatSchemaForPrompt = ( schema: AttributeSchemaEntry[] ): string => {
	return schema
		.map( entry => `${ entry.slug }: ${ entry.attributes.join( ', ' ) }` )
		.join( '\n' );
};

/*
 * The theme palette, one color per line as `slug (#hex) — Name`. Listing the
 * real slugs lets the model reference colors that actually resolve in the theme
 * instead of inventing slugs from a free-text palette.
 */
const formatPaletteForPrompt = ( colors: ThemeColor[] ): string => {
	return colors
		.filter( color => color?.slug && color?.color )
		.map( color => `${ color.slug } (${ color.color })${ color.name ? ` — ${ color.name }` : '' }` )
		.join( '\n' );
};

const ATOMIC_WIND_STRUCTURE_HINT = 'The catalog includes Atomic Wind primitives (atomic-wind/box, atomic-wind/text, atomic-wind/icon, atomic-wind/link). These are low-level building blocks: "box" is a flexible container that nests any block, while text, icon and link hold the content. Compose them when the task needs a custom or complex layout that the higher-level blocks cannot express — combined, they can build almost any structure.';

const buildPlanPrompt = (
	task: string,
	catalog: StructureCatalogEntry[],
	atomicAvailable: boolean,
	themeColors: ThemeColor[]
) => {
	const palette = formatPaletteForPrompt( themeColors );

	return [
		'You are planning a WordPress block layout for a user task. Produce a plan, not the final content yet.',
		'First decide the mission: 1–2 sentences describing what the finished result should look like and achieve.',
		'Then commit to a design direction the whole layout will share: an overall style, a palette of 3–5 colors, a border radius/roundness, a spacing rhythm, and a typography feel.',
		...( palette ? [ `Build the palette ONLY from these theme color slugs — pick 3–5 and list them by slug, do not invent color names:\n${ palette }` ] : []),
		'Then outline the page as top-level sections (roots). Pick blocks from the catalog by slug and arrange them into a nested tree.',
		'Only nest blocks inside a block whose slug is marked [container].',
		'Do NOT include any attributes yet — only "name" (a catalog slug), an optional "notes" string on each root, and "innerBlocks".',
		'Each root\'s "notes" should state that section\'s intent plus any structure or styling guidance for it (e.g. "hero with headline + CTA, use the primary color").',
		'If you use a form block, do NOT add a separate submit button or button block — the Otter Form already renders its own submit button.',
		'Prefer simple, reusable structures. Keep the reasoning ordered and human-readable.',
		...( atomicAvailable ? [ ATOMIC_WIND_STRUCTURE_HINT ] : [] ),
		'Return strict JSON: { "mission": string, "design": { "style": string, "palette": string[], "borderRadius": string, "spacing": string, "typography": string }, "rationale": string[], "roots": [ { "name": string, "notes": string, "innerBlocks": [...] } ] }.',
		'Block catalog, one per line as `slug: description`. A slug marked [container] can hold inner blocks:',
		formatCatalogForPrompt( catalog ),
		'Task:',
		task
	].join( '\n\n' );
};

const formatDesignForPrompt = ( design: DesignDirection ): string => {
	const parts: string[] = [];

	if ( design.style ) {
		parts.push( `style: ${ design.style }` );
	}
	if ( design.palette?.length ) {
		parts.push( `palette: ${ design.palette.join( ', ' ) }` );
	}
	if ( design.borderRadius ) {
		parts.push( `border radius: ${ design.borderRadius }` );
	}
	if ( design.spacing ) {
		parts.push( `spacing: ${ design.spacing }` );
	}
	if ( design.typography ) {
		parts.push( `typography: ${ design.typography }` );
	}

	return parts.join( '; ' );
};

const ATOMIC_WIND_ATTRIBUTE_HINT = 'Atomic Wind blocks (atomic-wind/*) are styled entirely with Tailwind CSS utility classes set on their "className" attribute — e.g. "flex flex-col gap-6 p-8 rounded-xl bg-slate-900 text-white", including arbitrary values like "bg-[#0f172a]" or "w-[320px]". For these blocks, write Tailwind utility classes into "className" to create the visual design (layout, spacing, colors, typography); do NOT put prose into "className". Use "tagName" to pick the right semantic element (section, header, nav, article, etc.). Keep the palette coherent and text readable against its background.';

const buildAttributePrompt = (
	task: string,
	root: StructureNode,
	schema: AttributeSchemaEntry[],
	rootUsesAtomic: boolean,
	plan: GenerationPlan,
	themeColors: ThemeColor[]
) => {
	const design = formatDesignForPrompt( plan.design );
	const palette = formatPaletteForPrompt( themeColors );

	return [
		'Fill in the attributes for this validated WordPress block structure. It is one section of a larger page.',
		...( plan.mission ? [ `Overall mission: ${ plan.mission }` ] : [] ),
		...( design ? [ `Design direction — apply it consistently across the layout: ${ design }.` ] : [] ),
		...( root.notes ? [ `This section's intent: ${ root.notes }` ] : [] ),
		'Keep the exact same tree of slugs and nesting — do not add, remove, or reorder blocks.',
		'Write specific, on-topic content for the user task into every text attribute (e.g. content, value, title, label). Each block must get unique, meaningful text — never repeat boilerplate or leave placeholder/sample text.',
		'Use ONLY the attributes listed for each slug. Do not invent attributes, clientIds, or rendered HTML.',
		...( palette
			? [ `Color attributes (backgroundColor, textColor) MUST use one of these exact theme color slugs — never invent a slug:\n${ palette }` ]
			: [] ),
		'When a block exposes color attributes (e.g. background, text, or accent colors), apply the design direction\'s palette so the result looks polished instead of bland. Keep the palette coherent across the whole layout and ensure text stays readable against its background. Leave the remaining styling attributes (sizes, CSS) untouched unless essential.',
		...( rootUsesAtomic ? [ ATOMIC_WIND_ATTRIBUTE_HINT ] : [] ),
		'Return strict JSON: { "rationale": string[], "roots": [ { "name": string, "attributes": object, "innerBlocks": [...] } ] }.',
		'Allowed attributes, one per line as `slug: attr1, attr2, ...`:',
		formatSchemaForPrompt( schema ),
		'Structure to fill:',
		JSON.stringify( root ),
		'Task:',
		task
	].join( '\n\n' );
};

export const generateBlocksFromTask = async({
	task,
	blockTypes,
	themeColors = [],
	requestCompletion,
	onPlanReady,
	onRootComplete
}: GenerateBlocksFromTaskArgs): Promise<BlockGenerationResult> => {
	const getBlockType = ( name: string ) => blockTypes.find( blockType => blockType.name === name );
	const droppedRoots: DroppedGeneratedRoot[] = [];
	const atomicAvailable = blockTypes.some( blockType => blockType.name.startsWith( 'atomic-wind/' ) );

	// Phase 1 — plan the mission, design direction and section outline.
	const catalog = buildStructureCatalog( blockTypes );
	const planPrompt = buildPlanPrompt( task, catalog, atomicAvailable, themeColors );

	const plan = parsePlanPayload( await requestCompletion( planPrompt ) );

	// Phase 2 — prune the outline to a structurally legal tree (notes preserved).
	const validRoots = validateStructure( plan.roots, getBlockType, undefined, [], droppedRoots );

	onPlanReady?.({ ...plan, roots: validRoots });

	// Phase 3 — fill attributes per root, trickling the plan into each call, and
	// report each finished section so callers can insert it progressively.
	const blocks: BlockProps<unknown>[] = [];

	for ( let index = 0; index < validRoots.length; index++ ) {
		const root = validRoots[ index ];
		const slugs = new Set<string>();
		collectSlugs( root, slugs );

		const schema = buildAttributeSchema( blockTypes, slugs );
		const rootUsesAtomic = [ ...slugs ].some( slug => slug.startsWith( 'atomic-wind/' ) );
		const attributePrompt = buildAttributePrompt( task, root, schema, rootUsesAtomic, plan, themeColors );

		const filledPayload = parseModelPayload( await requestCompletion( attributePrompt ) );
		const filledRoot = filledPayload.roots?.[0];

		if ( ! filledRoot ) {
			const dropped = { root: root as GeneratedBlockTree, errors: [ 'Attribute generation returned no block.' ] };
			droppedRoots.push( dropped );
			onRootComplete?.({ rootIndex: index, totalRoots: validRoots.length, blocks: [], notes: root.notes, dropped });
			continue;
		}

		const rootBlocks = jsonTreeToBlocks([ filledRoot ], getBlockType );
		const validation = validateGeneratedBlocks( rootBlocks, getBlockType );

		if ( ! validation.valid ) {
			const dropped = { root: root as GeneratedBlockTree, errors: validation.errors };
			droppedRoots.push( dropped );
			onRootComplete?.({ rootIndex: index, totalRoots: validRoots.length, blocks: [], notes: root.notes, dropped });
			continue;
		}

		blocks.push( ...rootBlocks );
		onRootComplete?.({ rootIndex: index, totalRoots: validRoots.length, blocks: rootBlocks, notes: root.notes });
	}

	return {
		blocks,
		plan,
		rationale: plan.rationale,
		diagnostics: {
			droppedRoots
		}
	};
};
