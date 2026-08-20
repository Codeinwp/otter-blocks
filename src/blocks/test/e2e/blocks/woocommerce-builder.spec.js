/**
 * Internal dependencies
 */
import { test, expect } from '../fixtures';

/**
 * WooCommerce Builder forces the block editor for enabled products. Since
 * WP 6.7 the iframed post editor renders meta boxes in a bottom drawer, so
 * these tests pin the two guarantees that keep WooCommerce's Product data
 * panel (price, inventory, …) reachable there:
 *
 * 1. the drawer defaults to open (an explicit user preference still wins);
 * 2. a `meta-box-order_product` that strands the Product data box in the
 *    "side" area (one accidental click on the metabox move arrows persists
 *    that) is corrected back into the main area at render time.
 */

const PRODUCT_DATA = '#woocommerce-product-data';
const META_BOXES_DRAWER = '.edit-post-meta-boxes-main';

/**
 * The Otter welcome tour pops on fresh profiles; close it if it appears.
 *
 * @param {import('@playwright/test').Page} page Playwright page.
 */
const dismissOtterTour = async( page ) => {
	const guide = page.locator( '.components-guide' );
	if ( await guide.isVisible({ timeout: 2000 }).catch( () => false ) ) {
		await page.keyboard.press( 'Escape' );
		await expect( guide ).toBeHidden();
	}
};

test.describe( 'WooCommerce Builder product editor', () => {
	// WooCommerce is mounted by wp-env but only activated around this spec —
	// its editor integrations would change load behavior (and performance
	// numbers) for every other suite. Serial project only.
	test.beforeAll( async({ requestUtils }) => {
		await requestUtils.activatePlugin( 'woocommerce' );
	});

	test.afterAll( async({ requestUtils }) => {
		await requestUtils.deactivatePlugin( 'woocommerce' );
	});

	// A drawer preference or metabox order left by an earlier run would skew
	// the first test as much as a later one, so reset on both sides.
	const resetSharedUserState = async( otterUtils ) => {
		await otterUtils.setProductMetaBoxOrder( null );
		await otterUtils.resetMetaBoxesPane();
	};

	// wp-env is reused between runs, so every product a test publishes has to
	// be removed again or they pile up and skew later product suites.
	let createdProductIds = [];

	const createProduct = async( otterUtils, args ) => {
		const { id } = await otterUtils.createWooProduct( args );

		createdProductIds.push( id );

		return id;
	};

	test.beforeEach( async({ otterUtils }) => {
		await resetSharedUserState( otterUtils );
	});

	// Runs while WooCommerce is still active (afterAll deactivates it), so the
	// deletes also clear its product lookup tables.
	test.afterEach( async({ otterUtils }) => {
		await resetSharedUserState( otterUtils );

		if ( createdProductIds.length ) {
			await otterUtils.deleteWooProducts( createdProductIds );
			createdProductIds = [];
		}
	});

	test( 'builder products open in the block editor with the Product data panel visible', async({ admin, page, otterUtils }) => {
		const id = await createProduct( otterUtils, { builder: true });

		await admin.editPost( id );
		await dismissOtterTour( page );

		// Block editor is active for the builder product…
		await expect( page.locator( 'body.block-editor-page' ) ).toHaveCount( 1 );

		// …and the Product data metabox is visible without any interaction:
		// the meta boxes drawer defaults to open on builder products.
		await expect( page.locator( PRODUCT_DATA ) ).toBeVisible();
		await expect( page.locator( `${ PRODUCT_DATA } input[name="_regular_price"]` ) ).toHaveValue( '49.99' );
	});

	test( 'Product data stranded in the side area is rescued into the drawer', async({ admin, page, otterUtils }) => {
		const id = await createProduct( otterUtils, { builder: true });

		// The corrupted layout one metabox arrow click can persist: Product
		// data serialized into "side", which renders inside the ~280px
		// sidebar where its layout breaks.
		await otterUtils.setProductMetaBoxOrder({
			normal: '',
			advanced: 'commentsdiv,postexcerpt',
			side: 'woocommerce-product-data,otter_woo_builder,woocommerce-product-images'
		});

		await admin.editPost( id );
		await dismissOtterTour( page );

		await expect( page.locator( `${ META_BOXES_DRAWER } ${ PRODUCT_DATA }` ) ).toBeVisible();
		await expect( page.locator( `.interface-complementary-area ${ PRODUCT_DATA }` ) ).toHaveCount( 0 );
	});

	test( 'products without the builder keep the classic editor', async({ admin, page, otterUtils }) => {
		const id = await createProduct( otterUtils, { builder: false });

		await admin.visitAdminPage( 'post.php', `post=${ id }&action=edit` );

		await expect( page.locator( 'body.block-editor-page' ) ).toHaveCount( 0 );
		await expect( page.locator( PRODUCT_DATA ) ).toBeVisible();
	});

	test( 'an explicitly collapsed drawer stays collapsed (user preference wins)', async({ admin, page, otterUtils }) => {
		const id = await createProduct( otterUtils, { builder: true });

		await admin.editPost( id );
		await dismissOtterTour( page );
		await expect( page.locator( PRODUCT_DATA ) ).toBeVisible();

		// Collapse the drawer — this persists the user preference, which
		// setDefaults() must not override on the next load. Keyboard: the
		// toggle's click point is covered by its drag-resize separator. The
		// preference write is debounced, so hold for the REST flush before
		// reloading.
		await Promise.all([
			page.waitForResponse( ( response ) => response.url().includes( '/wp/v2/users/me' ) ),
			page.getByRole( 'button', { name: 'Meta Boxes' }).press( 'Enter' )
		]);
		await expect( page.locator( PRODUCT_DATA ) ).toBeHidden();

		await admin.editPost( id );
		await expect( page.locator( META_BOXES_DRAWER ) ).toBeVisible();
		await expect( page.locator( PRODUCT_DATA ) ).toBeHidden();
	});
});
