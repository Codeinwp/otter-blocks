/**
 * Internal dependencies
 */
import { applyTextNodes, collectTextNodes } from '../../plugins/ai-content/agent/text-nodes';

// Recursive deep-clone so nested attributes are never shared with the original —
// mirrors @wordpress/blocks cloneBlock closely enough for these tests.
jest.mock( '@wordpress/blocks', () => ({
	cloneBlock: jest.fn( function clone( block: any ) {
		return {
			...block,
			clientId: `${ block.clientId }-clone`,
			attributes: { ...block.attributes },
			innerBlocks: ( block.innerBlocks || [] ).map( clone )
		};
	} ),
	parse: jest.fn(),
	rawHandler: jest.fn(),
	serialize: jest.fn()
}) );

// Block-type registry: which attributes are editable rich text.
const SCHEMAS: Record<string, Record<string, Record<string, unknown>>> = {
	'core/heading': { content: { source: 'rich-text' }, level: { type: 'number' }, textColor: { type: 'string' } },
	'core/paragraph': { content: { source: 'html' }, backgroundColor: { type: 'string' } },
	'core/button': { text: { source: 'html' }, url: { type: 'string', source: 'attribute' } },
	'core/buttons': {},
	'core/group': { tagName: { type: 'string' }, backgroundColor: { type: 'string' } },
	'core/image': { url: { type: 'string' }, alt: { type: 'string', source: 'attribute', attribute: 'alt' } }
};

const getBlockType = ( name: string ) => ( SCHEMAS[ name ] ? { name, attributes: SCHEMAS[ name ] } : undefined );

const makeTree = () => ( [
	{
		clientId: 'group',
		name: 'core/group',
		attributes: { backgroundColor: 'primary', tagName: 'div' },
		innerBlocks: [
			{ clientId: 'h', name: 'core/heading', attributes: { content: 'Bonjour le monde', level: 2, textColor: 'accent' }, innerBlocks: [] },
			{ clientId: 'p', name: 'core/paragraph', attributes: { content: 'Ceci est un <strong>paragraphe</strong>.', backgroundColor: 'base' }, innerBlocks: [] },
			{
				clientId: 'btns',
				name: 'core/buttons',
				attributes: {},
				innerBlocks: [
					{ clientId: 'btn', name: 'core/button', attributes: { text: 'Cliquez ici', url: '/x' }, innerBlocks: [] }
				]
			}
		]
	}
] );

describe( 'collectTextNodes', () => {
	it( 'collects only rich-text/html/text attributes, depth-first, in order', () => {
		const nodes = collectTextNodes( makeTree() as any, getBlockType );

		expect( nodes.map( ( n ) => n.value ) ).toEqual( [
			'Bonjour le monde',
			'Ceci est un <strong>paragraphe</strong>.',
			'Cliquez ici'
		] );
		expect( nodes.map( ( n ) => n.key ) ).toEqual( [ 'content', 'content', 'text' ] );
		// Paths address the right blocks (group→heading, group→paragraph, group→buttons→button).
		expect( nodes.map( ( n ) => n.path ) ).toEqual( [ [ 0, 0 ], [ 0, 1 ], [ 0, 2, 0 ] ] );
	} );

	it( 'ignores non-text attributes (colors, urls, levels) and attribute-sourced strings', () => {
		const nodes = collectTextNodes( makeTree() as any, getBlockType );
		const keys = nodes.map( ( n ) => n.key );

		expect( keys ).not.toContain( 'backgroundColor' );
		expect( keys ).not.toContain( 'textColor' );
		expect( keys ).not.toContain( 'url' );
		expect( keys ).not.toContain( 'level' );
		expect( keys ).not.toContain( 'alt' );
	} );

	it( 'skips empty/whitespace fragments', () => {
		const tree = [ { clientId: 'p', name: 'core/paragraph', attributes: { content: '   ' }, innerBlocks: [] } ];
		expect( collectTextNodes( tree as any, getBlockType ) ).toHaveLength( 0 );
	} );
} );

