/**
 * WordPress dependencies.
 */
import { createBlock, parse } from '@wordpress/blocks';

/**
 * Internal dependencies.
 */
import type { BlockProps } from '../../helpers/blocks';
import { isObject, parseJsonResponse, toStringArray } from './json-utils';
import {
	applyAttributePatches,
	applyPatchesToBlocks,
	attachIds,
	blocksToTrees,
	buildIdToBlockNameMap,
	normalizePatchAttributes,
	parsePatchPayload,
	patchesToMap
} from './block-patches';
import type { IdentifiedNode } from './block-patches';
import { findQualityIssues, formatIssuesForPrompt } from './quality-checks';
import type { QualityIssue } from './quality-checks';
import { formatSessionHistoryForPrompt } from './session-history';
import { PIPELINE_STEP } from './prompts/phases';

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
 * A registered block pattern, as returned by `select( 'core' ).getBlockPatterns()`.
 * Only the fields the generator reads are typed.
 */
export type PatternLike = {
	name: string;
	title?: string;
	description?: string;
	categories?: string[];
	content: string;
	source?: string;
	blockTypes?: string[];
};

/**
 * Req 2 — the slim pattern catalog handed to the model: enough to pick a pattern
 * by name without shipping the (large) serialized content.
 */
export type PatternCatalogEntry = {
	name: string;
	title: string;
	description: string;
	categories: string[];
};

/**
 * Req 1 — a conceptual section in the layout brief: a stable id and an intent
 * sentence. No block slugs yet; that comes from patterns (Req 2) or the gap
 * outline (Req 3).
 */
export type LayoutSection = {
	id: string;
	intent: string;
};

/**
 * Req 1 output — the high-level brief: mission, shared design direction and the
 * ordered conceptual section list.
 */
export type LayoutBrief = {
	mission: string;
	design: DesignDirection;
	sections: LayoutSection[];
};

/**
 * Req 2 output — the model's pattern choice for one section. `patternName` is
 * null when no library pattern fits and the section must be generated instead.
 */
export type PatternAssignment = {
	sectionId: string;
	patternName: string | null;
	note?: string;
};

/**
 * Req 4 — one section of the combined draft, before the attribute/rewrite phase.
 * Pattern-sourced roots carry their parsed tree (with attributes) as `seed`;
 * generated roots carry only the slug outline.
 */
