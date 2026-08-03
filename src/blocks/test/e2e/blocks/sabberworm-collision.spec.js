/**
 * Internal dependencies
 */
import { test, expect } from '../fixtures';

/**
 * Frontend animation-CSS coverage for https://github.com/Codeinwp/otter-blocks/issues/2942.
 *
 * When another plugin loads a different php-css-parser release, mixing its
 * classes with Otter's bundled copy fatals at class-link time while
 * Base_CSS::get_animation_css() parses the animation stylesheet. The scenario
 * mu-plugin predefines the typed 9.x `Commentable` interface before plugins
 * load; the page must still render, with the full stock animation stylesheet
 * enqueued instead of the optimized inline subset — including on later
 * requests served from the generated post-CSS cache, which carries no
 * animation rules while the guard fails.
 *
 * Each test creates its own fresh post AFTER switching modes: the first
 * singular view generates and caches the post CSS, and cached requests never
 * reach the parser again.
 *
 * Serial project: flips a site-wide scenario flag that affects every request.
 */

// The Progress Bar makes the generated post CSS non-empty, so the second
// request is served from the cached stylesheet file.
const FOREIGN_POST_CONTENT = `<!-- wp:paragraph {"className":"animated fadeIn"} -->
<p class="animated fadeIn">Animated collision probe</p>
<!-- /wp:paragraph -->

<!-- wp:themeisle-blocks/progress-bar {"id":"wp-block-themeisle-blocks-progress-bar-e2e2942","title":"Collision probe","percentage":75,"titleColor":"#123abc","height":36} -->
<div id="wp-block-themeisle-blocks-progress-bar-e2e2942" class="wp-block-themeisle-blocks-progress-bar"><div class="wp-block-themeisle-blocks-progress-bar__title">Collision probe</div><div class="wp-block-themeisle-blocks-progress-bar__area"><div class="wp-block-themeisle-blocks-progress-bar__area__bar"></div></div></div>
<!-- /wp:themeisle-blocks/progress-bar -->`;

const OWN_POST_CONTENT = `<!-- wp:paragraph {"className":"animated fadeIn"} -->
<p class="animated fadeIn">Animated collision probe</p>
<!-- /wp:paragraph -->`;

test.describe( 'Sabberworm collision fallback', () => {
	const createdPosts = [];

	const createProbePost = async( requestUtils, title, content ) => {
		const post = await requestUtils.rest({
			method: 'POST',
			path: '/wp/v2/posts',
			data: {
				status: 'publish',
				title,
				content
			}
		});

		createdPosts.push( post.id );

		// Plain query form: independent of the permalink structure.
		return `/?p=${ post.id }`;
	};

	test.afterAll( async({ requestUtils }) => {
		await requestUtils.rest({
			method: 'POST',
			path: '/otter-e2e/v1/sabberworm',
			data: { mode: 'own' }
		});

		// Only this spec's own posts — other specs run against the same site.
		// Best-effort per post: one failed request must not orphan the rest.
		while ( createdPosts.length ) {
			const postId = createdPosts.pop();
			try {
				await requestUtils.rest({
					method: 'DELETE',
					path: `/wp/v2/posts/${ postId }`,
					params: { force: true }
				});
			} catch ( error ) {
				console.warn( `Could not delete post ${ postId }:`, error.message );
			}
		}
	});

	test( 'serves the full stylesheet when a foreign parser is loaded, also from the CSS cache', async({ page, otterUtils, requestUtils }) => {
		await otterUtils.setSabberwormMode( 'foreign' );

		try {
			const postUrl = await createProbePost( requestUtils, 'Foreign parser probe', FOREIGN_POST_CONTENT );

			const response = await page.goto( postUrl );

			expect( response.status() ).toBe( 200 );

			await expect( page.getByText( 'Animated collision probe' ) ).toBeVisible();

			// Assert on the server response: the animation frontend script rewrites
			// the block's classes in the live DOM once the animation plays.
			const html = await response.text();
			expect( html ).toContain( 'animated fadeIn' );
			expect( html ).not.toContain( 'Fatal error' );
			expect( html ).not.toContain( 'must be compatible' );

			// The optimization is skipped, so the stock stylesheet carries the animations.
			expect( html ).toContain( 'otter-animation-css' );
			expect( html ).toMatch( /animation\/index\.css/ );

			// The first request generated and cached the post CSS without animation
			// rules; the fallback must survive requests served from that cache.
			const cachedResponse = await page.goto( postUrl );
			const cachedHtml = await cachedResponse.text();
			expect( cachedHtml ).toContain( 'otter-animation-css' );
			expect( cachedHtml ).not.toContain( 'Fatal error' );
		} finally {
			await otterUtils.setSabberwormMode( 'own' );
		}
	});

	test( 'inlines the optimized animation CSS with the bundled parser', async({ page, otterUtils, requestUtils }) => {
		await otterUtils.setSabberwormMode( 'own' );

		const postUrl = await createProbePost( requestUtils, 'Bundled parser probe', OWN_POST_CONTENT );

		const response = await page.goto( postUrl );

		await expect( page.getByText( 'Animated collision probe' ) ).toBeVisible();

		// The optimized subset is served: the fadeIn keyframe is present without
		// the full stock stylesheet.
		const html = await response.text();
		expect( html ).toContain( '@keyframes fadeIn' );
		expect( html ).not.toContain( 'otter-animation-css' );
	});
});
