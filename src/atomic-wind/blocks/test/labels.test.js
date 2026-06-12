import { boxLabel, textLabel, linkLabel, imageLabel, iconLabel, getStructuralLabel } from '../labels';

describe( 'atomic-wind block labels', () => {
	describe( 'boxLabel', () => {
		it( 'prefers the custom name from metadata.name (core Rename UI)', () => {
			expect( boxLabel( { metadata: { name: 'Testimonial Section' }, tagName: 'section' }, { context: 'list-view' } ) ).toBe( 'Testimonial Section' );
			expect( boxLabel( { metadata: { name: 'Hero' }, tagName: 'div' }, { context: 'breadcrumb' } ) ).toBe( 'Hero' );
		} );

		it( 'falls back to a semantic tag label', () => {
			expect( boxLabel( { tagName: 'section' }, { context: 'list-view' } ) ).toBe( 'Section' );
			expect( boxLabel( { tagName: 'nav' }, { context: 'list-view' } ) ).toBe( 'Navigation' );
			expect( boxLabel( { tagName: 'footer' }, { context: 'breadcrumb' } ) ).toBe( 'Footer' );
		} );

		it( 'returns undefined for generic wrappers so the block title and variations apply', () => {
			expect( boxLabel( { tagName: 'div' }, { context: 'list-view' } ) ).toBeUndefined();
			expect( boxLabel( { tagName: 'span' }, { context: 'list-view' } ) ).toBeUndefined();
		} );

		it( 'ignores tag names that collide with Object.prototype members', () => {
			expect( boxLabel( { tagName: 'constructor' }, { context: 'list-view' } ) ).toBeUndefined();
			expect( boxLabel( { tagName: 'hasOwnProperty' }, { context: 'list-view' } ) ).toBeUndefined();
		} );

		it( 'returns undefined outside list-view and breadcrumb contexts', () => {
			expect( boxLabel( { metadata: { name: 'Hero' }, tagName: 'section' }, { context: 'visual' } ) ).toBeUndefined();
			expect( boxLabel( { metadata: { name: 'Hero' }, tagName: 'section' }, { context: 'accessibility' } ) ).toBeUndefined();
			expect( boxLabel( { tagName: 'section' }, {} ) ).toBeUndefined();
			expect( boxLabel( { tagName: 'section' } ) ).toBeUndefined();
		} );
	} );

	describe( 'textLabel', () => {
		it( 'passes non-empty content through for core to convert once', () => {
			expect( textLabel( { content: '<strong>Hello</strong>  world' }, { context: 'list-view' } ) ).toBe( '<strong>Hello</strong>  world' );

			const richText = { toPlainText: () => 'Rich text' };
			expect( textLabel( { content: richText }, { context: 'list-view' } ) ).toBe( richText );
		} );

		it( 'returns undefined when the content is empty', () => {
			expect( textLabel( { content: '' }, { context: 'list-view' } ) ).toBeUndefined();
			expect( textLabel( { content: { toPlainText: () => ' ' }}, { context: 'list-view' } ) ).toBeUndefined();
			expect( textLabel( {}, { context: 'list-view' } ) ).toBeUndefined();
		} );
	} );

	describe( 'linkLabel', () => {
		it( 'uses the link text in text mode', () => {
			expect( linkLabel( { mode: 'text', text: 'Get started' }, { context: 'list-view' } ) ).toBe( 'Get started' );
		} );

		it( 'returns undefined in inner-blocks mode', () => {
			expect( linkLabel( { mode: 'inner-blocks', text: 'Get started' }, { context: 'list-view' } ) ).toBeUndefined();
		} );

		it( 'still honors the custom name in inner-blocks mode', () => {
			expect( linkLabel( { metadata: { name: 'CTA Button' }, mode: 'inner-blocks' }, { context: 'list-view' } ) ).toBe( 'CTA Button' );
		} );
	} );

	describe( 'imageLabel', () => {
		it( 'uses the alt text', () => {
			expect( imageLabel( { alt: 'Team photo' }, { context: 'list-view' } ) ).toBe( 'Team photo' );
			expect( imageLabel( { alt: '' }, { context: 'list-view' } ) ).toBeUndefined();
		} );
	} );

	describe( 'iconLabel', () => {
		it( 'only honors the custom name', () => {
			expect( iconLabel( { metadata: { name: 'Star icon' }, icon: 'star' }, { context: 'list-view' } ) ).toBe( 'Star icon' );
			expect( iconLabel( { icon: 'star' }, { context: 'list-view' } ) ).toBeUndefined();
		} );
	} );

	describe( 'getStructuralLabel', () => {
		it( 'resolves the custom name, then the semantic tag for boxes', () => {
			expect( getStructuralLabel( 'atomic-wind/box', { metadata: { name: 'Hero' }, tagName: 'section' } ) ).toBe( 'Hero' );
			expect( getStructuralLabel( 'atomic-wind/box', { tagName: 'footer' } ) ).toBe( 'Footer' );
			expect( getStructuralLabel( 'atomic-wind/box', { tagName: 'div' } ) ).toBeUndefined();
			expect( getStructuralLabel( 'atomic-wind/text', { content: 'Hello' } ) ).toBeUndefined();
			expect( getStructuralLabel( 'atomic-wind/text', { metadata: { name: 'Tagline' }} ) ).toBe( 'Tagline' );
		} );
	} );
} );
