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
 * enqueued instead of the optimized inline subset.
 *
 * Each test creates its own fresh post AFTER switching modes: the first
 * singular view generates and caches the post CSS, and cached requests never
 * reach the parser again.
 *
 * Serial project: flips a site-wide scenario flag that affects every request.
 */

const POST_CONTENT = `<!-- wp:paragraph {"className":"animated fadeIn"} -->
<p class="animated fadeIn">Animated collision probe</p>
<!-- /wp:paragraph -->`;

const createProbePost = async( requestUtils, title ) => {
	const post = await requestUtils.rest({
		method: 'POST',
		path: '/wp/v2/posts',
		data: {
			status: 'publish',
			title,
			content: POST_CONTENT
		}
	});

	// Plain query form: independent of the permalink structure.
	return `/?p=${ post.id }`;
};

test.describe( 'Sabberworm collision fallback', () => {
	test.afterAll( async({ requestUtils }) => {
		await requestUtils.rest({
			method: 'POST',
			path: '/otter-e2e/v1/sabberworm',
			data: { mode: 'own' }
		});
	});

	test( 'renders the page with the full stylesheet when a foreign parser is loaded', async({ page, otterUtils, requestUtils }) => {
		await otterUtils.setSabberwormMode( 'foreign' );

		try {
			const postUrl = await createProbePost( requestUtils, 'Foreign parser probe' );

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
		} finally {
			await otterUtils.setSabberwormMode( 'own' );
		}
	});

	test( 'inlines the optimized animation CSS with the bundled parser', async({ page, otterUtils, requestUtils }) => {
		await otterUtils.setSabberwormMode( 'own' );

		const postUrl = await createProbePost( requestUtils, 'Bundled parser probe' );

		const response = await page.goto( postUrl );

		await expect( page.getByText( 'Animated collision probe' ) ).toBeVisible();

		// The optimized subset is served: the fadeIn keyframe is present without
		// the full stock stylesheet.
		const html = await response.text();
		expect( html ).toContain( '@keyframes fadeIn' );
		expect( html ).not.toContain( 'otter-animation-css' );
	});
});
