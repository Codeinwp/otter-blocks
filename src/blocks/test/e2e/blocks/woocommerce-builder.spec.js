/**
 * WordPress dependencies
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * External dependencies
 */
import { execSync } from 'child_process';

/**
 * Regression tests for https://github.com/Codeinwp/otter-blocks/issues/2822
 *
 * Enabling `WooCommerce Builder by Otter` on a product stores the
 * `_themeisle_gutenberg_woo_builder` meta, and `WooCommerce_Builder::enable_block_editor()`
 * then forces the block editor for that product. WooCommerce's `Product data`
 * metabox (price fields included) must stay reachable on the product edit
 * screen either way — merchants otherwise lose access to pricing options.
 */

const runWpCli = ( command ) => execSync( `npx wp-env run cli -- ${ command }`, { encoding: 'utf8' });

const tryRunWpCli = ( command ) => {
	try {
		return runWpCli( command );
	} catch ( error ) {
		return '';
	}
};

const createProduct = ( title ) => {
	const output = runWpCli( `wp post create --post_type=product --post_status=publish --post_title="${ title }" --porcelain` );
	const match = output.match( /^\s*(\d+)\s*$/m );
	return Number( match[ 1 ]);
};

const attachScreenshot = async( testInfo, page, name ) => {
	await testInfo.attach( name, {
		body: await page.screenshot({ fullPage: true }),
		contentType: 'image/png'
	});
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

		// Unset only the persisted "Meta Boxes" panel preference so the
		// assertions exercise the plugin-provided default rather than a
		// leftover choice, without clobbering preferences other specs rely on.
		tryRunWpCli( 'wp user meta patch delete 1 wp_persisted_preferences core/edit-post metaBoxesMainIsOpen' );
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

	test( 'product edit screen shows the Product data panel and the builder toggle', async({ admin, page }) => {
		await admin.visitAdminPage( 'post.php', `post=${ productId }&action=edit` );

		await expect( page.locator( '#woocommerce-product-data' ) ).toBeVisible();
		await expect( page.locator( '#_regular_price' ) ).toBeVisible();

		// The license is stubbed as active in e2e, so the Otter metabox must offer the toggle.
		await expect( page.locator( '#otter_woo_builder' ) ).toBeVisible();
		await expect( page.locator( 'a#otter-woo-builder' ) ).toHaveText( /Enable WooCommerce Builder/ );
	});

	test( 'Product data panel stays reachable after enabling the builder', async({ admin, page }, testInfo ) => {
		await admin.visitAdminPage( 'post.php', `post=${ productId }&action=edit` );
		await page.locator( 'a#otter-woo-builder' ).click({ timeout: 120000 });
		await page.waitForLoadState( 'domcontentloaded', { timeout: 120000 });

		// The toggle must persist the builder flag server-side.
		expect( runWpCli( `wp post meta get ${ productId } _themeisle_gutenberg_woo_builder` ) ).toContain( '1' );

		// Re-open the edit screen the way a merchant would after the toggle.
		await admin.visitAdminPage( 'post.php', `post=${ productId }&action=edit` );

		// The builder must actually route the product into the block editor —
		// otherwise the metabox assertions below pass without exercising it.
		await expect( page.locator( 'body.block-editor-page' ) ).toBeVisible();
		await attachScreenshot( testInfo, page, 'product-edit-screen-with-builder-enabled' );

		// The WooCommerce product options must stay editable in the block editor.
		await expect( page.locator( '#woocommerce-product-data' ) ).toBeVisible();
		await expect( page.locator( '#_regular_price' ) ).toBeVisible();
	});

	test( 'disabling the builder restores the Product data panel', async({ admin, page }) => {

		// Enable, then disable through the same query-arg toggle the metabox buttons use.
		await admin.visitAdminPage( 'post.php', `post=${ productId }&action=edit&otter-woo-builder=1` );
		await admin.visitAdminPage( 'post.php', `post=${ productId }&action=edit&otter-woo-builder=0` );

		expect( tryRunWpCli( `wp post meta get ${ productId } _themeisle_gutenberg_woo_builder` ) ).not.toContain( '1' );

		await admin.visitAdminPage( 'post.php', `post=${ productId }&action=edit` );

		await expect( page.locator( '#woocommerce-product-data' ) ).toBeVisible();
		await expect( page.locator( '#_regular_price' ) ).toBeVisible();
	});
});
