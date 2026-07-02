/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Internal dependencies
 */
import { insertAndGetBlock } from '../helpers/editor';

test.describe( 'Posts Block', () => {
	test.beforeEach( async({ admin }) => {
		await admin.createNewPost();
	});

	// Guards the otter-store migration from registerGenericStore to
	// createReduxStore: the block dispatches slugs into the store on mount and
	// the inspector reads them back via useSelect, so actions, selectors, and
	// subscriber notification must all keep working.
	test( 'otter-store round-trips slugs through dispatch/select', async({ editor, page }) => {
		await insertAndGetBlock( editor, page, { name: 'themeisle-blocks/posts-grid' });

		const result = await page.evaluate( async() => {
			const { select, dispatch, subscribe } = window.wp.data;

			let notified = false;
			const unsubscribe = subscribe( () => {
				notified = true;
			}, 'otter-store' );

			dispatch( 'otter-store' ).setPostsSlugs([ 'movie', 'book' ]);
			dispatch( 'otter-store' ).setPostsUsedSlugs([ 'a', 'b' ]);
			dispatch( 'otter-store' ).setPostsUsedSlugs([ 'c' ]);
			dispatch( 'otter-store' ).removePostsUsedSlugs([ 'a' ]);

			const afterRemove = select( 'otter-store' ).getPostsUsedSlugs();

			dispatch( 'otter-store' ).setOnlyOneSlug( 'only' );

			// Listeners are flushed asynchronously in some wp.data versions.
			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
			unsubscribe();

			return {
				slugs: select( 'otter-store' ).getPostsSlugs(),
				afterRemove,
				onlyOne: select( 'otter-store' ).getPostsUsedSlugs(),
				notified
			};
		});

		expect( result.slugs ).toEqual([ 'movie', 'book' ]);
		expect( result.afterRemove ).toEqual([ 'b', 'c' ]);
		expect( result.onlyOne ).toEqual([ 'only' ]);
		expect( result.notified ).toBe( true );
	});
});
