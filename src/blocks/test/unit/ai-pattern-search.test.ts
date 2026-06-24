jest.mock( 'uuid', () => ({
	v4: () => 'mocked-uuid'
}) );

jest.mock( '@wordpress/blocks', () => require( './mocks/wordpress-blocks' ) );

import {
	formatPatternSearchResults,
	searchPatternCatalog
} from '../../plugins/ai-content/pattern-search';

const samplePatterns = [
	{
		name: 'otter-blocks/hero-pricing',
		title: 'Hero with pricing',
		description: 'A bold hero section with three pricing cards.',
		categories: [ 'otter-blocks', 'hero' ],
		content: '<!-- wp:heading --><h2>Hero</h2><!-- /wp:heading -->'
	},
	{
		name: 'otter-blocks/testimonials',
		title: 'Testimonials grid',
		description: 'Three customer quotes in a row.',
		categories: [ 'otter-blocks', 'testimonials' ],
		content: '<!-- wp:paragraph --><p>Quote</p><!-- /wp:paragraph -->'
	}
];

describe( 'pattern search', () => {
	it( 'finds patterns by query', () => {
		const results = searchPatternCatalog( samplePatterns, { query: 'pricing' } );

		expect( results ).toHaveLength( 1 );
		expect( results[0].name ).toBe( 'otter-blocks/hero-pricing' );
	});

	it( 'finds patterns by category', () => {
		const results = searchPatternCatalog( samplePatterns, { category: 'testimonials' } );

		expect( results ).toHaveLength( 1 );
		expect( results[0].name ).toBe( 'otter-blocks/testimonials' );
	});

	it( 'formats search results with pattern names', () => {
		const formatted = formatPatternSearchResults(
			searchPatternCatalog( samplePatterns, { query: 'hero' } )
		);

		expect( formatted ).toContain( 'adapt_pattern' );
		expect( formatted ).toContain( 'otter-blocks/hero-pricing' );
	});

	it( 'tolerates typos via fuzzy search', () => {
		const results = searchPatternCatalog( samplePatterns, { query: 'pricng' } );

		expect( results ).toHaveLength( 1 );
		expect( results[0].name ).toBe( 'otter-blocks/hero-pricing' );
	});
});
