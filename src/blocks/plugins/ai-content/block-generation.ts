/**
 * WordPress dependencies.
 */
import { createBlock } from '@wordpress/blocks';

/**
 * Internal dependencies.
 */
import type { BlockProps } from '../../helpers/blocks';
import { isObject, parseJsonResponse, toStringArray } from './json-utils';
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

/** One section brief from the page-outline step: a label and its intent, no blocks. */
export type SectionBrief = {
	title: string;
	notes?: string;
};

/**
 * The lightweight page-outline output: the shared mission/design/rationale plus an
 * ordered list of section briefs. No block slugs or nesting — those are chosen per
 * section in a later step, so this call stays small.
 */
export type PageOutline = {
	mission: string;
	design: DesignDirection;
	rationale: string[];
	sections: SectionBrief[];
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
	 * Generation scope. 'page' builds a full multi-section page; to keep any single
	 * model call small enough to come back cleanly, a page is planned as
	 * lightweight section briefs first, then each section is outlined and filled on
	 * its own call. 'section' (the default) plans and fills one section in the
	 * original single-outline flow.
	 */
	scope?: 'section' | 'page';

	/** Coarse pipeline phase, for driving the loading copy. */
	onPhase?: ( phase: 'planning' | 'refining' ) => void;
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
	'themeisle-blocks/flip',
	// The Atomic Wind layout primitive — every section, row and card is a box,
	// and it holds its inner primitives without advertising allowedBlocks.
	'atomic-wind/box'
]);

/*
 * Non-Atomic-Wind blocks the generator may use in addition to the primitives,
 * for things the primitives can't express: a working contact form and a map.
 * Curated on purpose — the map is the no-API-key Leaflet block, and the form is
 * limited to the field types the model can author from text attributes alone.
 */
const GENERATION_EXTRA_BLOCKS = new Set([
	'themeisle-blocks/form',
	'themeisle-blocks/form-input',
	'themeisle-blocks/form-textarea',
	'themeisle-blocks/form-multiple-choice',
	'themeisle-blocks/leaflet-map'
]);

const isGenerationBlock = ( blockType: BlockTypeLike ): boolean => {
	return blockType.name.startsWith( 'atomic-wind/' ) || GENERATION_EXTRA_BLOCKS.has( blockType.name );
};

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

	// The Atomic Wind primitives are the generation vocabulary, plus the curated
	// extras (form, map) — never let the asset/service filter drop one (e.g.
	// atomic-wind/image matches "image", themeisle-blocks/leaflet-map matches "map").
	if ( isGenerationBlock( blockType ) ) {
		return true;
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
 * container hint). The vocabulary is the `atomic-wind/*` primitives plus the
 * curated extras (form, map); every other block type is excluded so the model is
 * never shown a block it shouldn't use.
 *
 * @param blockTypes The registered block types to filter into the catalog.
 */
