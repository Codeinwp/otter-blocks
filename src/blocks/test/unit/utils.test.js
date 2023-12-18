import { findBlock } from '../../../onboarding/utils';

describe( 'findBlock', () => {
	const blocks = [
		{
			name: 'block1',
			innerBlocks: [
				{
					name: 'block2'
				},
				{
					name: 'block3'
				}
			]
		},
		{
			name: 'block4'
		}
	];

	test( 'should find the block if it exists in the top-level blocks', () => {
		const result = findBlock( blocks, 'block4' );
		expect( result ).toEqual({ name: 'block4' });
	});

	test( 'should find the block if it exists in the inner blocks', () => {
		const result = findBlock( blocks, 'block2' );
		expect( result ).toEqual({ name: 'block2' });
	});

	test( 'should return undefined if the block does not exist', () => {
		const result = findBlock( blocks, 'block5' );
		expect( result ).toBeUndefined();
	});
});
