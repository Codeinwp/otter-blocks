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

/**
 * Render a synthetic grid (one long unbreakable title) and measure it.
 *
 * @param {import('@playwright/test').Page} page        Page with the Posts Block stylesheet loaded.
 * @param {number}                          columnCount Columns setting to render.
 * @param {boolean}                         withImages  Whether cards get a featured image.
 * @return {Promise<{display: string, tracks: number, share: number, titleWidth: number, cards: number[], images: number[]}>} Measurements.
 */
const measureGrid = ( page, columnCount, withImages = true ) => page.evaluate( ([ count, hasImages ]) => {
	const image = hasImages ? '<img width="1280" height="720" alt="" src="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221280%22 height=%22720%22/%3E">' : '';
	const titles = [ 'W'.repeat( 60 ), ...Array( count - 1 ).fill( 'Hi' ) ];
	const cards = titles.map( ( title ) => `
		<div class="o-posts-grid-post-blog o-posts-grid-post-plain">
			<div class="o-posts-grid-post">
				${ image ? `<div class="o-posts-grid-post-image"><a href="#">${ image }</a></div>` : '' }
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
	wrapper.innerHTML = `<div class="is-grid o-posts-grid-columns-${ count }">${ cards }</div>`;
	document.body.prepend( wrapper );

	const grid = wrapper.querySelector( '.is-grid' );
	const tracks = window.getComputedStyle( grid ).gridTemplateColumns.split( ' ' ).length;
	const longTitle = wrapper.querySelector( '.o-posts-grid-post-title' );
	const probe = longTitle.cloneNode( true );
	probe.style.cssText = 'position:absolute;width:max-content;visibility:hidden;';
	longTitle.parentElement?.appendChild( probe );
	const titleWidth = probe.getBoundingClientRect().width;
	probe.remove();

	return {
		display: window.getComputedStyle( grid ).display,
		tracks,
		share: grid.clientWidth / tracks,
		titleWidth,
		cards: Array.from( wrapper.querySelectorAll( '.o-posts-grid-post-blog' ) ).map( ( el ) => el.getBoundingClientRect().width ),
		images: Array.from( wrapper.querySelectorAll( 'img' ) ).map( ( el ) => el.getBoundingClientRect().width )
	};
}, [ columnCount, withImages ]);

/**
 * Assert every card and image in the measured grid has the same width.
 *
 * @param {Awaited<ReturnType<typeof measureGrid>>} result         Grid measurements.
 * @param {number}                                  expectedTracks Column tracks the breakpoint should render.
 */
const expectEqualColumns = ( result, expectedTracks ) => {

	// Preconditions: stylesheet applied and the title would overflow an equal share.
	expect( result.display ).toBe( 'grid' );
	expect( result.tracks ).toBe( expectedTracks );
	expect( result.titleWidth ).toBeGreaterThan( result.share );

	for ( const width of [ ...result.cards, ...result.images ]) {
		expect( Math.abs( width - result.cards[ 0 ]) ).toBeLessThanOrEqual( 1 );
	}
};

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
			expectEqualColumns( await measureGrid( page, columns ), columns );
		}

		// Tablet (600–960px) collapses four and five columns to three; image-less cards expose content-sized tracks.
		await page.setViewportSize({ width: 800, height: 900 });

		for ( const columns of [ 4, 5 ]) {
			expectEqualColumns( await measureGrid( page, columns, false ), 3 );
		}
	});
});
