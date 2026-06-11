/**
 * WordPress dependencies.
 */
import { rawHandler, serialize } from '@wordpress/blocks';

/**
 * Internal dependencies.
 */
import { insertBlockBelow } from '../../helpers/block-utility';
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

export const insertGeneratedBlocksBelow = (
	clientId: string,
	generatedHtml: string
) => {
	const blocks = parseGeneratedHtml( generatedHtml );

	if ( ! blocks.length ) {
		return false;
	}

	insertBlockBelow( clientId, blocks );
	return true;
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

	return parseGeneratedHtml( generatedHtml );
};

export const getSelectedBlockClientIds = (
	isMultipleSelection: boolean,
	selectedClientIds: string[],
	singleClientId: string
): string[] => {
	return isMultipleSelection ? selectedClientIds : [ singleClientId ];
};
