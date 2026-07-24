/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * External dependencies
 */
import { execSync } from 'child_process';

/**
 * E2E coverage for the `WooCommerce Builder by Otter` integration (issue #2822).
 *
 * The Otter metabox hooks into the product edit screen and lets merchants
 * toggle the builder. Enabling it stores the `_themeisle_gutenberg_woo_builder`
 * meta, and `WooCommerce_Builder::enable_block_editor()` then routes the product
 * into the block editor. These tests verify the hooking is wired correctly and
 * that the Otter elements show up in the metabox for the WooCommerce Builder.
 */

const runWpCli = ( command ) => execSync( `npx wp-env run cli -- ${ command }`, { encoding: 'utf8' });

const tryRunWpCli = ( command ) => {
	try {
		return runWpCli( command );
	} catch ( error ) {
		return '';
	}
};

// Reports whether a post meta key exists without leaking WP-CLI failures:
// runWpCli() propagates infrastructure errors, and the eval always prints 0/1.
const postMetaExists = ( postId, key ) =>
	runWpCli( `wp eval "echo metadata_exists( 'post', ${ postId }, '${ key }' ) ? 1 : 0;"` ).trim();

const createProduct = ( title ) => {
	const output = runWpCli( `wp post create --post_type=product --post_status=publish --post_title="${ title }" --porcelain` );
	const match = output.match( /^\s*(\d+)\s*$/m );
	return Number( match[ 1 ]);
};

test.describe( 'WooCommerce Builder product editing (issue #2822)', () => {
	let productId;

	test.beforeAll( () => {

		// WooCommerce is mounted by wp-env but only activated for this spec —
		// the rest of the suite runs without it, as its editor integrations
		// change load behavior for every other test. Serial project only.
		runWpCli( 'wp plugin activate woocommerce' );

		// Prevent the WooCommerce activation redirect from hijacking admin page loads.
		tryRunWpCli( 'wp transient delete _wc_activation_redirect' );
	});

	test.afterAll( () => {
		tryRunWpCli( 'wp plugin deactivate woocommerce' );
	});

	test.beforeEach( async({}, testInfo ) => {
		productId = createProduct( `Woo Builder ${ testInfo.workerIndex }-${ testInfo.retry }-${ Date.now() }` );
	});

	test.afterEach( () => {
		tryRunWpCli( `wp post delete ${ productId } --force` );
	});

	test( 'the Otter metabox hooks into the product edit screen with the enable toggle', async({ admin, page }) => {
		await admin.visitAdminPage( 'post.php', `post=${ productId }&action=edit` );

		// The license is stubbed as active in e2e, so the Otter metabox must render.
		await expect( page.locator( '#otter_woo_builder' ) ).toBeVisible();
		await expect( page.locator( 'a#otter-woo-builder' ) ).toHaveText( /Enable WooCommerce Builder/ );
	});

	test( 'enabling the builder persists the flag and shows the disable toggle', async({ admin, page }) => {
		await admin.visitAdminPage( 'post.php', `post=${ productId }&action=edit` );
		await page.locator( 'a#otter-woo-builder' ).click({ timeout: 120000 });
		await page.waitForLoadState( 'domcontentloaded', { timeout: 120000 });

		// The toggle must persist the builder flag server-side.
		expect( runWpCli( `wp post meta get ${ productId } _themeisle_gutenberg_woo_builder` ) ).toContain( '1' );

		// Re-open the edit screen the way a merchant would after the toggle.
		await admin.visitAdminPage( 'post.php', `post=${ productId }&action=edit` );

		// The builder must actually route the product into the block editor.
		await expect( page.locator( 'body.block-editor-page' ) ).toBeVisible();

		// The Otter metabox stays hooked in and now offers the disable toggle.
		await expect( page.locator( '#otter_woo_builder' ) ).toBeVisible();
		await expect( page.locator( 'a#otter-woo-builder' ) ).toHaveText( /Disable WooCommerce Builder/ );
	});

	test( 'disabling the builder removes the flag and restores the enable toggle', async({ admin, page }) => {

		// Enable, then disable through the same query-arg toggle the metabox buttons use.
		await admin.visitAdminPage( 'post.php', `post=${ productId }&action=edit&otter-woo-builder=1` );
		await admin.visitAdminPage( 'post.php', `post=${ productId }&action=edit&otter-woo-builder=0` );

		expect( postMetaExists( productId, '_themeisle_gutenberg_woo_builder' ) ).toBe( '0' );

		await admin.visitAdminPage( 'post.php', `post=${ productId }&action=edit` );

		await expect( page.locator( '#otter_woo_builder' ) ).toBeVisible();
		await expect( page.locator( 'a#otter-woo-builder' ) ).toHaveText( /Enable WooCommerce Builder/ );
	});
});