export const buildStructureCatalog = (
	blockTypes: BlockTypeLike[]
): StructureCatalogEntry[] => {
	const containerSlugs = collectContainerSlugs( blockTypes );

	return blockTypes
		.filter( isCatalogBlockAllowed )
		.filter( isGenerationBlock )
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

/**
 * Parse the page-outline step: mission, design, rationale and a list of section
 * briefs. Tolerant — anything unparseable yields zero sections so the caller can
 * fall back to the single-outline flow.
 *
 * @param response The raw model response for the page-outline prompt.
 */
const parsePageOutline = ( response: string ): PageOutline => {
	const parsed = parseJsonResponse( response );

	if ( ! parsed ) {
		return { mission: '', design: {}, rationale: [], sections: [] };
	}

	const sections = Array.isArray( parsed.sections )
		? parsed.sections
			.filter( isObject )
			.map( ( entry ) => ({
				title: 'string' === typeof entry.title ? entry.title : '',
				notes: 'string' === typeof entry.notes ? entry.notes : undefined
			}) )
			.filter( ( section ) => section.title || section.notes )
		: [];

	return {
		mission: 'string' === typeof parsed.mission ? parsed.mission : '',
		design: parseDesignDirection( parsed.design ),
		rationale: toStringArray( parsed.rationale ),
		sections
	};
};

const collectSlugs = ( node: StructureNode, slugs: Set<string> ) => {
	slugs.add( node.name );
	( node.innerBlocks || []).forEach( inner => collectSlugs( inner, slugs ) );
};

/*
 * The way a section's tree balloons is a long run of same-slug siblings — a
 * gallery's tiles, a grid's cards, a list's rows. Each extra item multiplies the
 * copy + classes the CONSTRUCT step must emit in one response, and that is what
 * tips a section over the upstream size limit (the reply comes back non-JSON).
 * Cap each such run to a representative few so no single section can grow large
 * enough to fail, regardless of what the outline asked for.
 */
const MAX_REPEATED_SIBLINGS = 4;

const capSectionSize = ( node: StructureNode ): StructureNode => {
	const children = node.innerBlocks ?? [];

	if ( ! children.length ) {
		return node;
	}

	const kept: StructureNode[] = [];
	const seenBySlug: Record<string, number> = {};

	for ( const child of children ) {
		const seen = ( seenBySlug[ child.name ] ?? 0 ) + 1;
		seenBySlug[ child.name ] = seen;

		// Trim only the surplus repeats of one slug at this level; the first few
		// (the representative set) are kept and recursed into.
		if ( seen <= MAX_REPEATED_SIBLINGS ) {
			kept.push( capSectionSize( child ) );
		}
	}

	return { ...node, innerBlocks: kept };
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

/*
 * Keep any one section small enough that its single CONSTRUCT call (which must
 * fill copy + classes for the whole tree at once) stays well under upstream
 * size/latency limits. A sprawling section is the thing that comes back non-JSON.
 */
const SECTION_SIZE_HINT = 'Keep this section compact: prefer a small, focused block tree over a sprawling one. For any repeating group (gallery, grid, cards, testimonials, logos, steps), include only 3–4 representative items — never a long list. A lean section that reads well beats an exhaustive one.';

const ATOMIC_WIND_FORCE_HINT = 'Build the structure from Atomic Wind primitives: atomic-wind/box, atomic-wind/text, atomic-wind/icon, atomic-wind/link and atomic-wind/image. Use atomic-wind/box for every section, row, card and container, and nest the content primitives inside it — a box can reproduce any layout, so do NOT use other block types for layout or content. The ONLY exceptions, used solely when the task explicitly calls for them: a contact form — themeisle-blocks/form holding themeisle-blocks/form-input, themeisle-blocks/form-textarea and/or themeisle-blocks/form-multiple-choice children — and a map — themeisle-blocks/leaflet-map. Wrap either inside an atomic-wind/box so its surrounding layout, heading and spacing still come from primitives. Give each top-level section box "align":"full" and its own padding (e.g. "px-6 py-24"), then constrain and center its content with an inner box (e.g. "mx-auto max-w-5xl flex flex-col items-center gap-8 text-center"). Space children with the parent box\'s flex/grid "gap" — not element margins.';

const buildPlanPrompt = (
	task: string,
	catalog: StructureCatalogEntry[],
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
		SECTION_SIZE_HINT,
		ATOMIC_WIND_FORCE_HINT,
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

export const ATOMIC_WIND_ATTRIBUTE_HINT = [
	'Atomic Wind blocks (atomic-wind/*) are styled entirely with Tailwind v4 utility classes set on their "className" attribute — layout, spacing, color and typography — e.g. "flex flex-col gap-6 p-8 rounded-xl bg-slate-900 text-white". Any valid Tailwind v4 utility works, including arbitrary values ("bg-[#0f172a]", "w-[320px]"), gradients ("bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950"), opacity ("bg-white/10", "border-white/20"), state and group variants ("transition hover:bg-violet-200", "group", "group-hover:grayscale-0"), responsive prefixes ("md:grid-cols-3", "md:text-7xl") and sizing ("size-6", "aspect-square").',
	'Rules for atomic-wind blocks:',
	'- Always add "m-0" to every atomic-wind/text, atomic-wind/image and atomic-wind/icon className. Spacing comes from the parent box\'s gap; without "m-0" the site theme reintroduces heading/paragraph margins on the frontend (they show only after insertion, not in preview).',
	'- atomic-wind/icon renders its own SVG from a Lucide icon name in kebab-case set in its "icon" attribute (e.g. "star", "check", "arrow-right", "sparkles", "menu"). Style it with size/color utilities ("size-6 text-indigo-500") and give it no text content.',
	'- Use "tagName" to pick the right semantic element (section, header, nav, article for boxes; h1–h3, p, span, div for text).',
	'- Never put prose into "className". Keep the palette coherent and text readable against its background.',
	'- For a form: themeisle-blocks/form contains one themeisle-blocks/form-input per field — set its "label", "placeholder" and "type" ("text", "email", "tel", …) — plus a themeisle-blocks/form-textarea (set "label"/"placeholder") for messages. The form renders its own submit button, so do not add one. Leave provider/email settings unset; the user configures delivery after insertion.',
	'- For a map: themeisle-blocks/leaflet-map needs no API key. Set "location" to a human-readable address string (e.g. "350 5th Ave, New York, NY"); leave latitude/longitude unset. Give it a height via the surrounding box or its own attributes.'
].join( '\n' );

/*
 * One validated Atomic Wind section (adapted from the design library's
 * 08-aw-gradient-hero pattern) expressed in the exact { name, attributes,
 * innerBlocks } shape the CONSTRUCT step must return. Shown as a few-shot so the
 * model copies real, working className combinations (gradient section, badge with
 * icon, responsive heading, gap spacing, "m-0" on text, dual CTAs) instead of
 * inventing markup. The model adapts the structure and copy to the task.
 */
const ATOMIC_WIND_EXAMPLE_TREE = {
	name: 'atomic-wind/box',
	attributes: { tagName: 'section', align: 'full', className: 'bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 px-6 py-28' },
	innerBlocks: [ {
		name: 'atomic-wind/box',
		attributes: { className: 'mx-auto flex max-w-5xl flex-col items-center gap-8 text-center' },
		innerBlocks: [ {
			name: 'atomic-wind/box',
			attributes: { className: 'inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5' },
			innerBlocks: [
				{ name: 'atomic-wind/icon', attributes: { icon: 'sparkles', className: 'size-4 text-violet-300' }, innerBlocks: [] },
				{ name: 'atomic-wind/text', attributes: { tagName: 'span', content: 'Now in public beta', className: 'm-0 text-sm font-medium text-violet-200' }, innerBlocks: [] }
			]
		}, {
			name: 'atomic-wind/text',
			attributes: { tagName: 'h1', content: 'Your data, finally fluent.', className: 'm-0 text-5xl font-bold tracking-tight text-white md:text-7xl' },
			innerBlocks: []
		}, {
			name: 'atomic-wind/text',
			attributes: { content: 'Pulse turns raw product events into answers your whole team can read — no SQL, no waiting.', className: 'm-0 max-w-2xl text-lg leading-relaxed text-indigo-200' },
			innerBlocks: []
		}, {
			name: 'atomic-wind/box',
			attributes: { className: 'mt-2 flex flex-wrap justify-center gap-4' },
			innerBlocks: [
				{ name: 'atomic-wind/link', attributes: { url: '#signup', text: 'Start free', className: 'inline-block rounded-full bg-white px-8 py-4 text-sm font-bold text-slate-950 transition hover:bg-violet-200' }, innerBlocks: [] },
				{ name: 'atomic-wind/link', attributes: { url: '#demo', text: 'Watch the demo', className: 'inline-block rounded-full border border-white/30 px-8 py-4 text-sm font-bold text-white transition hover:bg-white/10' }, innerBlocks: [] }
			]
		} ]
	} ]
};

const ATOMIC_WIND_EXAMPLE = `Reference example — a well-formed Atomic Wind section in this exact output shape. Adapt its structure, classes and palette to the current task; do NOT copy its wording:\n${ JSON.stringify( ATOMIC_WIND_EXAMPLE_TREE ) }`;

const buildAttributePrompt = (
	task: string,
	root: StructureNode,
	schema: AttributeSchemaEntry[],
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
		ATOMIC_WIND_ATTRIBUTE_HINT,
		ATOMIC_WIND_EXAMPLE,
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
 * Full-page step 1 — the lightweight page outline. Plans the mission, a shared
 * design direction and an ordered list of section briefs (title + intent) with NO
 * blocks, so the response stays small. The catalog is deliberately omitted here.
 */
const buildPageOutlinePrompt = (
	task: string,
	themeColors: ThemeColor[],
	history?: string[]
) => {
	const palette = formatPaletteForPrompt( themeColors );

	return [
		PIPELINE_STEP.PAGE_OUTLINE,
		...formatHistoryForPrompt( history ),
		'First decide the mission: 1–2 sentences describing what the finished page should look like and achieve.',
		'Then commit to a design direction the whole page will share: an overall style, a palette of 3–5 colors, a border radius/roundness, a spacing rhythm, and a typography feel.',
		...( palette ? [ `Build the palette ONLY from these theme color slugs — pick 3–5 and list them by slug, do not invent color names:\n${ palette }` ] : []),
		'Then break the page into an ordered list of sections. For each section give a short "title" (e.g. "Hero", "Gallery", "Pricing") and a "notes" string describing that section\'s intent plus any structure or styling guidance for it. Do NOT choose blocks or nesting yet — each section is outlined and built on its own in later steps.',
		'Include only the sections the task calls for; keep the page focused and coherent.',
		'Return strict JSON: { "mission": string, "design": { "style": string, "palette": string[], "borderRadius": string, "spacing": string, "typography": string }, "rationale": string[], "sections": [ { "title": string, "notes": string } ] }.',
		'Task:',
		task
	].join( '\n\n' );
};

/*
 * Full-page step 2 — outline ONE section's block structure. Given the shared
 * mission/design and a single section brief, the model picks catalog slugs and
 * nesting for just that section, so no call ever serializes the whole page tree.
 */
const buildSectionStructurePrompt = (
	task: string,
	section: SectionBrief,
	catalog: StructureCatalogEntry[],
	plan: GenerationPlan
) => {
	const design = formatDesignForPrompt( plan.design );

	return [
		PIPELINE_STEP.SECTION_OUTLINE,
		...( plan.mission ? [ `Overall page mission: ${ plan.mission }` ] : [] ),
		...( design ? [ `Shared design direction — keep this section consistent with it: ${ design }.` ] : [] ),
		`This section is "${ section.title }"${ section.notes ? `: ${ section.notes }` : '' }.`,
		'Choose blocks from the catalog by slug and arrange them into a nested tree for THIS section only.',
		'Only nest blocks inside a block whose slug is marked [container].',
		'Do NOT include any attributes yet — only "name" (a catalog slug), an optional "notes" string, and "innerBlocks".',
		'If you use a form block, do NOT add a separate submit button or button block — the Otter Form already renders its own submit button.',
		'Prefer simple, reusable structures.',
		SECTION_SIZE_HINT,
		ATOMIC_WIND_FORCE_HINT,
		'Return strict JSON: { "roots": [ { "name": string, "notes": string, "innerBlocks": [...] } ] } containing exactly one root — this section.',
		'Block catalog, one per line as `slug: description`. A slug marked [container] can hold inner blocks:',
		formatCatalogForPrompt( catalog ),
		'Task:',
		task
	].join( '\n\n' );
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

export const buildRepairFeedback = ( errors: string[] ): string => {
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

/*
 * The shared state a single section needs to be filled: where to look up block
 * types, where to record drops, and how to talk to the model. Kept in one object
 * so the section path and the page path drive the CONSTRUCT step identically.
 */
type SectionFillContext = {
	task: string;
	blockTypes: BlockTypeLike[];
	themeColors: ThemeColor[];
	requestCompletion: ( prompt: string ) => Promise<string>;
	getBlockType: GetBlockType;
	droppedRoots: DroppedGeneratedRoot[];
	onRootComplete?: ( completion: RootCompletion ) => void;
};

/*
 * A user-initiated cancellation, surfaced by the request layer as an AbortError.
 * It must propagate so generation actually stops — never be swallowed as a
 * "dropped section" the way a real generation failure is.
 */
const isAbortError = ( error: unknown ): boolean =>
	Boolean( error ) && 'AbortError' === ( error as { name?: string } )?.name;

/*
 * Record a section that failed outright (e.g. the request errored / came back
 * non-JSON) so the build can drop it and carry on with the rest of the page.
 */
const dropSection = (
	ctx: SectionFillContext,
	label: string,
	notes: string | undefined,
	index: number,
	totalRoots: number,
	message: string
): void => {
	ctx.droppedRoots.push({ root: { name: label } as GeneratedBlockTree, errors: [ message ] });
	ctx.onRootComplete?.({ rootIndex: index, totalRoots, blocks: [], notes });
};

/*
 * CONSTRUCT one validated section: build its attribute schema from the slugs it
 * uses, fill attributes (with the repair loop), and report completion. Returns the
 * section's blocks, or [] when it was dropped. Shared by the single-section and
 * the full-page flows so both fill sections the exact same way.
 */
const fillSection = async (
	root: StructureNode,
	index: number,
	totalRoots: number,
	plan: GenerationPlan,
	ctx: SectionFillContext
): Promise<BlockProps<unknown>[]> => {
	const slugs = new Set<string>();
	collectSlugs( root, slugs );

	const schema = buildAttributeSchema( ctx.blockTypes, slugs );
	const attributePrompt = buildAttributePrompt( ctx.task, root, schema, plan, ctx.themeColors );

	const { blocks: rootBlocks, errors } = await fillRootWithRepair( attributePrompt, ctx.requestCompletion, ctx.getBlockType );

	if ( ! rootBlocks.length ) {
		const dropped = { root: root as GeneratedBlockTree, errors: errors.length ? errors : [ 'Attribute generation returned no block.' ] };
		ctx.droppedRoots.push( dropped );
		ctx.onRootComplete?.({ rootIndex: index, totalRoots, blocks: [], notes: root.notes, dropped });
		return [];
	}

	ctx.onRootComplete?.({ rootIndex: index, totalRoots, blocks: rootBlocks, notes: root.notes });
	return rootBlocks;
};

const generateFromCatalog = async( args: GenerateBlocksFromTaskArgs ): Promise<BlockGenerationResult> => {
	const { task, blockTypes, themeColors = [], requestCompletion, history, onPlanReady } = args;
	const getBlockType = ( name: string ) => blockTypes.find( blockType => blockType.name === name );
	const droppedRoots: DroppedGeneratedRoot[] = [];

	// Phase 1 — plan the mission, design direction and section outline.
	const catalog = buildStructureCatalog( blockTypes );
	const planPrompt = buildPlanPrompt( task, catalog, themeColors, history );

	const plan = parsePlanPayload( await requestCompletion( planPrompt ) );

	// Phase 2 — prune the outline to a structurally legal tree (notes preserved),
	// then cap any oversized repeated runs so a section can't be too big to fill.
	const validRoots = validateStructure( plan.roots, getBlockType, undefined, [], droppedRoots ).map( capSectionSize );

	onPlanReady?.({ ...plan, roots: validRoots });

	// Phase 3 — fill attributes per root, trickling the plan into each call, and
	// report each finished section so callers can insert it progressively.
	const ctx: SectionFillContext = {
		task, blockTypes, themeColors, requestCompletion, getBlockType, droppedRoots, onRootComplete: args.onRootComplete
	};
	const blocks: BlockProps<unknown>[] = [];

	for ( let index = 0; index < validRoots.length; index++ ) {
		const root = validRoots[ index ];

		if ( ! root ) {
			continue;
		}

		try {
			blocks.push( ...await fillSection( root, index, validRoots.length, plan, ctx ) );
		} catch ( error ) {
			if ( isAbortError( error ) ) {
				throw error;
			}

			// A failed section is dropped, not fatal — keep whatever else builds.
			dropSection( ctx, root.name, root.notes, index, validRoots.length, ( error as Error )?.message ?? 'Section generation failed.' );
		}
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

/*
 * Run an async worker over items with at most `limit` in flight at once, keeping
 * results in input order. Workers must handle their own errors — a thrown worker
 * rejects the whole batch.
 */
const mapWithConcurrency = async <T, R>(
	items: T[],
	limit: number,
	worker: ( item: T, index: number ) => Promise<R>
): Promise<R[]> => {
	const results: R[] = new Array( items.length );
	let cursor = 0;

	const run = async (): Promise<void> => {
		while ( cursor < items.length ) {
			const index = cursor++;
			// index is in-bounds by the loop guard.
			results[ index ] = await worker( items[ index ] as T, index );
		}
	};

	const pool = Array.from( { length: Math.max( 1, Math.min( limit, items.length ) ) }, run );
	await Promise.all( pool );

	return results;
};

/*
 * How many section chains build at once on the full-page flow. Bounded so a big
 * page never fires a dozen simultaneous requests (also kinder to rate limits); the
 * browser caps concurrent connections per host on top of this.
 */
const SECTION_CONCURRENCY = 3;

/*
 * Full-page flow. A single OUTLINE call for an entire page emits the whole nested
 * tree at once and reliably trips upstream size/timeout limits (the response comes
 * back non-JSON). Instead: plan the page as lightweight section briefs, then
 * outline + construct each section on its own (outline → construct) chain. Those
 * chains are independent once the page plan exists, so they run concurrently and
 * are assembled in section order — turning wall-clock from the sum of all sections
 * into roughly the slowest single one. Falls back to the single-outline flow if
 * the page outline yields no usable sections.
 */
const generatePageFromCatalog = async( args: GenerateBlocksFromTaskArgs ): Promise<BlockGenerationResult> => {
	const { task, blockTypes, themeColors = [], requestCompletion, history, onPlanReady } = args;
	const getBlockType = ( name: string ) => blockTypes.find( blockType => blockType.name === name );
	const droppedRoots: DroppedGeneratedRoot[] = [];
	const catalog = buildStructureCatalog( blockTypes );

	// Step 1 — the small page outline: mission, design and ordered section briefs.
	const outline = parsePageOutline( await requestCompletion( buildPageOutlinePrompt( task, themeColors, history ) ) );

	// No usable section list — fall back to the proven single-outline flow rather
	// than fail outright.
	if ( ! outline.sections.length ) {
		return generateFromCatalog( args );
	}

	const plan: GenerationPlan = {
		mission: outline.mission,
		design: outline.design,
		rationale: outline.rationale,
		roots: outline.sections.map( ( section ) => ({ name: section.title, notes: section.notes }) )
	};

	// Report the section count up front so the progress UI knows the total.
	onPlanReady?.( plan );

	const ctx: SectionFillContext = {
		task, blockTypes, themeColors, requestCompletion, getBlockType, droppedRoots, onRootComplete: args.onRootComplete
	};
	const total = outline.sections.length;
	let aborted = false;

	// Step 2 — build one section: outline → cap → construct. A section that fails
	// (its outline or construct errors / comes back non-JSON) is dropped and the
	// build carries on; a user abort flags the whole run to stop. Errors are caught
	// here, never rethrown, so one section can't reject the concurrent batch.
	const buildSection = async( section: SectionBrief | undefined, index: number ): Promise<BlockProps<unknown>[]> => {
		if ( ! section || aborted ) {
			return [];
		}

		try {
			const structurePrompt = buildSectionStructurePrompt( task, section, catalog, plan );
			const structurePayload = parsePlanPayload( await requestCompletion( structurePrompt ) );

			const droppedBefore = droppedRoots.length;
			const validRoots = validateStructure( structurePayload.roots, getBlockType, undefined, [], droppedRoots );
			const root = validRoots[ 0 ] ? capSectionSize( validRoots[ 0 ] ) : undefined;

			if ( ! root ) {
				// Record the lost section (unless validateStructure already did) so the
				// "skipped" diagnostic and the progress step both account for it.
				if ( droppedRoots.length === droppedBefore ) {
					dropSection( ctx, section.title, section.notes, index, total, 'Section outline produced no valid structure.' );
				} else {
					args.onRootComplete?.({ rootIndex: index, totalRoots: total, blocks: [], notes: section.notes });
				}
				return [];
			}

			return await fillSection( root, index, total, plan, ctx );
		} catch ( error ) {
			if ( isAbortError( error ) ) {
				aborted = true;
				return [];
			}

			dropSection( ctx, section.title, section.notes, index, total, ( error as Error )?.message ?? 'Section generation failed.' );
			return [];
		}
	};

	// Build the sections concurrently (bounded) and assemble them in section order.
	const perSection = await mapWithConcurrency( outline.sections, SECTION_CONCURRENCY, buildSection );

	// A cancellation mid-batch unwinds the turn rather than returning a partial.
	if ( aborted ) {
		throw Object.assign( new Error( 'Aborted' ), { name: 'AbortError' } );
	}

	return {
		blocks: perSection.flat(),
		plan,
		rationale: plan.rationale,
		diagnostics: {
			droppedRoots
		}
	};
};


export const generateBlocksFromTask = async(
	args: GenerateBlocksFromTaskArgs
): Promise<BlockGenerationResult> => {
	// Full pages fan out into per-section calls so no single request has to carry
	// the whole page tree; a single section keeps the proven single-outline flow.
	// The Atomic Wind force directive keeps either path on primitives when set.
	if ( 'page' === args.scope ) {
		return generatePageFromCatalog( args );
	}

	return generateFromCatalog( args );
};

