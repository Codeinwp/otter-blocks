/**
 * Internal dependencies
 */
import { test, expect } from '../fixtures';

/**
 * Regression for #2954: a class listed for autoloading that the released package cannot load
 * (stale Composer classmap) crashed every request in `Main::autoload_classes()`.
 */
test.describe( 'Autoloader resilience', () => {
	test.beforeEach( async({ otterUtils }) => {
		await otterUtils.setOptions({ otter_e2e_broken_autoloader: true });
	});

	test.afterEach( async({ otterUtils }) => {
		await otterUtils.setOptions({ otter_e2e_broken_autoloader: false });
	});

	test( 'frontend survives an unloadable class in the autoload list', async({ page, requestUtils }) => {
		const post = await requestUtils.createPost({
			title: 'Autoloader resilience',
			content: '<!-- wp:themeisle-blocks/posts-grid /-->',
			status: 'publish'
		});

		const response = await page.goto( post.link );

		expect( response.status() ).toBe( 200 );
		await expect( page.locator( 'text=There has been a critical error' ) ).toBeHidden();

		// The blocks listed after the unloadable one must still be initialized:
		// posts-grid only renders when Registration ran. The grid lists earlier
		// posts, which can embed their own grid, so match the first one.
		await expect( page.locator( '.wp-block-themeisle-blocks-posts-grid' ).first() ).toBeVisible();
	});

	test( 'admin survives an unloadable class in the autoload list', async({ page, admin }) => {
		await admin.visitAdminPage( 'admin.php?page=otter' );

		await expect( page.locator( 'text=There has been a critical error' ) ).toBeHidden();
		await expect( page.locator( '#otter' ) ).toBeVisible();
	});
});
