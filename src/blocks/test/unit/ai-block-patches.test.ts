import {
	applyPatchesToBlocks,
	attachIds,
	blocksToTrees,
	buildIdToBlockNameMap,
	normalizePatchAttributes
} from '../../plugins/ai-content/block-patches';

const getBlockType = ( name: string ) => {
	if ( 'core/paragraph' === name ) {
		return {
			name,
			attributes: {
				content: { type: 'string' }
			}
		};
	}

	if ( 'themeisle-blocks/button' === name ) {
		return {
			name,
			attributes: {
				text: { type: 'string' }
			}
		};
	}

	return undefined;
};

describe( 'AI block patches', () => {
	it( 'maps text to content when the model uses the wrong attribute name', () => {
		expect( normalizePatchAttributes(
			'core/paragraph',
			{ text: 'Updated copy.' },
			getBlockType
		) ).toEqual({ content: 'Updated copy.' });
	});

	it( 'preserves clientIds when merging patches onto editor blocks', () => {
		const base = [{
			clientId: 'button-1',
			name: 'themeisle-blocks/button',
			attributes: { text: 'Old label' },
			innerBlocks: []
		}];

		const patched = applyPatchesToBlocks( base, [{
			id: '0',
			attributes: { text: 'Start Building Today — Get the Guide' }
		}] );

		expect( patched[0].clientId ).toBe( 'button-1' );
		expect( patched[0].attributes?.text ).toBe( 'Start Building Today — Get the Guide' );
	});

	it( 'builds an id to block name map from the identified tree', () => {
		const trees = blocksToTrees([
			{
				clientId: 'a',
				name: 'core/paragraph',
				attributes: { content: 'Line' },
				innerBlocks: []
			}
		]);

		expect( buildIdToBlockNameMap( attachIds( trees ) ) ).toEqual({ '0': 'core/paragraph' });
	});
});
