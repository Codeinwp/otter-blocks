/**
 * WordPress dependencies.
 */
import { parse, rawHandler, serialize } from '@wordpress/blocks';

/**
 * Internal dependencies.
 */
import type { BlockProps } from '../../helpers/blocks';
import { isRichTextBlock } from './actions';

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

export const extractBlockTypes = ( blocks: BlockProps<unknown>[] ): string => {
	return blocks.map( ( block ) => block.name?.replace( 'core/', '' ) || block.name ).join( ', ' );
};

export const parseGeneratedHtml = ( html: string ) => {
	return rawHandler({
		HTML: html
	});
};

/**
 * Parse AI-generated content into blocks. Tries the WordPress block parser
 * first (handles `<!-- wp:xxx -->` comment syntax), then falls back to
 * {@link parseGeneratedHtml} for raw HTML.
 *
 * @param {string} html Generated HTML or block markup.
 */
export const parseGeneratedContent = ( html: string ) => {
	const blocks = parse( html );

	if ( blocks.length ) {
		return blocks;
	}

	return parseGeneratedHtml( html );
};

export const preservePlainTextAsBlock = (
	generatedHtml: string,
	sourceBlocks: BlockProps<unknown>[]
) => {
	const plainText = generatedHtml.replace( /<[^>]+>/g, '' ).trim();

	if ( plainText && plainText === generatedHtml.trim() && 1 === sourceBlocks.length ) {
		const source = sourceBlocks[0];

		if ( 'core/paragraph' === source.name ) {
			return parseGeneratedHtml( `<p>${ plainText }</p>` );
		}

		if ( 'core/heading' === source.name ) {
			const level = ( source.attributes?.level as number ) || 2;
			return parseGeneratedHtml( `<h${ level }>${ plainText }</h${ level }>` );
		}
	}

	return parseGeneratedContent( generatedHtml );
};

/**
 * Apply generated content to blocks, routing through the appropriate parser
 * based on the action's availability. "Any block" actions skip the
 * plain-text-wrapping logic so structural rebuilds survive deserialization.
 *
 * @param {string}                                               generatedHtml Generated content from the model.
 * @param {import('../../helpers/blocks').BlockProps<unknown>[]} sourceBlocks  Selected source blocks.
 * @param {'richtext'|'any'}                                     availability  Action availability scope.
 */
export const applyGeneratedContent = (
	generatedHtml: string,
	sourceBlocks: BlockProps<unknown>[],
	availability: 'richtext' | 'any'
) => {
	if ( 'any' === availability ) {
		return parseGeneratedContent( generatedHtml );
	}

	return preservePlainTextAsBlock( generatedHtml, sourceBlocks );
};

export const getSelectedBlockClientIds = (
	isMultipleSelection: boolean,
	selectedClientIds: string[],
	singleClientId: string
): string[] => {
	return isMultipleSelection ? selectedClientIds : [ singleClientId ];
};
