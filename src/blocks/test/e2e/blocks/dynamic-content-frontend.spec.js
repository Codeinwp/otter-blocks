/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test( 'keeps anonymous comment magic tags inert in nested latest comments', async({ browser, baseURL, requestUtils }) => {
	const marker = `Comment link ${ Date.now() }`;
	const magicTag = '{otterDynamic?x=/?&default=javascript:alert(1)}';
	const post = await requestUtils.createPost({
		title: marker,
		status: 'publish',
		comment_status: 'open',
		content: '<!-- wp:group --><div class="wp-block-group"><!-- wp:latest-comments {"displayContent":"full","displayAvatar":false,"commentsToShow":100} /--></div><!-- /wp:group -->'
	});
	const visitor = await browser.newContext({ baseURL, storageState: { cookies: [], origins: [] }});

	try {
		const response = await visitor.request.post( '/wp-comments-post.php', {
			form: {
				comment_post_ID: post.id,
				author: marker,
				email: `otter-${ post.id }@example.org`,
				comment: `<a href="${ magicTag }">${ marker }</a>`
			}
		});
		expect( response.ok() ).toBeTruthy();

		const comments = await requestUtils.rest({
			path: '/wp/v2/comments',
			params: { post: post.id, status: 'all', context: 'edit' }
		});
		expect( comments ).toHaveLength( 1 );
		expect( comments[0].author ).toBe( 0 );
		await requestUtils.rest({
			method: 'POST',
			path: `/wp/v2/comments/${ comments[0].id }`,
			data: { status: 'approved' }
		});

		const page = await visitor.newPage();
		await page.goto( `/?p=${ post.id }` );
		const link = page.locator( '.wp-block-latest-comments__comment-excerpt' ).getByRole( 'link', { name: marker, exact: true });
		await expect( link ).toHaveAttribute( 'href', magicTag );
	} finally {
		await visitor.close();
		await requestUtils.rest({
			method: 'DELETE',
			path: `/wp/v2/posts/${ post.id }`,
			params: { force: true }
		});
	}
});

test( 'preserves authored links without resolving assembled dynamic markers', async({ page, requestUtils }) => {
	const marker = `Dynamic marker ${ Date.now() }`;
	const post = await requestUtils.createPost({
		title: marker,
		status: 'publish',
		content: `<!-- wp:group --><div class="wp-block-group"><!-- wp:paragraph --><p><a href="#otterDynamicLink?type=siteURL&context={otterDynamic?type=postID}" title="{otterDynamic?type=postTitle}">Authored ${ marker }</a><a href="#otterDynamic{otterDynamic?default=Link}?type=siteURL" title="{otterDynamic?type=postTitle}">Assembled ${ marker }</a></p><!-- /wp:paragraph --></div><!-- /wp:group -->`
	});

	try {
		await page.goto( `/?p=${ post.id }` );
		const authored = page.getByRole( 'link', { name: `Authored ${ marker }`, exact: true });
		const assembled = page.getByRole( 'link', { name: `Assembled ${ marker }`, exact: true });
		await expect( authored ).toHaveAttribute( 'href', new URL( post.link ).origin );
		await expect( authored ).toHaveAttribute( 'title', marker );
		await expect( assembled ).toHaveAttribute( 'href', '#otterDynamicLink?type=siteURL' );
		await expect( assembled ).toHaveAttribute( 'title', marker );
	} finally {
		await requestUtils.rest({
			method: 'DELETE',
			path: `/wp/v2/posts/${ post.id }`,
			params: { force: true }
		});
	}
});

/**
 * Frontend rendering of the postContent dynamic tag (issue #2929).
 *
 * The tag's context post ID used to be passed to get_the_content() as
 * $more_link_text, so core fell back to the loop globals: a clobbered $pages
 * global surfaced "Undefined array key -1" from post-template.php and the tag
 * rendered empty.
 */
test.describe( 'Dynamic Content postContent tag', () => {

	// wp-env is persistent, so the fixtures are namespaced per run and torn down
	// in afterAll: a fixed token would let leftovers from an earlier run (or a
	// retry) win the Query Loop and make the assertions state-dependent.
	let token;
	let targetContent;
	let pageId;

	// Every record created by this spec, so a retried beforeAll cleans up both
	// attempts instead of leaking the first one.
	const created = [];

	test.beforeAll( async({ requestUtils }) => {
		token         = `frontier2929${ Date.now() }`;
		targetContent = `Otter dynamic target content ${ token }`;

		// The Query Loop block has no include/post__in arg, so the loop is
		// scoped to the target post via the run's search token in its title.
		const target = await requestUtils.createPost({
			title: `Dynamic content target ${ token }`,
			content: `<!-- wp:paragraph --><p>${ targetContent }</p><!-- /wp:paragraph -->`,
			status: 'publish'
		});

		created.push({ type: 'posts', id: target.id });

		const holder = await requestUtils.createPage({
			title: `Dynamic content holder ${ token }`,
			// The tag is wrapped in a group: postContent runs the_content, which
			// wraps its output in <p>, and a nested <p> would be auto-closed by
			// the browser parser and land outside the marker element.
			content: `<!-- wp:query {"query":{"perPage":1,"postType":"post","search":"${ token }","inherit":false}} -->
<div class="wp-block-query"><!-- wp:post-template -->
<!-- wp:group {"className":"o-dyn-2929"} --><div class="wp-block-group o-dyn-2929"><!-- wp:paragraph --><p><o-dynamic data-type="postContent" data-context="query">Post Content</o-dynamic></p><!-- /wp:paragraph --></div><!-- /wp:group -->
<!-- /wp:post-template --></div>
<!-- /wp:query -->`,
			status: 'publish'
		});

		created.push({ type: 'pages', id: holder.id });

		pageId = holder.id;
	});

	test.afterAll( async({ requestUtils }) => {
		// Only this spec's own records - other specs run against the same site.
		// Best-effort per record: one failed request must not orphan the rest.
		while ( created.length ) {
			const record = created.pop();
			try {
				await requestUtils.rest({
					method: 'DELETE',
					path: `/wp/v2/${ record.type }/${ record.id }`,
					params: { force: true }
				});
			} catch ( error ) {
				console.warn( `Could not delete ${ record.type }/${ record.id }:`, error.message );
			}
		}
	});

	test( 'renders the target post content on the frontend', async({ page }) => {
		await page.goto( `/?page_id=${ pageId }` );

		await expect( page.locator( '.o-dyn-2929' ) ).toContainText( targetContent );
	});

	test( 'survives a corrupted $pages loop global without PHP warnings', async({ page }) => {
		await page.goto( `/?page_id=${ pageId }&otter_e2e_corrupt_pages=1` );

		// Regression #2929: "Warning: Undefined array key -1 in .../post-template.php"
		// (PHP 7.4 words it "Undefined offset: -1") plus a preg_match() deprecation.
		await expect( page.locator( 'body' ) ).not.toContainText( /Undefined (array key|offset)/ );
		await expect( page.locator( 'body' ) ).not.toContainText( 'preg_match' );

		// The tag must still resolve the context post's content.
		await expect( page.locator( '.o-dyn-2929' ) ).toContainText( targetContent );
	});
});
