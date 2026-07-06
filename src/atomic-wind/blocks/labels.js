import { __ } from '@wordpress/i18n';

const LABEL_CONTEXTS = [ 'list-view', 'breadcrumb' ];

// Resolved lazily so locale data registered after module init still applies.
// div and span intentionally have no label so generic wrappers fall through
// to the block title and block variation matching.
const getTagLabel = ( tagName ) => {
	switch ( tagName ) {
	case 'section':
		return __( 'Section', 'otter-blocks' );
	case 'article':
		return __( 'Article', 'otter-blocks' );
	case 'main':
		return __( 'Main', 'otter-blocks' );
	case 'aside':
		return __( 'Aside', 'otter-blocks' );
	case 'header':
		return __( 'Header', 'otter-blocks' );
	case 'footer':
		return __( 'Footer', 'otter-blocks' );
	case 'nav':
		return __( 'Navigation', 'otter-blocks' );
	case 'details':
		return __( 'Details', 'otter-blocks' );
	case 'summary':
		return __( 'Summary', 'otter-blocks' );
	default:
		return undefined;
	}
};

export const toPlainText = ( value ) => {
	if ( ! value ) {
		return '';
	}
	// DOMParser documents are inert (no script execution, no resource loading),
	// so this both strips markup completely and decodes entities.
	const text = typeof value === 'string' ? new window.DOMParser().parseFromString( value, 'text/html' ).body.textContent : value.toPlainText?.() ?? '';
	return text.replace( /\s+/g, ' ' ).trim();
};

// Builds an __experimentalLabel callback. The custom name written by the core
// Rename UI (attributes.metadata.name) must win, because defining our own
// label callback prevents core from displaying it; returning undefined when
// there is no better label keeps the block title and variation titles working.
// Content fallbacks return the raw attribute value (string or RichTextData)
// so core converts and decodes it exactly once.
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

export const boxLabel = createLabel( ( { tagName } ) => getTagLabel( tagName ) );

export const textLabel = createLabel( ( { content } ) => ( toPlainText( content ) ? content : undefined ) );

export const linkLabel = createLabel( ( { mode, text } ) => {
	if ( mode === 'inner-blocks' ) {
		return undefined;
	}
	return toPlainText( text ) ? text : undefined;
} );

export const imageLabel = createLabel( ( { alt } ) => toPlainText( alt ) || undefined );

export const iconLabel = createLabel();

export const getStructuralLabel = ( blockName, attributes ) => {
	if ( attributes?.metadata?.name ) {
		return attributes.metadata.name;
	}
	return blockName === 'atomic-wind/box' ? getTagLabel( attributes?.tagName ) : undefined;
};
