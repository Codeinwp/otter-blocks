/**
 * Deterministic, model-free quality checks over a generated block tree. These
 * catch the issues a designer (or a vision model) would catch — unreadable
 * contrast, off-palette colors, duplicated/placeholder copy, empty essentials —
 * using only the tree and the theme palette, so they work with any text model.
 *
 * Each issue is keyed by the same index-path id the patch toolkit uses, so the
 * fix pass can target the exact block.
 */

/**
 * WordPress dependencies.
 */
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import type { BlockProps } from '../../helpers/blocks';
import type { ThemeColor } from './block-generation';
import { childId } from './block-patches';
import { contrastRatio, hexToRgb, MIN_CONTRAST_AA } from './color-utils';

export type QualityIssueType =
	| 'contrast'
	| 'off-palette'
	| 'duplicate-copy'
	| 'empty-copy'
	| 'placeholder-copy'
	| 'missing-alt'
	| 'empty-label';

export type QualityIssue = {
	id: string;
	type: QualityIssueType;
	message: string;
};

type FindQualityIssuesOptions = {
	themeColors?: ThemeColor[];
};

// Attribute keys that hold author-facing text across core and Otter blocks.
const TEXT_ATTRIBUTE_KEYS = [ 'content', 'value', 'title', 'label', 'text', 'caption', 'heading' ];

const PLACEHOLDER_PATTERN = /lorem ipsum|your (text|content|heading|title) here|add (your )?(text|content)|placeholder|sample text|click here to edit|insert text/i;

const stripTags = ( html: string ): string => html.replace( /<[^>]*>/g, '' ).replace( /\s+/g, ' ' ).trim();

const buildSlugToHex = ( themeColors: ThemeColor[] ): Record<string, string> => {
	return ( themeColors || []).reduce<Record<string, string>>( ( acc, color ) => {
		if ( color?.slug && color?.color ) {
			acc[ color.slug ] = color.color;
		}
		return acc;
	}, {});
};

/*
 * Resolve a color attribute value (a palette slug or a raw hex) to a hex string,
 * or null when it is neither (gradient, CSS var, unknown slug).
 */
const resolveColor = ( value: unknown, slugToHex: Record<string, string> ): string | null => {
	if ( 'string' !== typeof value || ! value ) {
		return null;
	}

	if ( slugToHex[ value ] ) {
		return slugToHex[ value ];
	}

	return hexToRgb( value ) ? value : null;
};

type BlockColors = { background: string | null; text: string | null };

/*
 * Pull a block's foreground/background colors from the usual attribute spots:
 * named slugs (backgroundColor/textColor/color) and the style.color object.
 */
const extractColors = ( attributes: Record<string, unknown>, slugToHex: Record<string, string> ): BlockColors => {
	const style = attributes.style as { color?: { background?: string; text?: string } } | undefined;

	const background = resolveColor( attributes.backgroundColor, slugToHex ) ||
		resolveColor( style?.color?.background, slugToHex );

	const text = resolveColor( attributes.textColor, slugToHex ) ||
		resolveColor( attributes.color, slugToHex ) ||
		resolveColor( style?.color?.text, slugToHex );

	return { background, text };
};

const extractTexts = ( attributes: Record<string, unknown> ): string[] => {
	return TEXT_ATTRIBUTE_KEYS
		.map( key => attributes[ key ] )
		.filter( ( value ): value is string => 'string' === typeof value )
		.map( stripTags )
		.filter( Boolean );
};

/*
 * A block is "text-bearing" if it exposes any of the known text attribute keys,
 * even when currently empty — used to flag empty/placeholder copy.
 */
const hasTextAttribute = ( attributes: Record<string, unknown> ): boolean => {
	return TEXT_ATTRIBUTE_KEYS.some( key => key in attributes );
};

const isButton = ( name: string ): boolean => name.includes( 'button' );
const isImage = ( name: string ): boolean => name.endsWith( '/image' ) || name.endsWith( '-image' );

/*
 * Per-block checks that need no cross-block context (contrast, off-palette,
 * empty/placeholder copy, empty label, missing alt).
 */
