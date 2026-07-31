/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Frontend rendering of the postContent dynamic tag (issue #2929).
 *
 * The tag's context post ID used to be passed to get_the_content() as
 * $more_link_text, so core fell back to the loop globals: a clobbered $pages
 * global surfaced "Undefined array key -1" from post-template.php and the tag
 * rendered empty.
 */
test.describe( 'Dynamic Content postContent tag', () => {
	const TARGET_CONTENT = 'Otter dynamic target content 2929';
	let pageId;

	test.beforeAll( async({ requestUtils }) => {
		// The Query Loop block has no include/post__in arg, so the loop is
		// scoped to the target post via a unique search token in its title.
		await requestUtils.createPost({
			title: 'Dynamic content target frontier2929',
			content: `<!-- wp:paragraph --><p>${ TARGET_CONTENT }</p><!-- /wp:paragraph -->`,
			status: 'publish'
		});

		const holder = await requestUtils.createPage({
			title: 'Dynamic content holder 2929',
			// The tag is wrapped in a group: postContent runs the_content, which
			// wraps its output in <p>, and a nested <p> would be auto-closed by
			// the browser parser and land outside the marker element.
			content: `<!-- wp:query {"query":{"perPage":1,"postType":"post","search":"frontier2929","inherit":false}} -->
<div class="wp-block-query"><!-- wp:post-template -->
<!-- wp:group {"className":"o-dyn-2929"} --><div class="wp-block-group o-dyn-2929"><!-- wp:paragraph --><p><o-dynamic data-type="postContent" data-context="query">Post Content</o-dynamic></p><!-- /wp:paragraph --></div><!-- /wp:group -->
<!-- /wp:post-template --></div>
<!-- /wp:query -->`,
			status: 'publish'
		});

		pageId = holder.id;
	});

	test( 'renders the target post content on the frontend', async({ page }) => {
		await page.goto( `/?page_id=${ pageId }` );

		await expect( page.locator( '.o-dyn-2929' ) ).toContainText( TARGET_CONTENT );
	});

	test( 'survives a corrupted $pages loop global without PHP warnings', async({ page }) => {
		await page.goto( `/?page_id=${ pageId }&otter_e2e_corrupt_pages=1` );

		// Regression #2929: "Warning: Undefined array key -1 in .../post-template.php"
		// (PHP 7.4 words it "Undefined offset: -1") plus a preg_match() deprecation.
		await expect( page.locator( 'body' ) ).not.toContainText( /Undefined (array key|offset)/ );
		await expect( page.locator( 'body' ) ).not.toContainText( 'preg_match' );

		// The tag must still resolve the context post's content.
		await expect( page.locator( '.o-dyn-2929' ) ).toContainText( TARGET_CONTENT );
	});
});