export type DraftRoot = {
	source: 'pattern' | 'generated';
	sectionId: string;
	node: StructureNode;
	seed?: GeneratedBlockTree;
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

export type ValidateBlocksOptions = {
	/** Root blocks replaced in-place in the editor may omit a parent in the tree. */
	skipRootParentChecks?: boolean;
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

	/**
	 * Registered block patterns. When present and non-empty, generation runs the
	 * pattern-aware pipeline (brief → pattern selection → gap outline → combine →
	 * fill). When omitted, the catalog-only pipeline runs unchanged.
	 */
	patterns?: PatternLike[];
	requestCompletion: ( prompt: string ) => Promise<string>;

	/**
	 * The user's earlier chat requests this session (oldest first), threaded into
	 * the planning prompt so a follow-up generation stays consistent with intent
	 * expressed in previous turns.
	 */
	history?: string[];

	/**
	 * Coarse pipeline phase, for driving the loading copy: 'briefing' →
	 * 'selecting' → 'outlining' → 'building' → 'polishing'. 'refining' is used by
	 * the standalone refine pass.
	 */
	onPhase?: ( phase: 'briefing' | 'selecting' | 'outlining' | 'building' | 'polishing' | 'refining' ) => void;
	onPlanReady?: ( plan: GenerationPlan ) => void;
	onRootComplete?: ( completion: RootCompletion ) => void;
};

type RefineBlocksArgs = {
	task: string;
	instruction: string;
	baseBlocks: BlockProps<unknown>[];
	blockTypes: BlockTypeLike[];
	themeColors?: ThemeColor[];
	requestCompletion: ( prompt: string ) => Promise<string>;
	onPhase?: ( phase: 'refining' ) => void;

	/**
	 * Optional serialized markup + schema context for the selection.
	 */
	referenceContext?: string;

	/**
	 * The user's earlier chat requests this session (oldest first), threaded into
	 * the refine prompt so the model can resolve follow-up references.
	 */
	history?: string[];
};

const PATTERN_CATALOG_MAX = 60;

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

/*
 * Every author-settable attribute name on a block, excluding internal roles
 * (local/meta). Refine needs the full surface (colors, sizes, style, …), not
 * just text, so the model knows the real attribute name to patch.
 */
const editableAttributesOf = ( blockType: BlockTypeLike | undefined ): string[] => {
	return Object.entries( blockType?.attributes || {})
		.filter( ( [ , attr ] ) => 'local' !== attr?.role && 'meta' !== attr?.role )
		.map( ( [ attrName ] ) => attrName );
};

/**
 * Build the full settable-attribute schema for the given slugs — used by refine,
 * where any attribute (not just text) may need to change.
 *
 * @param blockTypes The registered block types.
 * @param slugs      The block slugs present in the result being refined.
 */
export const buildFullAttributeSchema = (
	blockTypes: BlockTypeLike[],
	slugs: Set<string>
): AttributeSchemaEntry[] => {
	return blockTypes
		.filter( blockType => slugs.has( blockType.name ) )
		.map( blockType => ({
			slug: blockType.name,
			attributes: editableAttributesOf( blockType )
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
	errors: string[],
	options: ValidateBlocksOptions = {}
) => {
	const blockType = getBlockType( block.name );

	if ( ! blockType ) {
		errors.push( `${ block.name } is not registered.` );
		return;
	}

	if ( blockType.parent?.length && ! parentName && ! options.skipRootParentChecks ) {
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
			errors,
			options
		);
	}
};

export const validateGeneratedBlocks = (
	blocks: BlockProps<unknown>[],
	getBlockType: GetBlockType,
	options: ValidateBlocksOptions = {}
): BlockValidationResult => {
	const errors: string[] = [];

	for ( const block of blocks ) {
		validateBlockTree( block, getBlockType, undefined, [], errors, options );
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

/*
 * The conversation memory: the user's earlier requests this session, oldest
 * first. Threaded into the planning and refine prompts so follow-up turns stay
 * consistent and the model can resolve references like "make that shorter" or
 * "go back to the previous style".
 */
const formatHistoryForPrompt = formatSessionHistoryForPrompt;

const ATOMIC_WIND_STRUCTURE_HINT = 'The catalog includes Atomic Wind primitives (atomic-wind/box, atomic-wind/text, atomic-wind/icon, atomic-wind/link). These are low-level building blocks: "box" is a flexible container that nests any block, while text, icon and link hold the content. Combined, they can build almost any structure. Use the higher-level blocks for common patterns, but reach for these primitives whenever they let you craft a more polished, custom, or distinctive design — they are a first-class option, not just a fallback.';

const buildPlanPrompt = (
	task: string,
	catalog: StructureCatalogEntry[],
	atomicAvailable: boolean,
	themeColors: ThemeColor[],
	history?: string[]
) => {
	const palette = formatPaletteForPrompt( themeColors );

	return [
		PIPELINE_STEP.PLAN,
		...formatHistoryForPrompt( history ),
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
		PIPELINE_STEP.CONSTRUCT,
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

/*
 * ---------------------------------------------------------------------------
 * Pattern-aware pipeline (Req 1–5): brief → pattern selection → gap outline →
 * combine → per-section fill. All helpers below are only used when the caller
 * passes a non-empty `patterns` list; the catalog-only path is untouched.
 * ---------------------------------------------------------------------------
 */

/*
 * Patterns to offer the model: Otter patterns (the `otter-blocks` category) plus
 * the active theme's patterns. Core's bundled/remote patterns are skipped — they
 * lean on blocks outside our catalog and bloat the prompt.
 */
const isOfferablePattern = ( pattern: PatternLike ): boolean => {
	if ( ! pattern?.name || ! pattern?.content ) {
		return false;
	}

	if ( pattern.categories?.includes( 'otter-blocks' ) ) {
		return true;
	}

	const { source } = pattern;

	// Theme-registered patterns have source 'theme'; plugin-registered ones often
	// have no source. Anything explicitly from core / the pattern directory is out.
	return 'theme' === source || ! source;
};

/**
 * Req 2 — build the slim pattern catalog (name + title + short description +
 * categories) from the offerable patterns, capped to keep the prompt small.
 *
 * @param patterns The registered patterns from `getBlockPatterns()`.
 */
export const buildPatternCatalog = (
	patterns: PatternLike[]
): PatternCatalogEntry[] => {
	return ( patterns || [])
		.filter( isOfferablePattern )
		.slice( 0, PATTERN_CATALOG_MAX )
		.map( pattern => ({
			name: pattern.name,
			title: ( pattern.title || pattern.name ).trim(),
			description: trimDescription( pattern.description || '' ),
			categories: pattern.categories || []
		}) );
};

type ParsedBlock = {
	name: string;
	attributes?: Record<string, unknown>;
	innerBlocks?: ParsedBlock[];
};

/*
 * Inline `core/pattern` references by splicing in the parsed content of the
 * pattern they point to, mirroring `resolvePatternBlocks` in onboarding/utils.
 * The depth guard breaks pattern-in-pattern cycles.
 */
const resolvePatternRefs = (
	blocks: ParsedBlock[],
	patternsByName: Record<string, PatternLike>,
	depth = 0
): ParsedBlock[] => {
	if ( ! Array.isArray( blocks ) || 4 < depth ) {
		return blocks || [];
	}

	return blocks.flatMap( block => {
		if ( ! block ) {
			return [];
		}

		if ( 'core/pattern' === block.name ) {
			const slug = block.attributes?.slug as string | undefined;
			const pattern = slug ? patternsByName[ slug ] : undefined;

			if ( pattern?.content ) {
				return resolvePatternRefs( parse( pattern.content ) as ParsedBlock[], patternsByName, depth + 1 );
			}

			return [];
		}

		if ( block.innerBlocks?.length ) {
			return [{
				...block,
				innerBlocks: resolvePatternRefs( block.innerBlocks, patternsByName, depth + 1 )
			}];
		}

		return [ block ];
	});
};

const blockToTree = ( block: ParsedBlock ): GeneratedBlockTree => ({
	name: block.name,
	attributes: block.attributes || {},
	innerBlocks: ( block.innerBlocks || []).map( blockToTree )
});

/**
 * Parse a pattern's serialized content into attribute-carrying block trees,
 * resolving any nested `core/pattern` references along the way.
 *
 * @param pattern        The chosen pattern.
 * @param patternsByName All patterns, keyed by name, for resolving references.
 */
export const patternToTrees = (
	pattern: PatternLike,
	patternsByName: Record<string, PatternLike>
): GeneratedBlockTree[] => {
	if ( ! pattern?.content ) {
		return [];
	}

	const parsed = resolvePatternRefs( parse( pattern.content ) as ParsedBlock[], patternsByName );

	return parsed
		.filter( block => block?.name )
		.map( blockToTree );
};

const collectSlugsFromTree = ( tree: GeneratedBlockTree, slugs: Set<string> ) => {
	slugs.add( tree.name );
	( tree.innerBlocks || []).forEach( inner => collectSlugsFromTree( inner, slugs ) );
};

const formatSectionsForPrompt = ( sections: LayoutSection[] ): string => {
	return sections
		.map( section => `${ section.id }: ${ section.intent }` )
		.join( '\n' );
};

const formatPatternCatalogForPrompt = ( catalog: PatternCatalogEntry[] ): string => {
	return catalog
		.map( entry => {
			const categories = entry.categories.length ? ` [${ entry.categories.join( ', ' ) }]` : '';
			return `${ entry.name }: ${ entry.title } — ${ entry.description }${ categories }`;
		})
		.join( '\n' );
};

const buildLayoutBriefPrompt = (
	task: string,
	atomicAvailable: boolean,
	themeColors: ThemeColor[],
	history?: string[]
) => {
	const palette = formatPaletteForPrompt( themeColors );

	return [
		PIPELINE_STEP.BRIEF,
		...formatHistoryForPrompt( history ),
		'Decide the mission: 1–2 sentences describing what the finished result should look like and achieve.',
		'Commit to a design direction the whole layout will share: an overall style, a palette of 3–5 colors, a border radius/roundness, a spacing rhythm, and a typography feel.',
		...( palette ? [ `Build the palette ONLY from these theme color slugs — pick 3–5 and list them by slug, do not invent color names:\n${ palette }` ] : []),
		'Outline the result as an ordered list of conceptual sections (e.g. hero, features, testimonials, pricing, call to action). For a single-section task, return exactly one section.',
		'Each section needs a short stable "id" (kebab-case, e.g. "hero") and an "intent" sentence describing its purpose and any structure/styling guidance.',
		...( atomicAvailable ? [ 'Low-level Atomic Wind primitives are available downstream for custom layouts; you do not need to mention them here.' ] : [] ),
		'Return strict JSON: { "mission": string, "design": { "style": string, "palette": string[], "borderRadius": string, "spacing": string, "typography": string }, "sections": [ { "id": string, "intent": string } ] }.',
		'Task:',
		task
	].join( '\n\n' );
};

const buildPatternSelectionPrompt = (
	brief: LayoutBrief,
	patternCatalog: PatternCatalogEntry[]
) => {
	return [
		PIPELINE_STEP.PATTERN_SEARCH,
		'For each planned section, choose the SINGLE pattern that best fits its intent, or null if no pattern is a good fit.',
		'Choose a pattern only when it genuinely matches the section\'s purpose. When nothing fits, set patternName to null so the section can be custom-built instead — do not force a poor match.',
		'You may add a short "note" explaining the choice or what the pattern is missing for this section.',
		'Mission for context: ' + ( brief.mission || '(none)' ),
		'Planned sections, one per line as `id: intent`:',
		formatSectionsForPrompt( brief.sections ),
		'Pattern library, one per line as `name: title — description [categories]`. Use the exact `name` when choosing:',
		formatPatternCatalogForPrompt( patternCatalog ),
		'Return strict JSON: { "assignments": [ { "sectionId": string, "patternName": string | null, "note": string } ] }.'
	].join( '\n\n' );
};

const buildMissingOutlinePrompt = (
	task: string,
	brief: LayoutBrief,
	missingSections: LayoutSection[],
	catalog: StructureCatalogEntry[],
	atomicAvailable: boolean
) => {
	return [
		PIPELINE_STEP.STRUCTURE_GAPS,
		...( brief.mission ? [ `Overall mission: ${ brief.mission }` ] : [] ),
		'For each section, pick blocks from the catalog by slug and arrange them into a nested tree.',
		'Only nest blocks inside a block whose slug is marked [container].',
		'Do NOT include any attributes yet — only "sectionId" (matching the given id), "name" (a catalog slug), an optional "notes" string, and "innerBlocks".',
		'Each root\'s "notes" should restate that section\'s intent plus any structure or styling guidance.',
		'If you use a form block, do NOT add a separate submit button or button block — the Otter Form already renders its own submit button.',
		...( atomicAvailable ? [ ATOMIC_WIND_STRUCTURE_HINT ] : [] ),
		'Sections to outline, one per line as `id: intent`:',
		formatSectionsForPrompt( missingSections ),
		'Return strict JSON: { "roots": [ { "sectionId": string, "name": string, "notes": string, "innerBlocks": [...] } ] }.',
		'Block catalog, one per line as `slug: description`. A slug marked [container] can hold inner blocks:',
		formatCatalogForPrompt( catalog ),
		'Task:',
		task
	].join( '\n\n' );
};

const buildPatternRewritePrompt = (
	task: string,
	seed: GeneratedBlockTree,
	schema: AttributeSchemaEntry[],
	rootUsesAtomic: boolean,
	plan: GenerationPlan,
	intent: string | undefined,
	themeColors: ThemeColor[]
) => {
	const design = formatDesignForPrompt( plan.design );
	const palette = formatPaletteForPrompt( themeColors );

	return [
		PIPELINE_STEP.PATTERN_REWRITE,
		...( plan.mission ? [ `Overall mission: ${ plan.mission }` ] : [] ),
		...( design ? [ `Design direction — stay consistent with it: ${ design }.` ] : [] ),
		...( intent ? [ `This section's intent: ${ intent }` ] : [] ),
		'Keep the exact same tree of slugs and nesting — do not add, remove, or reorder blocks.',
		'Replace only the text attributes (e.g. content, value, title, label) with specific, on-topic copy for the task. Each block must get unique, meaningful text — never leave the original demo/placeholder text.',
		'Preserve every non-text attribute exactly as given (layout, sizes, CSS, classNames). Use ONLY the attributes listed for each slug; do not invent attributes or rendered HTML.',
		...( palette
			? [ `If you adjust color attributes (backgroundColor, textColor), use ONLY these exact theme color slugs — never invent a slug:\n${ palette }` ]
			: [] ),
		...( rootUsesAtomic ? [ ATOMIC_WIND_ATTRIBUTE_HINT ] : [] ),
		'Return strict JSON: { "rationale": string[], "roots": [ { "name": string, "attributes": object, "innerBlocks": [...] } ] }.',
		'Allowed attributes, one per line as `slug: attr1, attr2, ...`:',
		formatSchemaForPrompt( schema ),
		'Current section (with its existing attributes) to rewrite:',
		JSON.stringify( seed ),
		'Task:',
		task
	].join( '\n\n' );
};

const buildRefinePrompt = (
	task: string,
	instruction: string,
	idTree: IdentifiedNode[],
	schema: AttributeSchemaEntry[],
	rootUsesAtomic: boolean,
	themeColors: ThemeColor[],
	history?: string[],
	referenceContext?: string
) => {
	const palette = formatPaletteForPrompt( themeColors );

	return [
		PIPELINE_STEP.EDIT,
		'Below is the current design as a tree of blocks, each with a unique "id", its block "name" and its current "attributes".',
		'Apply ONLY the requested change. Do NOT modify any block the change does not require, and do NOT add, remove, or reorder blocks.',
		...( task ? [ `Overall goal for context: ${ task }` ] : [] ),
		...formatHistoryForPrompt( history ),
		...( referenceContext ? [ 'Reference markup and schema:', referenceContext ] : [] ),
		`Requested change: ${ instruction }`,
		'Return a minimal list of patches: for each block you must change, give its "id" and ONLY the attributes that change, with their new values. Omit every block you are not changing.',
		'When changing an object-valued attribute (e.g. "style"), return the COMPLETE new value of that attribute, not a partial fragment.',
		'Use ONLY attributes that exist for that block (see the list below). Do not invent attributes, ids, blocks, or rendered HTML.',
		...( palette
			? [ `For color attributes, prefer one of these theme color slugs; if the requested color is not in the palette, you may use a hex value:\n${ palette }` ]
			: [] ),
		...( rootUsesAtomic ? [ ATOMIC_WIND_ATTRIBUTE_HINT ] : [] ),
		'Return strict JSON: { "patches": [ { "id": string, "attributes": object } ] }.',
		'Settable attributes per block, one per line as `slug: attr1, attr2, ...`:',
		formatSchemaForPrompt( schema ),
		'Current design:',
		JSON.stringify( idTree )
	].join( '\n\n' );
};

const parseLayoutBrief = ( response: string ): LayoutBrief => {
	const parsed = parseJsonResponse( response );

	if ( ! parsed ) {
		return { mission: '', design: {}, sections: [] };
	}

	const sections = ( Array.isArray( parsed.sections ) ? parsed.sections : [])
		.filter( isObject )
		.map( ( section, index ) => ({
			id: 'string' === typeof section.id && section.id.trim() ? section.id.trim() : `section-${ index + 1 }`,
			intent: 'string' === typeof section.intent ? section.intent : ''
		}) );

	return {
		mission: 'string' === typeof parsed.mission ? parsed.mission : '',
		design: parseDesignDirection( parsed.design ),
		sections
	};
};

const parsePatternAssignments = ( response: string ): PatternAssignment[] => {
	const parsed = parseJsonResponse( response );

	if ( ! parsed || ! Array.isArray( parsed.assignments ) ) {
		return [];
	}

	return parsed.assignments
		.filter( isObject )
		.map( assignment => ({
			sectionId: 'string' === typeof assignment.sectionId ? assignment.sectionId : '',
			patternName: 'string' === typeof assignment.patternName ? assignment.patternName : null,
			note: 'string' === typeof assignment.note ? assignment.note : undefined
		}) )
		.filter( assignment => assignment.sectionId );
};

type OutlineRoot = StructureNode & { sectionId?: string };

const parseOutlineRoots = ( response: string ): OutlineRoot[] => {
	const parsed = parseJsonResponse( response );

	if ( ! parsed || ! Array.isArray( parsed.roots ) ) {
		return [];
	}

	return ( parsed.roots.filter( isObject ) as Record<string, unknown>[] )
		.map( root => ({
			...( root as unknown as StructureNode ),
			sectionId: 'string' === typeof root.sectionId ? root.sectionId : undefined
		}) );
};

/*
 * Run one fill/rewrite completion and validate the result into blocks. Shared by
 * the catalog path (attribute fill) and the pattern path (text rewrite).
 */
const fillRootFromCompletion = async (
	prompt: string,
	requestCompletion: ( prompt: string ) => Promise<string>,
	getBlockType: GetBlockType
): Promise<{ blocks: BlockProps<unknown>[]; errors: string[] }> => {
	const filledPayload = parseModelPayload( await requestCompletion( prompt ) );
	const filledRoot = filledPayload.roots?.[0];

	if ( ! filledRoot ) {
		return { blocks: [], errors: [ 'Attribute generation returned no block.' ] };
	}

	const rootBlocks = jsonTreeToBlocks([ filledRoot ], getBlockType );
	const validation = validateGeneratedBlocks( rootBlocks, getBlockType );

	if ( ! validation.valid ) {
		return { blocks: [], errors: validation.errors };
	}

	return { blocks: rootBlocks, errors: [] };
};

// How many times a failed section is re-attempted with the errors fed back.
const REPAIR_ATTEMPTS = 2;

const buildRepairFeedback = ( errors: string[] ): string => {
	return [
		'Your previous attempt produced an invalid block structure. Fix these problems and return the corrected JSON in the exact same format:',
		errors.map( error => `- ${ error }` ).join( '\n' )
	].join( '\n\n' );
};

/*
 * Fill a section, and if it comes back empty or structurally invalid, re-prompt
 * with the validation errors appended as feedback — a small self-repair loop
 * that turns most "dropped section" failures into valid output.
 */
const fillRootWithRepair = async (
	basePrompt: string,
	requestCompletion: ( prompt: string ) => Promise<string>,
	getBlockType: GetBlockType,
	maxAttempts = REPAIR_ATTEMPTS
): Promise<{ blocks: BlockProps<unknown>[]; errors: string[] }> => {
	let result = { blocks: [] as BlockProps<unknown>[], errors: [] as string[] };

	for ( let attempt = 0; attempt < maxAttempts; attempt++ ) {
		const prompt = 0 === attempt
			? basePrompt
			: `${ basePrompt }\n\n${ buildRepairFeedback( result.errors ) }`;

		result = await fillRootFromCompletion( prompt, requestCompletion, getBlockType );

		if ( result.blocks.length ) {
			return result;
		}
	}

	return result;
};

// How many fix passes the deterministic quality critic runs at most.
const QUALITY_FIX_ATTEMPTS = 2;

const buildQualityFixPrompt = (
	idTree: IdentifiedNode[],
	issues: QualityIssue[],
	schema: AttributeSchemaEntry[],
	themeColors: ThemeColor[]
): string => {
	const palette = formatPaletteForPrompt( themeColors );

	return [
		PIPELINE_STEP.POLISH,
		'Below is the current design as a tree of blocks, each with a unique "id", "name" and "attributes".',
		'Apply the smallest attribute changes that resolve the listed issues. Do NOT change anything else, and do NOT add, remove, or reorder blocks.',
		'Issues to fix, one per line as `block-id: problem`:',
		formatIssuesForPrompt( issues ),
		...( palette
			? [ `For color attributes, use one of these theme color slugs; if a needed color is not in the palette, you may use a hex value:\n${ palette }` ]
			: [] ),
		'When changing an object-valued attribute (e.g. "style"), return the COMPLETE new value, not a fragment.',
		'Return strict JSON: { "patches": [ { "id": string, "attributes": object } ] }. Omit blocks you are not changing.',
		'Settable attributes per block, one per line as `slug: attr1, attr2, ...`:',
		formatSchemaForPrompt( schema ),
		'Current design:',
		JSON.stringify( idTree )
	].join( '\n\n' );
};

/*
 * Deterministic quality critic + fix loop: find issues with no model (contrast,
 * off-palette, duplicate/placeholder/empty copy, missing alt), ask the model to
 * patch only those, and re-check. Bounded by QUALITY_FIX_ATTEMPTS. Each pass is
 * validated; an invalid patch set is discarded so the result never degrades.
 */
const applyQualityFixes = async (
	blocks: BlockProps<unknown>[],
	blockTypes: BlockTypeLike[],
	themeColors: ThemeColor[],
	requestCompletion: ( prompt: string ) => Promise<string>,
	getBlockType: GetBlockType
): Promise<BlockProps<unknown>[]> => {
	let current = blocks;

	for ( let attempt = 0; attempt < QUALITY_FIX_ATTEMPTS; attempt++ ) {
		const issues = findQualityIssues( current, { themeColors });

		if ( ! issues.length ) {
			break;
		}

		const trees = blocksToTrees( current );
		const slugs = new Set<string>();
		trees.forEach( tree => collectSlugsFromTree( tree, slugs ) );

		const schema = buildFullAttributeSchema( blockTypes, slugs );
		const patches = parsePatchPayload( await requestCompletion(
			buildQualityFixPrompt( attachIds( trees ), issues, schema, themeColors )
		) );

		if ( ! patches.length ) {
			break;
		}

		const patched = jsonTreeToBlocks( applyAttributePatches( trees, patchesToMap( patches ) ), getBlockType );

		// Never let a fix pass break a valid layout.
		if ( ! validateGeneratedBlocks( patched, getBlockType ).valid ) {
			break;
		}

		current = patched;
	}

	return current;
};

const generateFromCatalog = async({
	task,
	blockTypes,
	themeColors = [],
	requestCompletion,
	history,
	onPhase,
	onPlanReady,
	onRootComplete
}: GenerateBlocksFromTaskArgs): Promise<BlockGenerationResult> => {
	const getBlockType = ( name: string ) => blockTypes.find( blockType => blockType.name === name );
	const droppedRoots: DroppedGeneratedRoot[] = [];
	const atomicAvailable = blockTypes.some( blockType => blockType.name.startsWith( 'atomic-wind/' ) );

	// Phase 1 — plan the mission, design direction and section outline.
	const catalog = buildStructureCatalog( blockTypes );
	const planPrompt = buildPlanPrompt( task, catalog, atomicAvailable, themeColors, history );

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

		const { blocks: rootBlocks, errors } = await fillRootWithRepair( attributePrompt, requestCompletion, getBlockType );

		if ( ! rootBlocks.length ) {
			const dropped = { root: root as GeneratedBlockTree, errors: errors.length ? errors : [ 'Attribute generation returned no block.' ] };
			droppedRoots.push( dropped );
			onRootComplete?.({ rootIndex: index, totalRoots: validRoots.length, blocks: [], notes: root.notes, dropped });
			continue;
		}

		blocks.push( ...rootBlocks );
		onRootComplete?.({ rootIndex: index, totalRoots: validRoots.length, blocks: rootBlocks, notes: root.notes });
	}

	// Deterministic quality critic + fix pass (contrast/palette/copy/essentials).
	let finalBlocks = blocks;
	if ( finalBlocks.length ) {
		onPhase?.( 'polishing' );
		finalBlocks = await applyQualityFixes( finalBlocks, blockTypes, themeColors, requestCompletion, getBlockType );
	}

	return {
		blocks: finalBlocks,
		plan,
		rationale: plan.rationale,
		diagnostics: {
			droppedRoots
		}
	};
};

/*
 * Pattern-aware orchestrator. Runs the full Req 1–5 flow and falls back to
 * generating any section the model could not match (or whose chosen pattern
 * pruned away) so the page is never left with a hole.
 */
const generateWithPatterns = async({
	task,
	blockTypes,
	themeColors = [],
	patterns = [],
	requestCompletion,
	history,
	onPhase,
	onPlanReady,
	onRootComplete
}: GenerateBlocksFromTaskArgs): Promise<BlockGenerationResult> => {
	const getBlockType = ( name: string ) => blockTypes.find( blockType => blockType.name === name );
	const droppedRoots: DroppedGeneratedRoot[] = [];
	const atomicAvailable = blockTypes.some( blockType => blockType.name.startsWith( 'atomic-wind/' ) );

	// Req 1 — the high-level layout brief (mission, design, conceptual sections).
	onPhase?.( 'briefing' );
	const brief = parseLayoutBrief( await requestCompletion( buildLayoutBriefPrompt( task, atomicAvailable, themeColors, history ) ) );

	// A brief with no sections can still be salvaged by the catalog path.
	if ( ! brief.sections.length ) {
		return generateFromCatalog({ task, blockTypes, themeColors, requestCompletion, history, onPlanReady, onRootComplete });
	}

	const patternsByName = patterns.reduce<Record<string, PatternLike>>( ( acc, pattern ) => {
		if ( pattern?.name ) {
			acc[ pattern.name ] = pattern;
		}
		return acc;
	}, {});

	const plan: GenerationPlan = { mission: brief.mission, design: brief.design, rationale: [], roots: [] };

	// Req 2 — let the model assign a library pattern to each section, or null.
	onPhase?.( 'selecting' );
	const patternCatalog = buildPatternCatalog( patterns );
	const assignments = patternCatalog.length
		? parsePatternAssignments( await requestCompletion( buildPatternSelectionPrompt( brief, patternCatalog ) ) )
		: [];

	const assignmentBySection = assignments.reduce<Record<string, PatternAssignment>>( ( acc, assignment ) => {
		acc[ assignment.sectionId ] = assignment;
		return acc;
	}, {});

	// Resolve each chosen pattern to attribute-carrying trees up front, so a
	// pattern that prunes to nothing falls back to generation as a "missing"
	// section instead of leaving a gap.
	const patternTreesBySection: Record<string, GeneratedBlockTree[]> = {};
	const missingSections: LayoutSection[] = [];

	for ( const section of brief.sections ) {
		const patternName = assignmentBySection[ section.id ]?.patternName;
		const pattern = patternName ? patternsByName[ patternName ] : undefined;
		const trees = pattern ? patternToTrees( pattern, patternsByName ) : [];

		// Keep only structurally valid trees (drops patterns using blocks we
		// cannot render). A pattern that survives at least one root is reused.
		const validTrees = trees.filter( tree => validateGeneratedBlocks( jsonTreeToBlocks([ tree ], getBlockType ), getBlockType ).valid );

		if ( validTrees.length ) {
			patternTreesBySection[ section.id ] = validTrees;
		} else {
			missingSections.push( section );
		}
	}

	// Req 3 — outline the sections with no usable pattern, in one batched call.
	onPhase?.( 'outlining' );
	const outlineBySection: Record<string, StructureNode[]> = {};

	if ( missingSections.length ) {
		const catalog = buildStructureCatalog( blockTypes );
		const outlineRoots = parseOutlineRoots(
			await requestCompletion( buildMissingOutlinePrompt( task, brief, missingSections, catalog, atomicAvailable ) )
		);

		// Map each outlined root back to its section, defaulting to the first
		// missing section when the model omits the id.
		for ( let index = 0; index < outlineRoots.length; index++ ) {
			const root = outlineRoots[ index ];
			const sectionId = root.sectionId && missingSections.some( section => section.id === root.sectionId )
				? root.sectionId
				: missingSections[0].id;

			if ( ! outlineBySection[ sectionId ] ) {
				outlineBySection[ sectionId ] = [];
			}

			outlineBySection[ sectionId ].push({ name: root.name, notes: root.notes, innerBlocks: root.innerBlocks });
		}
	}

	// Req 4 — combine patterns and generated outlines into one ordered draft.
	const draftRoots: DraftRoot[] = [];

	for ( const section of brief.sections ) {
		const patternTrees = patternTreesBySection[ section.id ];

		if ( patternTrees?.length ) {
			// Each tree already passed full structural validation above, so it is
			// reused as-is; `node` only carries the slug + intent for reporting.
			patternTrees.forEach( tree => draftRoots.push({
				source: 'pattern',
				sectionId: section.id,
				node: { name: tree.name, notes: section.intent },
				seed: tree
			}) );
			continue;
		}

		const outline = outlineBySection[ section.id ];
		if ( ! outline?.length ) {
			continue;
		}

		const validRoots = validateStructure( outline, getBlockType, undefined, [], droppedRoots );
		validRoots.forEach( root => draftRoots.push({ source: 'generated', sectionId: section.id, node: root }) );
	}

	onPlanReady?.({ ...plan, roots: draftRoots.map( draft => draft.node ) });

	// Req 5 — fill/rewrite each section in order, reporting progress per root.
	onPhase?.( 'building' );
	const blocks: BlockProps<unknown>[] = [];

	for ( let index = 0; index < draftRoots.length; index++ ) {
		const draft = draftRoots[ index ];
		const intent = brief.sections.find( section => section.id === draft.sectionId )?.intent;
		const slugs = new Set<string>();

		let rootBlocks: BlockProps<unknown>[] = [];
		let errors: string[] = [];

		if ( 'pattern' === draft.source && draft.seed ) {
			collectSlugsFromTree( draft.seed, slugs );
			const schema = buildAttributeSchema( blockTypes, slugs );
			const rootUsesAtomic = [ ...slugs ].some( slug => slug.startsWith( 'atomic-wind/' ) );
			const rewritePrompt = buildPatternRewritePrompt( task, draft.seed, schema, rootUsesAtomic, plan, intent, themeColors );

			( { blocks: rootBlocks, errors } = await fillRootFromCompletion( rewritePrompt, requestCompletion, getBlockType ) );

			// The rewrite is best-effort: if it fails validation, fall back to the
			// pattern verbatim so the section still appears (with its demo text).
			if ( ! rootBlocks.length ) {
				const verbatim = jsonTreeToBlocks([ draft.seed ], getBlockType );
				if ( validateGeneratedBlocks( verbatim, getBlockType ).valid ) {
					rootBlocks = verbatim;
					errors = [];
				}
			}
		} else {
			collectSlugs( draft.node, slugs );
			const schema = buildAttributeSchema( blockTypes, slugs );
			const rootUsesAtomic = [ ...slugs ].some( slug => slug.startsWith( 'atomic-wind/' ) );
			const attributePrompt = buildAttributePrompt( task, draft.node, schema, rootUsesAtomic, plan, themeColors );

			( { blocks: rootBlocks, errors } = await fillRootWithRepair( attributePrompt, requestCompletion, getBlockType ) );
		}

		if ( ! rootBlocks.length ) {
			const dropped = { root: draft.node as GeneratedBlockTree, errors: errors.length ? errors : [ 'Section generation returned no block.' ] };
			droppedRoots.push( dropped );
			onRootComplete?.({ rootIndex: index, totalRoots: draftRoots.length, blocks: [], notes: draft.node.notes, dropped });
			continue;
		}

		blocks.push( ...rootBlocks );
		onRootComplete?.({ rootIndex: index, totalRoots: draftRoots.length, blocks: rootBlocks, notes: draft.node.notes });
	}

	// Deterministic quality critic + fix pass (contrast/palette/copy/essentials).
	let finalBlocks = blocks;
	if ( finalBlocks.length ) {
		onPhase?.( 'polishing' );
		finalBlocks = await applyQualityFixes( finalBlocks, blockTypes, themeColors, requestCompletion, getBlockType );
	}

	return {
		blocks: finalBlocks,
		plan: { ...plan, roots: draftRoots.map( draft => draft.node ) },
		rationale: plan.rationale,
		diagnostics: {
			droppedRoots
		}
	};
};

export const generateBlocksFromTask = async(
	args: GenerateBlocksFromTaskArgs
): Promise<BlockGenerationResult> => {
	if ( args.patterns?.length ) {
		return generateWithPatterns( args );
	}

	return generateFromCatalog( args );
};

/*
 * Refine an existing generation result: the current blocks are handed to the
 * model as the reference, and only the requested change is applied in a single
 * pass. The previous result is kept untouched when the edit can't be parsed or
 * fails validation, so a bad refine never destroys a good layout.
 */
export const refineGeneratedBlocks = async({
	task,
	instruction,
	baseBlocks,
	blockTypes,
	themeColors = [],
	requestCompletion,
	referenceContext,
	history,
	onPhase
}: RefineBlocksArgs ): Promise<BlockGenerationResult> => {
	const getBlockType = ( name: string ) => blockTypes.find( blockType => blockType.name === name );
	const emptyPlan: GenerationPlan = { mission: '', design: {}, rationale: [], roots: [] };

	const trees = blocksToTrees( baseBlocks );

	// Nothing to refine against — let the result stand.
	if ( ! trees.length ) {
		return { blocks: baseBlocks, plan: emptyPlan, rationale: [], diagnostics: { droppedRoots: [] }};
	}

	const slugs = new Set<string>();
	trees.forEach( tree => collectSlugsFromTree( tree, slugs ) );

	const schema = buildFullAttributeSchema( blockTypes, slugs );
	const rootUsesAtomic = [ ...slugs ].some( slug => slug.startsWith( 'atomic-wind/' ) );

	onPhase?.( 'refining' );

	const idTree = attachIds( trees );
	const idToBlockName = buildIdToBlockNameMap( idTree );

	const patches = parsePatchPayload( await requestCompletion(
		buildRefinePrompt( task, instruction, idTree, schema, rootUsesAtomic, themeColors, history, referenceContext )
	) );

	// No actionable patch — leave the current result untouched.
	if ( ! patches.length ) {
		return { blocks: baseBlocks, plan: emptyPlan, rationale: [], diagnostics: { droppedRoots: [] }};
	}

	const normalizedPatches = patches
		.map( ( patch ) => ({
			id: patch.id,
			attributes: normalizePatchAttributes(
				idToBlockName[ patch.id ] || '',
				patch.attributes,
				getBlockType
			)
		}) )
		.filter( ( patch ) => Object.keys( patch.attributes ).length );

	if ( ! normalizedPatches.length ) {
		return { blocks: baseBlocks, plan: emptyPlan, rationale: [], diagnostics: { droppedRoots: [] }};
	}

	// Preserve editor clientIds and nesting; only attributes change.
	const blocks = applyPatchesToBlocks( baseBlocks, normalizedPatches );
	const validation = validateGeneratedBlocks( blocks, getBlockType, { skipRootParentChecks: true } );

	if ( ! validation.valid ) {
		return {
			blocks: baseBlocks,
			plan: emptyPlan,
			rationale: [],
			diagnostics: { droppedRoots: [{ root: { name: 'refine', innerBlocks: [] }, errors: validation.errors }] }
		};
	}

	return {
		blocks,
		plan: emptyPlan,
		rationale: [],
		diagnostics: { droppedRoots: [] }
	};
};
