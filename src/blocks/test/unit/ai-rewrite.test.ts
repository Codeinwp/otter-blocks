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
			'themeisle-blocks/form': { id: { type: 'string' } },
			'themeisle-blocks/form-input': { label: { type: 'string' } }
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
});
