jest.mock( '@wordpress/blocks', () => require( './mocks/wordpress-blocks' ) );

import { buildBlockRewritePrompt } from '../../plugins/ai-content/agent/run-rewrite';

describe( 'buildBlockRewritePrompt', () => {
	const base = {
		markup: '<!-- wp:themeisle-blocks/form --><!-- /wp:themeisle-blocks/form -->',
		instruction: 'Make the heading larger.',
		sessionHistory: [],
		themeColors: [],
		hasAtomic: false
	};

	it( 'includes the selection attribute schema when provided', () => {
		const blockSchema = JSON.stringify({
			'themeisle-blocks/form': { id: { type: 'string' }},
			'themeisle-blocks/form-input': { label: { type: 'string' }}
		}, null, 2 );

		const prompt = buildBlockRewritePrompt({ ...base, blockSchema });

		expect( prompt ).toContain( 'Attribute schema for every block type in the selection' );
		expect( prompt ).toContain( 'themeisle-blocks/form-input' );
		// The validity rule points the model at the schema rather than "standard" attrs.
		expect( prompt ).toContain( 'see the attribute schema above' );
	});

	it( 'omits the schema section when no schema is available', () => {
		const prompt = buildBlockRewritePrompt({ ...base, blockSchema: '' });

		expect( prompt ).not.toContain( 'Attribute schema for every block type in the selection' );
	});

	it( 'teaches the atomic-wind overlay idiom so an "add overlay" redesign builds a real layer', () => {
		const prompt = buildBlockRewritePrompt({ ...base, hasAtomic: true, editKind: 'redesign' });

		// The idiom: an empty, absolutely-positioned box with a translucent bg,
		// above which the content is lifted with z-index.
		expect( prompt ).toContain( 'Overlay / tint over a background' );
		expect( prompt ).toContain( 'absolute inset-0' );
		expect( prompt ).toContain( 'relative z-10' );
	});

	it( 'omits the atomic-wind hint when the selection is not atomic-wind', () => {
		const prompt = buildBlockRewritePrompt({ ...base, hasAtomic: false });

		expect( prompt ).not.toContain( 'Overlay / tint over a background' );
	});
});
