import {
	applyStructureEdits,
	applyStructureRemovals,
	parseStructureEditPayload
} from '../../plugins/ai-content/structure-edits';

describe( 'AI structure edits', () => {
	it( 'parses remove operations from model JSON', () => {
		expect( parseStructureEditPayload( '{"remove":["0.1","0.2.0"]}' ) ).toEqual({
			remove: [ '0.1', '0.2.0' ]
		});
	});

	it( 'removes blocks by id without touching siblings', () => {
		const base = [{
			clientId: 'parent',
			name: 'core/group',
			attributes: {},
			innerBlocks: [
				{
					clientId: 'keep',
					name: 'core/paragraph',
					attributes: { content: 'Keep me.' },
					innerBlocks: []
				},
				{
					clientId: 'drop',
					name: 'core/paragraph',
					attributes: { content: 'Remove me.' },
					innerBlocks: []
				}
			]
		}];

		const result = applyStructureRemovals( base, [ '0.1' ] );

		expect( result[0].innerBlocks ).toHaveLength( 1 );
		expect( result[0].innerBlocks?.[0]?.clientId ).toBe( 'keep' );
	});

	it( 'inserts a new block under a parent id', () => {
		const base = [{
			clientId: 'parent',
			name: 'core/group',
			attributes: {},
			innerBlocks: []
		}];

		const result = applyStructureEdits(
			base,
			{
				insert: [{
					parentId: '0',
					index: 0,
					block: {
						name: 'core/paragraph',
						attributes: { content: 'New line.' },
						innerBlocks: []
					}
				}]
			},
			( trees ) => trees.map( ( tree ) => ({
				clientId: 'new-paragraph',
				name: tree.name,
				attributes: tree.attributes || {},
				innerBlocks: []
			}) )
		);

		expect( result[0].innerBlocks ).toHaveLength( 1 );
		expect( result[0].innerBlocks?.[0]?.attributes?.content ).toBe( 'New line.' );
	});
});
