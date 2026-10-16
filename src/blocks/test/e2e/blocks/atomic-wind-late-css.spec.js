/**
 * Internal dependencies
 */
import { test, expect } from '../fixtures';
import { setAtomicWind } from '../helpers/design-library';

/**
 * Each post caches its own compiled stylesheet, and a post rendered in the
 * footer (like a hooked layout) prints its stylesheet after the page's own.
 * Every stylesheet restarts Tailwind's utility order, so a later base utility
 * must not beat an earlier responsive one.
 */
const DESKTOP = { width: 1280, height: 800 };

const box = ( className, children ) =>
	`<!-- wp:atomic-wind/box {"className":"${ className }"} --><div class="wp-block-atomic-wind-box ${ className }">${ children }</div><!-- /wp:atomic-wind/box -->`;

/**
 * Load a post as the editor so the style builder caches its compiled CSS.
 *
 * @param {import('@playwright/test').Page} page Page.
 * @param {string}                          link Post URL.
 */
const cachePostCss = async( page, link ) => {
	await page.addInitScript( () => {
		document.addEventListener( 'atomic-wind:css-saved', () => {
			window.otterE2ECssSaved = true;
		});
	});
	await page.goto( link );
	await page.waitForFunction( () => window.otterE2ECssSaved );
};

/**
 * @param {import('@playwright/test').Page} page     Page.
 * @param {string}                          selector Grid element.
 * @return {Promise<number>} Rendered column count.
 */
const columnCount = ( page, selector ) =>
	page.$eval( selector, ( el ) => window.getComputedStyle( el ).gridTemplateColumns.split( ' ' ).length );

/**
 * Publish the main grid post and a footer layout post rendered after it.
 *
 * @param {import('@wordpress/e2e-test-utils-playwright').RequestUtils} requestUtils Request utils.
 * @param {string}                                                      layoutInner  Markup inside the layout's grid.
 * @return {Promise<Array<{ id: number, link: string }>>} The main and layout posts.
 */
const publishPosts = ( requestUtils, layoutInner ) => Promise.all([
	requestUtils.createPost({
		title: 'Atomic Wind responsive grid',
		status: 'publish',
		content: box( 'aw-main grid grid-cols-1 lg:grid-cols-4', '<div>1</div><div>2</div><div>3</div><div>4</div>' )
	}),
	requestUtils.createPost({
		title: 'Atomic Wind footer layout',
		status: 'publish',
		content: box( 'aw-layout grid grid-cols-1', layoutInner )
	})
]);

/**
 * Cache both posts' CSS, then view them together once as the editor, which
 * caches their combined stylesheet.
 *
 * @param {import('@playwright/test').Page} page   Logged-in page.
 * @param {{ link: string }}                main   Main post.
 * @param {{ id: number, link: string }}    layout Layout post.
 * @return {Promise<string>} URL rendering the layout after the main post.
 */
const cacheCombinedPage = async( page, main, layout ) => {
	await page.setViewportSize( DESKTOP );
	await cachePostCss( page, main.link );
	await cachePostCss( page, layout.link );

	const url = new URL( main.link );
	url.searchParams.set( 'otter_e2e_late_post', layout.id );
	await cachePostCss( page, url.toString() );

	return url.toString();
};

/**
 * @param {import('@playwright/test').Browser} browser Browser.
 * @param {string}                             url     Page to open logged out.
 * @return {Promise<import('@playwright/test').Page>} Visitor page.
 */
const openAsVisitor = async( browser, url ) => {
	const visitor = await browser.newPage({ storageState: { cookies: [], origins: [] }, viewport: DESKTOP });
	await visitor.goto( url );
	await expect( visitor.locator( '#wpadminbar' ) ).toHaveCount( 0 );

	return visitor;
};

/**
 * @param {import('@wordpress/e2e-test-utils-playwright').RequestUtils} requestUtils Request utils.
 * @param {Array<{ id: number }>}                                       posts        Posts to delete.
 */
const deletePosts = ( requestUtils, posts ) => Promise.all( posts.map( ( post ) => requestUtils.rest({
	method: 'DELETE',
	path: `/wp/v2/posts/${ post.id }`,
	params: { force: true }
}) ) );

test.describe( 'Atomic Wind late cached CSS', () => {
	test.beforeEach( async({ otterUtils }) => {
		await setAtomicWind( otterUtils, true );
	});

	test.afterAll( async({ otterUtils }) => {
		await setAtomicWind( otterUtils, false );
	});

	test( 'keeps responsive grid columns when a footer post adds its stylesheet', async({ browser, page, requestUtils }) => {
		const posts = await publishPosts( requestUtils, '<div>Footer</div>' );

		try {
			const url = await cacheCombinedPage( page, ...posts );

			// Proves both cached stylesheets reached the page, the footer one last.
			await expect( page.locator( '#atomic-wind-tailwind-late-inline-css' ) ).toHaveCount( 1 );
			await expect.poll( () => columnCount( page, '.aw-main' ) ).toBe( 4 );
			await expect.poll( () => columnCount( page, '.aw-layout' ) ).toBe( 1 );

			await page.reload();

			await expect( page.locator( '#atomic-wind-tailwind-generator-js' ) ).toHaveCount( 0 );
			await expect( page.locator( '#atomic-wind-tailwind-late-inline-css' ) ).toHaveCount( 1 );
			expect( await columnCount( page, '.aw-main' ) ).toBe( 4 );
			expect( await columnCount( page, '.aw-layout' ) ).toBe( 1 );

			// A logged-out visitor rendering the same markup shares the cached stylesheet.
			const visitor = await openAsVisitor( browser, url );
			try {
				await expect( visitor.locator( '#atomic-wind-tailwind-generator-js' ) ).toHaveCount( 0 );
				expect( await columnCount( visitor, '.aw-main' ) ).toBe( 4 );
				expect( await columnCount( visitor, '.aw-layout' ) ).toBe( 1 );
			} finally {
				await visitor.close();
			}
		} finally {
			await deletePosts( requestUtils, posts );
		}
	});

	test( 'does not serve the editor\'s stylesheet to a visitor whose markup Block Conditions change', async({ browser, page, requestUtils }) => {
		const posts = await publishPosts(
			requestUtils,
			'<!-- wp:group {"className":"aw-members md:grid-cols-2","otterConditions":[[{"type":"loggedInUser"}]]} --><div class="wp-block-group aw-members md:grid-cols-2"></div><!-- /wp:group -->'
		);

		try {
			const url = await cacheCombinedPage( page, ...posts );

			await page.reload();
			await expect( page.locator( '.aw-members' ) ).toHaveCount( 1 );
			await expect( page.locator( '#atomic-wind-tailwind-generator-js' ) ).toHaveCount( 0 );

			const visitor = await openAsVisitor( browser, url );
			try {
				await expect( visitor.locator( '.aw-members' ) ).toHaveCount( 0 );
				await expect( visitor.locator( '#atomic-wind-tailwind-generator-js' ) ).toHaveCount( 1 );
				await expect.poll( () => columnCount( visitor, '.aw-main' ) ).toBe( 4 );
			} finally {
				await visitor.close();
			}
		} finally {
			await deletePosts( requestUtils, posts );
		}
	});
});
