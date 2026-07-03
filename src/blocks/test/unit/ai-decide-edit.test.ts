jest.mock( '@wordpress/blocks', () => require( './mocks/wordpress-blocks' ) );

import { buildDeciderPrompt, decideEditKind } from '../../plugins/ai-content/agent/decide-edit';

describe( 'buildDeciderPrompt', () => {
	const prompt = buildDeciderPrompt( 'Add a dark overlay between the texts and the background image.' );

	it( 'defines all three edit kinds', () => {
		expect( prompt ).toContain( '"text"' );
		expect( prompt ).toContain( '"style"' );
		expect( prompt ).toContain( '"redesign"' );
	} );

	it( 'treats adding a new element/layer (overlay, divider, badge) as a structural redesign', () => {
		// An overlay is a NEW block, so it must not be mistaken for a style tweak.
		expect( prompt ).toContain( 'add a dark overlay' );
		expect( prompt ).toContain( 'Adding a NEW element or layer is always "redesign"' );
		// And "style" is scoped to existing elements only.
		expect( prompt ).toContain( 'ALREADY EXIST' );
	} );
} );

describe( 'decideEditKind', () => {
	it( 'passes an "add overlay" request to the model (no text fast-path) and returns its classification', async() => {
		const requestCompletion = jest.fn( async() => JSON.stringify({ kind: 'redesign', reason: 'adds an overlay layer' }) );

		const { kind } = await decideEditKind( {
			instruction: 'Add a dark overlay between the texts and the background image.',
			requestCompletion
		} );

		expect( kind ).toBe( 'redesign' );
		expect( requestCompletion ).toHaveBeenCalled();
		expect( String( requestCompletion.mock.calls[ 0 ][ 0 ] ) ).toContain( 'DECIDE_EDIT' );
	} );
} );