const checkBlock = (
	id: string,
	name: string,
	attributes: Record<string, unknown>,
	slugToHex: Record<string, string>,
	validSlugs: Set<string>
): QualityIssue[] => {
	const issues: QualityIssue[] = [];

	const { background, text } = extractColors( attributes, slugToHex );

	if ( background && text ) {
		const ratio = contrastRatio( text, background );
		if ( null !== ratio && ratio < MIN_CONTRAST_AA ) {
			issues.push({
				id,
				type: 'contrast',
				message: sprintf(
					// translators: %1$s: block name, %2$s: contrast ratio.
					__( '%1$s has low text contrast (%2$s:1) — adjust its text or background color.', 'otter-blocks' ),
					name,
					ratio.toFixed( 1 )
				)
			});
		}
	}

	// Named color slugs that are not part of the theme palette.
	[ attributes.backgroundColor, attributes.textColor, attributes.color ].forEach( value => {
		if ( 'string' === typeof value && value && ! hexToRgb( value ) && ! validSlugs.has( value ) ) {
			issues.push({
				id,
				type: 'off-palette',
				message: sprintf(
					// translators: %1$s: block name, %2$s: color slug.
					__( '%1$s uses a color "%2$s" that is not in the theme palette.', 'otter-blocks' ),
					name,
					value
				)
			});
		}
	});

	const texts = extractTexts( attributes );

	if ( hasTextAttribute( attributes ) && ! texts.length ) {
		issues.push({
			id,
			type: isButton( name ) ? 'empty-label' : 'empty-copy',
			message: sprintf(
				// translators: %s: block name.
				__( '%s has empty text — fill it with on-topic copy.', 'otter-blocks' ),
				name
			)
		});
	}

	texts.forEach( value => {
		if ( PLACEHOLDER_PATTERN.test( value ) ) {
			issues.push({
				id,
				type: 'placeholder-copy',
				message: sprintf(
					// translators: %s: block name.
					__( '%s still contains placeholder text — replace it with real copy.', 'otter-blocks' ),
					name
				)
			});
		}
	});

	if ( isImage( name ) && ! ( 'string' === typeof attributes.alt && attributes.alt.trim() ) ) {
		issues.push({
			id,
			type: 'missing-alt',
			message: sprintf(
				// translators: %s: block name.
				__( '%s is missing descriptive alt text.', 'otter-blocks' ),
				name
			)
		});
	}

	return issues;
};

/**
 * Walk a generated block tree and return all quality issues, each tagged with
 * the offending block's index-path id.
 *
 * @param blocks  The generated blocks.
 * @param options Theme palette for resolving and validating colors.
 */
export const findQualityIssues = (
	blocks: BlockProps<unknown>[],
	options: FindQualityIssuesOptions = {}
): QualityIssue[] => {
	const slugToHex = buildSlugToHex( options.themeColors || []);
	const validSlugs = new Set( Object.keys( slugToHex ) );

	const issues: QualityIssue[] = [];
	const seenTexts = new Map<string, string>();

	const walk = ( nodes: BlockProps<unknown>[], prefix: string ) => {
		nodes.forEach( ( node, index ) => {
			if ( ! node?.name ) {
				return;
			}

			const id = childId( prefix, index );
			const attributes = ( node.attributes || {}) as Record<string, unknown>;

			issues.push( ...checkBlock( id, node.name, attributes, slugToHex, validSlugs ) );

			// Cross-block: the same non-trivial copy appearing on two blocks.
			extractTexts( attributes ).forEach( value => {
				if ( 12 > value.length ) {
					return;
				}
				if ( seenTexts.has( value ) ) {
					issues.push({
						id,
						type: 'duplicate-copy',
						message: sprintf(
							// translators: %s: block name.
							__( '%s repeats copy used elsewhere — make it unique.', 'otter-blocks' ),
							node.name
						)
					});
				} else {
					seenTexts.set( value, id );
				}
			});

			walk( ( node.innerBlocks || []) as BlockProps<unknown>[], id );
		});
	};

	walk( blocks, '' );

	return issues;
};

/**
 * Format issues for a prompt, one per line as `id: message`.
 *
 * @param issues The issues to format.
 */
export const formatIssuesForPrompt = ( issues: QualityIssue[] ): string => {
	return issues.map( issue => `${ issue.id }: ${ issue.message }` ).join( '\n' );
};