describe( 'applyTextNodes', () => {
	it( 'writes transformed text back, preserving structure, styles, and non-text attributes', () => {
		const original = makeTree();
		const nodes = collectTextNodes( original as any, getBlockType );
		const result = applyTextNodes( original as any, nodes, [
			'Hello world',
			'This is a <strong>paragraph</strong>.',
			'Click here'
		] );

		// Structure preserved.
		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ].name ).toBe( 'core/group' );
		expect( result[ 0 ].innerBlocks ).toHaveLength( 3 );

		// Text replaced.
		expect( result[ 0 ].innerBlocks[ 0 ].attributes.content ).toBe( 'Hello world' );
		expect( result[ 0 ].innerBlocks[ 1 ].attributes.content ).toBe( 'This is a <strong>paragraph</strong>.' );
		expect( result[ 0 ].innerBlocks[ 2 ].innerBlocks[ 0 ].attributes.text ).toBe( 'Click here' );

		// Styling / non-text attributes untouched.
		expect( result[ 0 ].attributes.backgroundColor ).toBe( 'primary' );
		expect( result[ 0 ].innerBlocks[ 0 ].attributes.textColor ).toBe( 'accent' );
		expect( result[ 0 ].innerBlocks[ 1 ].attributes.backgroundColor ).toBe( 'base' );
		expect( result[ 0 ].innerBlocks[ 2 ].innerBlocks[ 0 ].attributes.url ).toBe( '/x' );
	} );

	it( 'does not mutate the original blocks', () => {
		const original = makeTree();
		const nodes = collectTextNodes( original as any, getBlockType );
		applyTextNodes( original as any, nodes, [ 'A', 'B', 'C' ] );

		expect( original[ 0 ].innerBlocks[ 0 ].attributes.content ).toBe( 'Bonjour le monde' );
		expect( original[ 0 ].innerBlocks[ 2 ].innerBlocks[ 0 ].attributes.text ).toBe( 'Cliquez ici' );
	} );

	it( 'handles RichTextData attributes (extract HTML, write back same type)', () => {
		// Mirrors @wordpress/rich-text RichTextData: rich-text attributes are
		// objects with toHTMLString() and a static fromHTMLString().
		class FakeRichText {
			html: string;
			constructor( html: string ) {
				this.html = html;
			}
			toHTMLString() {
				return this.html;
			}
			static fromHTMLString( html: string ) {
				return new FakeRichText( html );
			}
		}

		const tree = [ {
			clientId: 'h',
			name: 'core/heading',
			attributes: { content: new FakeRichText( 'Bonjour <em>le</em> monde' ), level: 2 },
			innerBlocks: []
		} ];

		const nodes = collectTextNodes( tree as any, getBlockType );
		expect( nodes.map( ( n ) => n.value ) ).toEqual( [ 'Bonjour <em>le</em> monde' ] );

		const result = applyTextNodes( tree as any, nodes, [ 'Hello <em>the</em> world' ] );
		const written = result[ 0 ].attributes.content as InstanceType<typeof FakeRichText>;

		// Written back as a RichTextData-like object, not a bare string.
		expect( written ).toBeInstanceOf( FakeRichText );
		expect( written.toHTMLString() ).toBe( 'Hello <em>the</em> world' );
	} );

	it( 'keeps the original text for missing/short replacements', () => {
		const original = makeTree();
		const nodes = collectTextNodes( original as any, getBlockType );
		const result = applyTextNodes( original as any, nodes, [ 'Only first' ] );

		expect( result[ 0 ].innerBlocks[ 0 ].attributes.content ).toBe( 'Only first' );
		expect( result[ 0 ].innerBlocks[ 1 ].attributes.content ).toBe( 'Ceci est un <strong>paragraphe</strong>.' );
		expect( result[ 0 ].innerBlocks[ 2 ].innerBlocks[ 0 ].attributes.text ).toBe( 'Cliquez ici' );
	} );
} );
