/**
 * Internal dependencies
 */
import { test, expect } from '../fixtures';

/**
 * Frontend widgets-CSS coverage for https://github.com/Codeinwp/otter-blocks/issues/2937.
 *
 * A frontend request with an active sidebar and no generated widget stylesheet
 * reaches CSS_Handler::is_writable() from Block_Frontend::enqueue_widgets_css()
 * at wp_footer. In production that request fataled when WP_Filesystem() was
 * unavailable. The exact missing-function condition can only be recreated in
 * the isolated PHPUnit sandbox (tests/test-css-handler.php); here the
 * filesystem is blocked at the get_filesystem_method() level, which drives the
 * same is_writable() → false branch and asserts the user-visible contract: the
 * page must finish rendering and serve the widget CSS inline.
 *
 * Serial project: switches the active theme and mutates site-wide widget,
 * option, and filesystem state.
 */

const WIDGET_SELECTOR = '.wp-block-themeisle-blocks-progress-bar';
const WIDGET_CSS_ID = '#wp-block-themeisle-blocks-progress-bar-e2e2937';

test.describe( 'Widgets CSS frontend', () => {
	test.beforeAll( async({ requestUtils }) => {
		// Classic theme with a registered sidebar; block themes register none,
		// so the widgets-CSS path is unreachable on the default theme.
		await requestUtils.activateTheme( 'twentytwentyone' );

		await requestUtils.rest({
			method: 'POST',
			path: '/otter-e2e/v1/widgets/seed'
		});
	});

	test.afterAll( async({ requestUtils }) => {
		await requestUtils.rest({
			method: 'POST',
			path: '/otter-e2e/v1/widgets/cleanup'
		});

		await requestUtils.activateTheme( 'twentytwentythree' );
	});

	test( 'completes the page with inline widget CSS when the filesystem is unavailable', async({ page, otterUtils }) => {
		await otterUtils.setFilesystemMode( 'blocked' );

		try {
			// Take the no-stylesheet branch on a fresh request.
			await otterUtils.seedOtterWidget();

			const response = await page.goto( '/' );

			expect( response.status() ).toBe( 200 );

			// The widget itself rendered inside the sidebar.
			await expect( page.locator( WIDGET_SELECTOR ) ).toBeVisible();

			const content = await page.content();

			// The inline <style> fallback is echoed at wp_footer, after the
			// is_writable() call that used to fatal — its presence proves the
			// request completed past the crash point.
			expect( content ).toContain( WIDGET_CSS_ID );
			expect( content ).toContain( '--percentage' );
			expect( content ).not.toContain( 'Fatal error' );

			// No stylesheet file could be written, so none may be enqueued.
			await expect( page.locator( 'link#otter-widgets-css' ) ).toHaveCount( 0 );
		} finally {
			await otterUtils.setFilesystemMode( 'ok' );
		}
	});

	test( 'writes and enqueues the widgets CSS file when the filesystem is available', async({ page, otterUtils }) => {
		await otterUtils.setFilesystemMode( 'ok' );

		// Fresh no-stylesheet state; this request regenerates and saves the file.
		await otterUtils.seedOtterWidget();

		await page.goto( '/' );
		await expect( page.locator( WIDGET_SELECTOR ) ).toBeVisible();

		// The file was written during the previous request; this one enqueues it.
		await page.reload();

		await expect( page.locator( WIDGET_SELECTOR ) ).toBeVisible();

		const stylesheet = page.locator( 'link#otter-widgets-css' );
		await expect( stylesheet ).toHaveCount( 1 );
		await expect( stylesheet ).toHaveAttribute( 'href', /themeisle-gutenberg\/widgets-/ );
	});
});
