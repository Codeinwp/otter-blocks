import {
	findQualityIssues,
	formatIssuesForPrompt
} from '../../plugins/ai-content/quality-checks';

const themeColors = [
	{ slug: 'primary', color: '#0f172a', name: 'Primary' },
	{ slug: 'base', color: '#ffffff', name: 'Base' }
];

const issueTypes = ( blocks: never, options = {}) =>
	findQualityIssues( blocks, options ).map( issue => issue.type );

describe( 'AI quality checks', () => {
	it( 'flags low text contrast using the resolved palette hex', () => {
		const blocks = [
			{ name: 'core/paragraph', attributes: { content: 'Readable enough copy.', backgroundColor: 'primary', textColor: 'primary' }, innerBlocks: [] }
		];

		const issues = findQualityIssues( blocks as never, { themeColors });

		expect( issues ).toHaveLength( 1 );
		expect( issues[0] ).toMatchObject({ id: '0', type: 'contrast' });
	});

	it( 'does not flag a high-contrast pair', () => {
		const blocks = [
			{ name: 'core/paragraph', attributes: { content: 'Readable copy here.', backgroundColor: 'base', textColor: 'primary' }, innerBlocks: [] }
		];

		expect( issueTypes( blocks as never, { themeColors }) ).not.toContain( 'contrast' );
	});

	it( 'flags an off-palette color slug', () => {
		const blocks = [
			{ name: 'core/paragraph', attributes: { content: 'Some copy goes here.', textColor: 'neon-lime' }, innerBlocks: [] }
		];

		expect( issueTypes( blocks as never, { themeColors }) ).toContain( 'off-palette' );
	});

	it( 'flags empty copy and an empty button label distinctly', () => {
		const paragraph = [{ name: 'core/paragraph', attributes: { content: '' }, innerBlocks: [] }];
		const button = [{ name: 'themeisle-blocks/button', attributes: { text: '' }, innerBlocks: [] }];

		expect( issueTypes( paragraph as never ) ).toContain( 'empty-copy' );
		expect( issueTypes( button as never ) ).toContain( 'empty-label' );
	});

	it( 'flags leftover placeholder copy', () => {
		const blocks = [
			{ name: 'core/paragraph', attributes: { content: 'Lorem ipsum dolor sit amet.' }, innerBlocks: [] }
		];

		expect( issueTypes( blocks as never ) ).toContain( 'placeholder-copy' );
	});

	it( 'flags duplicated copy across two blocks but not the first occurrence', () => {
		const blocks = [
			{ name: 'core/paragraph', attributes: { content: 'The exact same sentence.' }, innerBlocks: [] },
			{ name: 'core/paragraph', attributes: { content: 'The exact same sentence.' }, innerBlocks: [] }
		];

		const duplicates = findQualityIssues( blocks as never ).filter( issue => 'duplicate-copy' === issue.type );

		expect( duplicates ).toHaveLength( 1 );
		expect( duplicates[0].id ).toBe( '1' );
	});

	it( 'flags an image missing alt text', () => {
		const blocks = [{ name: 'core/image', attributes: {}, innerBlocks: [] }];

		expect( issueTypes( blocks as never ) ).toContain( 'missing-alt' );
	});

	it( 'addresses nested blocks by their index-path id', () => {
		const blocks = [
			{
				name: 'themeisle-blocks/advanced-columns',
				attributes: {},
				innerBlocks: [
					{ name: 'core/paragraph', attributes: { content: '' }, innerBlocks: [] }
				]
			}
		];

		const issues = findQualityIssues( blocks as never );

		expect( issues[0].id ).toBe( '0.0' );
	});

	it( 'formats issues for the prompt as `id: message`', () => {
		const formatted = formatIssuesForPrompt([
			{ id: '0', type: 'contrast', message: 'low contrast' }
		]);

		expect( formatted ).toBe( '0: low contrast' );
	});
});
