import { cloneBlock } from '@wordpress/blocks';

import {
	blocksStructureMatches,
	cloneBlocksForPreview,
	mergePreviewCloneOntoBlocks
} from '../../plugins/ai-content/apply-content';

jest.mock( '@wordpress/blocks', () => ({
	cloneBlock: jest.fn( ( block ) => ({
		...block,
		clientId: `${ block.clientId }-clone`,
		attributes: { ...block.attributes },
		innerBlocks: block.innerBlocks?.map( ( inner: { clientId: string }) => ({
			...inner,
			clientId: `${ inner.clientId }-clone`
		}) )
	}) ),
	parse: jest.fn(),
	rawHandler: jest.fn(),
	serialize: jest.fn()
}));

describe( 'cloneBlocksForPreview', () => {
	it( 'deep-clones each block for detached preview', () => {
		const blocks = [{
			clientId: 'abc',
			name: 'core/paragraph',
			attributes: { content: 'Hello' },
			innerBlocks: [{
				clientId: 'child',
				name: 'core/heading',
				attributes: { content: 'Title', level: 2 },
				innerBlocks: []
			}]
		}];

		const cloned = cloneBlocksForPreview( blocks );

		expect( cloneBlock ).toHaveBeenCalledTimes( 1 );
		expect( cloned[0].clientId ).toBe( 'abc-clone' );
		expect( cloned[0].attributes ).toEqual({ content: 'Hello' });
		expect( cloned[0].attributes ).not.toBe( blocks[0].attributes );
		expect( cloned[0].innerBlocks?.[0].clientId ).toBe( 'child-clone' );
	});

	it( 'returns an empty array for empty input', () => {
		expect( cloneBlocksForPreview([]) ).toEqual([]);
	});

	it( 'merges preview clone attributes onto editor blocks by parallel tree position', () => {
		const editor = [{
			clientId: 'editor-btn',
			name: 'themeisle-blocks/button',
			attributes: { text: 'Old label', id: 'btn-a' },
			innerBlocks: []
		}];
		const preview = [{
			clientId: 'preview-btn',
			name: 'themeisle-blocks/button',
			attributes: { text: 'New label', id: 'btn-a' },
			innerBlocks: []
		}];

		const merged = mergePreviewCloneOntoBlocks(
			editor,
			preview,
			( name ) => ( {
				name,
				attributes: { id: { type: 'string' }, text: { type: 'string' }}
			} )
		);

		expect( merged[0].clientId ).toBe( 'editor-btn' );
		expect( merged[0].attributes?.text ).toBe( 'New label' );
		expect( blocksStructureMatches( editor, preview ) ).toBe( true );
	});
});
