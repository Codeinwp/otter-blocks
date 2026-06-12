import { __ } from '@wordpress/i18n';

// div and span intentionally have no entry so generic wrappers fall through
// to the block title and block variation matching.
const TAG_LABELS = {
	section: __( 'Section', 'otter-blocks' ),
	article: __( 'Article', 'otter-blocks' ),
	main: __( 'Main', 'otter-blocks' ),
	aside: __( 'Aside', 'otter-blocks' ),
	header: __( 'Header', 'otter-blocks' ),
	footer: __( 'Footer', 'otter-blocks' ),
	nav: __( 'Navigation', 'otter-blocks' ),
	details: __( 'Details', 'otter-blocks' ),
	summary: __( 'Summary', 'otter-blocks' ),
};

const LABEL_CONTEXTS = [ 'list-view', 'breadcrumb' ];

export const toPlainText = ( value ) => {
	if ( ! value ) {
		return '';
	}
	const text = typeof value === 'string' ? value.replace( /<[^>]+>/g, ' ' ) : value.toPlainText?.() ?? '';
	return text.replace( /\s+/g, ' ' ).trim();
};

// Builds an __experimentalLabel callback. The custom name written by the core
// Rename UI (attributes.metadata.name) must win, because defining our own
// label callback prevents core from displaying it; returning undefined when
// there is no better label keeps the block title and variation titles working.
const createLabel = ( getFallback ) => ( attributes, { context } = {} ) => {
	if ( ! LABEL_CONTEXTS.includes( context ) ) {
		return undefined;
	}
	const customName = attributes?.metadata?.name;
	if ( customName ) {
		return customName;
	}
	return getFallback ? getFallback( attributes ) : undefined;
};

export const boxLabel = createLabel( ( { tagName } ) => TAG_LABELS[ tagName ] );

export const textLabel = createLabel( ( { content } ) => toPlainText( content ) || undefined );

export const linkLabel = createLabel( ( { mode, text } ) => {
	if ( mode === 'inner-blocks' ) {
		return undefined;
	}
	return toPlainText( text ) || undefined;
} );

export const imageLabel = createLabel( ( { alt } ) => toPlainText( alt ) || undefined );

export const iconLabel = createLabel();

export const getStructuralLabel = ( blockName, attributes ) => {
	if ( attributes?.metadata?.name ) {
		return attributes.metadata.name;
	}
	return blockName === 'atomic-wind/box' ? TAG_LABELS[ attributes?.tagName ] : undefined;
};
