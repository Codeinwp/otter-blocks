import { toPlainText } from '../../../atomic-wind/blocks/labels';

describe( 'toPlainText', () => {
	it( 'strips markup, including nested and unterminated tags', () => {
		expect( toPlainText( '<b>Bold</b> text' ) ).toBe( 'Bold text' );
		expect( toPlainText( '<scr<script>ipt>alert(1)</script>' ) ).not.toContain( '<' );
		expect( toPlainText( 'trailing <script' ) ).not.toContain( '<' );
	} );

	it( 'decodes entities and collapses whitespace', () => {
		expect( toPlainText( 'a &amp; b' ) ).toBe( 'a & b' );
		expect( toPlainText( '  spaced \n\t out  ' ) ).toBe( 'spaced out' );
	} );

	it( 'handles RichTextData-like values and empty input', () => {
		expect( toPlainText( { toPlainText: () => 'rich text' } ) ).toBe( 'rich text' );
		expect( toPlainText( '' ) ).toBe( '' );
		expect( toPlainText( undefined ) ).toBe( '' );
	} );
} );
