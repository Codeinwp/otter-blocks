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

test.describe( 'Atomic Wind late cached CSS', () => {
	test.beforeEach( async({ otterUtils }) => {
		await setAtomicWind( otterUtils, true );
	});

	test.afterAll( async({ otterUtils }) => {
		await setAtomicWind( otterUtils, false );
	});

	test( 'keeps responsive grid columns when a footer post adds its stylesheet', async({ page, requestUtils }) => {
		const main = await requestUtils.createPost({
			title: 'Atomic Wind responsive grid',
			status: 'publish',
			content: box( 'aw-main grid grid-cols-1 lg:grid-cols-4', '<div>1</div><div>2</div><div>3</div><div>4</div>' )
		});
		const layout = await requestUtils.createPost({
			title: 'Atomic Wind footer layout',
			status: 'publish',
			content: box( 'aw-layout grid grid-cols-1', '<div>Footer</div>' )
		});

		try {
			await page.setViewportSize( DESKTOP );
			await cachePostCss( page, main.link );
			await cachePostCss( page, layout.link );

			const url = new URL( main.link );
			url.searchParams.set( 'otter_e2e_late_post', layout.id );

			// First combined visit: the generator orders the page, and the editor's run caches it.
			await cachePostCss( page, url.toString() );

			// Proves both cached stylesheets reached the page, the footer one last.
			await expect( page.locator( '#atomic-wind-tailwind-late-inline-css' ) ).toHaveCount( 1 );
			await expect.poll( () => columnCount( page, '.aw-main' ) ).toBe( 4 );
			await expect.poll( () => columnCount( page, '.aw-layout' ) ).toBe( 1 );

			await page.reload();

			await expect( page.locator( '#atomic-wind-tailwind-generator-js' ) ).toHaveCount( 0 );
			await expect( page.locator( '#atomic-wind-tailwind-late-inline-css' ) ).toHaveCount( 1 );
			expect( await columnCount( page, '.aw-main' ) ).toBe( 4 );
			expect( await columnCount( page, '.aw-layout' ) ).toBe( 1 );
		} finally {
			for ( const post of [ main, layout ]) {
				await requestUtils.rest({
					method: 'DELETE',
					path: `/wp/v2/posts/${ post.id }`,
					params: { force: true }
				});
			}
		}
	});
});
