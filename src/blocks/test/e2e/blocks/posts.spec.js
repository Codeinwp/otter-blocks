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

test.describe( 'Posts Block frontend grid', () => {

	// A long unbreakable title must not widen its column (and image).
	test( 'grid columns stay equal width regardless of title length', async({ page, requestUtils }) => {
		const post = await requestUtils.createPost({
			title: 'Posts grid equal columns',
			content: '<!-- wp:themeisle-blocks/posts-grid /-->',
			status: 'publish'
		});

		await page.goto( post.link );

		for ( const columns of [ 2, 3, 4, 5 ]) {
			const result = await page.evaluate( ( columnCount ) => {
				const image = '<img width="1280" height="720" alt="" src="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221280%22 height=%22720%22/%3E">';
				const titles = [ 'W'.repeat( 60 ), ...Array( columnCount - 1 ).fill( 'Hi' ) ];
				const cards = titles.map( ( title ) => `
					<div class="o-posts-grid-post-blog o-posts-grid-post-plain">
						<div class="o-posts-grid-post">
							<div class="o-posts-grid-post-image"><a href="#">${ image }</a></div>
							<div class="o-posts-grid-post-body">
								<h4 class="o-posts-grid-post-title"><a href="#">${ title }</a></h4>
							</div>
						</div>
					</div>` ).join( '' );

				document.getElementById( 'otter-fixture' )?.remove();

				const wrapper = document.createElement( 'div' );
				wrapper.id = 'otter-fixture';
				wrapper.className = 'wp-block-themeisle-blocks-posts-grid';
				wrapper.style.width = '1000px';
				wrapper.innerHTML = `<div class="is-grid o-posts-grid-columns-${ columnCount }">${ cards }</div>`;
				document.body.prepend( wrapper );

				const grid = wrapper.querySelector( '.is-grid' );
				const longTitle = wrapper.querySelector( '.o-posts-grid-post-title' );
				const probe = longTitle.cloneNode( true );
				probe.style.cssText = 'position:absolute;width:max-content;visibility:hidden;';
				longTitle.parentElement?.appendChild( probe );
				const titleWidth = probe.getBoundingClientRect().width;
				probe.remove();

				return {
					display: window.getComputedStyle( grid ).display,
					share: grid.clientWidth / columnCount,
					titleWidth,
					cards: Array.from( wrapper.querySelectorAll( '.o-posts-grid-post-blog' ) ).map( ( el ) => el.getBoundingClientRect().width ),
					images: Array.from( wrapper.querySelectorAll( 'img' ) ).map( ( el ) => el.getBoundingClientRect().width )
				};
			}, columns );

			// Preconditions: stylesheet applied and the title would overflow an equal share.
			expect( result.display ).toBe( 'grid' );
			expect( result.titleWidth ).toBeGreaterThan( result.share );

			for ( const width of [ ...result.cards, ...result.images ]) {
				expect( Math.abs( width - result.cards[ 0 ]) ).toBeLessThanOrEqual( 1 );
			}
		}
	});
});
