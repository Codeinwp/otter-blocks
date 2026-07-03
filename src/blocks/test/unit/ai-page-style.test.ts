import { buildPageStyleDigest, PAGE_STYLE_MIN_BLOCKS } from '../../plugins/ai-content/page-style';
import type { BlockProps } from '../../helpers/blocks';

const block = (
	name: string,
	attributes: Record<string, unknown>,
	innerBlocks: BlockProps<unknown>[] = [],
	clientId = name
): BlockProps<unknown> => ( { name, clientId, attributes, innerBlocks } as unknown as BlockProps<unknown> );

describe( 'buildPageStyleDigest', () => {
	it( 'returns null when there is too little Atomic Wind signal', () => {
		expect( PAGE_STYLE_MIN_BLOCKS ).toBe( 2 );

		const page = [
			block( 'core/paragraph', { content: 'hello' } ),
			block( 'atomic-wind/box', { className: 'px-6 py-28' } )
		];

		// Only one Atomic Wind block — below the threshold.
		expect( buildPageStyleDigest( page ) ).toBeNull();
	});

	it( 'buckets recurring utility classes by category and lists composition vocabulary', () => {
		const page = [
			block( 'atomic-wind/box', { className: 'mx-auto flex max-w-5xl px-6 py-28 gap-8' }, [
				block( 'atomic-wind/text', { tagName: 'h1', className: 'm-0 text-5xl font-bold tracking-tight text-white md:text-7xl', content: 'Ship faster' }, [], 'h1' ),
				block( 'atomic-wind/link', { className: 'rounded-full bg-white px-8 py-4 text-sm font-bold text-slate-950' }, [], 'link' )
			], 'box' )
		];

		const digest = buildPageStyleDigest( page );

		expect( digest ).toContain( 'Spacing & layout:' );
		expect( digest ).toContain( 'px-6' );
		expect( digest ).toContain( 'Typography:' );
		// Responsive variant collapses onto the base token for display.
		expect( digest ).toContain( 'md:text-7xl' );
		expect( digest ).toContain( 'Color & surface:' );
		expect( digest ).toContain( 'bg-white' );
		expect( digest ).toContain( 'Radius & effects:' );
		expect( digest ).toContain( 'rounded-full' );
		expect( digest ).toContain( 'Composition vocabulary: atomic-wind/box, atomic-wind/link, atomic-wind/text.' );
		// Heading copy surfaces as a tone reference, explicitly not to be copied.
		expect( digest ).toContain( 'Ship faster' );
		expect( digest ).toContain( 'do NOT copy' );
	});

	it( 'excludes the in-place generator block subtree', () => {
		const page = [
			block( 'themeisle-blocks/content-generator', {}, [
				block( 'atomic-wind/box', { className: 'px-6 py-28' }, [], 'gen-a' ),
				block( 'atomic-wind/box', { className: 'gap-8 mx-auto' }, [], 'gen-b' )
			], 'generator' )
		];

		// Everything Atomic Wind lives under the excluded generator block, so no
		// signal remains.
		expect( buildPageStyleDigest( page, { excludeClientIds: [ 'generator' ] } ) ).toBeNull();
	});

	it( 'returns null when Atomic Wind blocks carry no styling classes', () => {
		const page = [
			block( 'atomic-wind/box', {} ),
			block( 'atomic-wind/box', { className: '' } )
		];

		expect( buildPageStyleDigest( page ) ).toBeNull();
	});
});
