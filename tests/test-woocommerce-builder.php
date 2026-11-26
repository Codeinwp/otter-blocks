<?php
/**
 * Class TestWooCommerceBuilder
 *
 * @package gutenberg-blocks
 */

use ThemeIsle\OtterPro\Plugins\WooCommerce_Builder;

/**
 * WooCommerce Builder Test Case.
 *
 * Covers the two guards that keep the WooCommerce Product data metabox
 * reachable on builder products: the meta-boxes pane default and the
 * metabox-order rescue (issue #2822).
 */
class TestWooCommerceBuilder extends WP_UnitTestCase {

	/**
	 * The WooCommerce Builder instance.
	 *
	 * @var WooCommerce_Builder
	 */
	protected $woo_builder;

	/**
	 * A product post with the builder enabled.
	 *
	 * @var int
	 */
	protected $builder_product_id;

	/**
	 * A product post without the builder.
	 *
	 * @var int
	 */
	protected $plain_product_id;

	/**
	 * The corrupted metabox order one move-arrow click can persist.
	 *
	 * @var array<string, string>
	 */
	protected $stranded_order = array(
		'normal'   => '',
		'advanced' => 'commentsdiv,postexcerpt',
		'side'     => 'woocommerce-product-data,otter_woo_builder,woocommerce-product-images',
	);

	/**
	 * Set up.
	 */
	public function set_up() {
		parent::set_up();

		$this->woo_builder = new WooCommerce_Builder();

		// WooCommerce is loaded by tests/bootstrap.php and registers `product`.
		// Register the editor script fresh so inline-data assertions are isolated.
		wp_scripts()->remove( 'wp-edit-post' );
		wp_scripts()->add( 'wp-edit-post', false );

		$this->builder_product_id = self::factory()->post->create( array( 'post_type' => 'product' ) );
		update_post_meta( $this->builder_product_id, '_themeisle_gutenberg_woo_builder', true );

		$this->plain_product_id = self::factory()->post->create( array( 'post_type' => 'product' ) );
	}

	/**
	 * Tear down.
	 */
	public function tear_down() {
		/*
		 * Discard the whole registry instead of just the dummy handle: it is
		 * shared between tests, so removing the handle would leave it without
		 * WordPress's own wp-edit-post registration and break later tests
		 * depending on suite order. Nulling it makes the next wp_scripts()
		 * call rebuild every default registration.
		 */
		$GLOBALS['wp_scripts'] = null;

		unset( $_GET['otter-woo-builder'], $_GET['_wpnonce'], $_GET['toggle-woobuilder'], $_GET['post'] );

		parent::tear_down();
	}

	/**
	 * The meta-boxes pane default is added for builder products only.
	 */
	public function test_meta_boxes_pane_default_added_for_builder_products() {
		$GLOBALS['post'] = get_post( $this->builder_product_id );

		$this->woo_builder->show_meta_boxes_pane();

		$inline = wp_scripts()->get_data( 'wp-edit-post', 'after' );

		$this->assertNotEmpty( $inline );
		$this->assertStringContainsString( 'metaBoxesMainIsOpen', implode( '', $inline ) );
	}

	/**
	 * No inline default for products without the builder or non-product posts.
	 */
	public function test_meta_boxes_pane_default_skipped_otherwise() {
		$GLOBALS['post'] = get_post( $this->plain_product_id );
		$this->woo_builder->show_meta_boxes_pane();

		$GLOBALS['post'] = get_post( self::factory()->post->create() );
		$this->woo_builder->show_meta_boxes_pane();

		$this->assertFalse( wp_scripts()->get_data( 'wp-edit-post', 'after' ) );
	}

	/**
	 * On builder products, Product data stranded in "side" moves back to "normal".
	 */
	public function test_product_data_rescued_from_side_on_builder_products() {
		$GLOBALS['post'] = get_post( $this->builder_product_id );

		$order = $this->woo_builder->restore_product_data_location( $this->stranded_order );

		$this->assertStringNotContainsString( 'woocommerce-product-data', $order['side'] );
		$this->assertSame( 'woocommerce-product-data', explode( ',', $order['normal'] )[0] );
		$this->assertSame( 'otter_woo_builder,woocommerce-product-images', $order['side'] );
	}

	/**
	 * Non-builder products keep whatever layout the user saved.
	 */
	public function test_saved_order_untouched_without_builder() {
		$GLOBALS['post'] = get_post( $this->plain_product_id );

		$this->assertSame( $this->stranded_order, $this->woo_builder->restore_product_data_location( $this->stranded_order ) );
	}

	/**
	 * Orders that never stranded Product data pass through unchanged.
	 */
	public function test_clean_order_passes_through() {
		$GLOBALS['post'] = get_post( $this->builder_product_id );

		$clean = array(
			'normal' => 'woocommerce-product-data',
			'side'   => 'otter_woo_builder',
		);

		$this->assertSame( $clean, $this->woo_builder->restore_product_data_location( $clean ) );
		$this->assertFalse( $this->woo_builder->restore_product_data_location( false ) );
	}

	/**
	 * Load the edit screen of a product with the builder toggle in the query.
	 *
	 * @param int  $post_id    Product ID.
	 * @param int  $value      Toggle value.
	 * @param bool $with_nonce Whether to add a valid nonce.
	 * @return bool The filter result.
	 */
	protected function toggle_builder( $post_id, $value, $with_nonce ) {
		$GLOBALS['post']          = get_post( $post_id );
		$_GET['post']              = $post_id;
		$_GET['otter-woo-builder'] = $value;

		if ( $with_nonce ) {
			$_GET['_wpnonce'] = wp_create_nonce( 'otter_woo_builder' );
		}

		return $this->woo_builder->enable_block_editor( false, 'product' );
	}

	/**
	 * Log in a user who can edit any product.
	 *
	 * WooCommerce adds the product capabilities to the administrator role on
	 * install, which does not run on a fresh test database. Grant them here.
	 */
	protected function log_in_product_editor() {
		$user = get_userdata( self::factory()->user->create( array( 'role' => 'administrator' ) ) );

		foreach ( array( 'edit_products', 'edit_others_products', 'edit_published_products', 'edit_private_products' ) as $capability ) {
			$user->add_cap( $capability );
		}

		wp_set_current_user( $user->ID );
	}

	/**
	 * Get the nonce from the toggle link of the metabox.
	 *
	 * @param int $post_id Product ID shown in the metabox.
	 * @return string
	 */
	protected function get_metabox_nonce( $post_id ) {
		$GLOBALS['post'] = get_post( $post_id );

		ob_start();
		$this->woo_builder->render_metabox( 'product' );
		$html = ob_get_clean();

		preg_match( '/_wpnonce=([a-f0-9]+)/', $html, $matches );

		return $matches[1];
	}

	/**
	 * Create a product with block content and the builder enabled.
	 *
	 * @return int
	 */
	protected function create_block_product() {
		$post_id = self::factory()->post->create(
			array(
				'post_type'    => 'product',
				'post_content' => '<!-- wp:paragraph --><p>Layout</p><!-- /wp:paragraph -->',
			)
		);
		update_post_meta( $post_id, '_themeisle_gutenberg_woo_builder', true );

		return $post_id;
	}

	/**
	 * Disabling the builder without a nonce keeps content and meta.
	 */
	public function test_disable_builder_without_nonce_keeps_data() {
		$this->log_in_product_editor();
		$post_id = $this->create_block_product();
		$content = get_post_field( 'post_content', $post_id );

		$this->assertTrue( $this->toggle_builder( $post_id, 0, false ) );
		$this->assertSame( $content, get_post_field( 'post_content', $post_id ) );
		$this->assertTrue( boolval( get_post_meta( $post_id, '_themeisle_gutenberg_woo_builder', true ) ) );
	}

	/**
	 * Disabling the builder with a valid nonce and capability clears content and meta.
	 */
	public function test_disable_builder_with_nonce_clears_data() {
		$this->log_in_product_editor();
		$post_id = $this->create_block_product();

		$this->assertFalse( $this->toggle_builder( $post_id, 0, true ) );
		$this->assertSame( '', get_post_field( 'post_content', $post_id ) );
		$this->assertSame( '', get_post_meta( $post_id, '_themeisle_gutenberg_woo_builder', true ) );
	}

	/**
	 * A valid nonce is not enough without the edit capability.
	 */
	public function test_disable_builder_requires_edit_capability() {
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'subscriber' ) ) );
		$post_id = $this->create_block_product();
		$content = get_post_field( 'post_content', $post_id );

		$this->toggle_builder( $post_id, 0, true );

		$this->assertSame( $content, get_post_field( 'post_content', $post_id ) );
		$this->assertTrue( boolval( get_post_meta( $post_id, '_themeisle_gutenberg_woo_builder', true ) ) );
	}

	/**
	 * Enabling the builder without a nonce does not set the meta.
	 */
	public function test_enable_builder_without_nonce_does_not_set_meta() {
		$this->log_in_product_editor();

		$this->assertFalse( $this->toggle_builder( $this->plain_product_id, 1, false ) );
		$this->assertSame( '', get_post_meta( $this->plain_product_id, '_themeisle_gutenberg_woo_builder', true ) );
	}

	/**
	 * Enabling the builder with a valid nonce sets the meta.
	 */
	public function test_enable_builder_with_nonce_sets_meta() {
		$this->log_in_product_editor();

		$this->assertTrue( $this->toggle_builder( $this->plain_product_id, 1, true ) );
		$this->assertTrue( boolval( get_post_meta( $this->plain_product_id, '_themeisle_gutenberg_woo_builder', true ) ) );
	}

	/**
	 * The metabox toggle link carries a nonce for the product.
	 */
	public function test_metabox_link_has_nonce() {
		$GLOBALS['post'] = get_post( $this->builder_product_id );

		ob_start();
		$this->woo_builder->render_metabox( 'product' );
		$html = ob_get_clean();

		$this->assertMatchesRegularExpression( '/otter-woo-builder=0[^"]*_wpnonce=/', $html );
	}

	/**
	 * The product in the edit screen URL is toggled, even if the global post differs.
	 */
	public function test_toggle_uses_product_from_edit_url() {
		$this->log_in_product_editor();
		$other_id = self::factory()->post->create( array( 'post_type' => 'product' ) );

		$_GET['post']              = $this->plain_product_id;
		$_GET['otter-woo-builder'] = 1;
		$_GET['_wpnonce']          = $this->get_metabox_nonce( $this->plain_product_id );
		$GLOBALS['post']           = get_post( $other_id );

		$this->assertTrue( $this->woo_builder->enable_block_editor( false, 'product' ) );
		$this->assertTrue( boolval( get_post_meta( $this->plain_product_id, '_themeisle_gutenberg_woo_builder', true ) ) );
		$this->assertSame( '', get_post_meta( $other_id, '_themeisle_gutenberg_woo_builder', true ) );
	}

	/**
	 * On the new product screen, the link opens a new draft without a `post` query arg.
	 */
	public function test_enable_builder_from_new_product_screen() {
		$this->log_in_product_editor();
		$first_draft = self::factory()->post->create( array( 'post_type' => 'product', 'post_status' => 'auto-draft' ) );
		$next_draft  = self::factory()->post->create( array( 'post_type' => 'product', 'post_status' => 'auto-draft' ) );

		$_GET['otter-woo-builder'] = 1;
		$_GET['_wpnonce']          = $this->get_metabox_nonce( $first_draft );
		$GLOBALS['post']           = get_post( $next_draft );

		$this->assertTrue( $this->woo_builder->enable_block_editor( false, 'product' ) );
		$this->assertTrue( boolval( get_post_meta( $next_draft, '_themeisle_gutenberg_woo_builder', true ) ) );
	}

	/**
	 * The toggle does not change posts that are not products.
	 */
	public function test_toggle_ignores_non_product_post() {
		$this->log_in_product_editor();
		$page_id = self::factory()->post->create(
			array(
				'post_type'    => 'page',
				'post_content' => '<!-- wp:paragraph --><p>Page</p><!-- /wp:paragraph -->',
			)
		);
		$content = get_post_field( 'post_content', $page_id );

		$this->toggle_builder( $page_id, 0, true );

		$this->assertSame( $content, get_post_field( 'post_content', $page_id ) );
	}

	/**
	 * A nonce for another action does not toggle the builder.
	 */
	public function test_enable_builder_with_invalid_nonce_does_not_set_meta() {
		$this->log_in_product_editor();

		$_GET['post']              = $this->plain_product_id;
		$_GET['otter-woo-builder'] = 1;
		$_GET['_wpnonce']          = wp_create_nonce( 'other_action' );
		$GLOBALS['post']           = get_post( $this->plain_product_id );

		$this->assertFalse( $this->woo_builder->enable_block_editor( false, 'product' ) );
		$this->assertSame( '', get_post_meta( $this->plain_product_id, '_themeisle_gutenberg_woo_builder', true ) );
	}

	/**
	 * A `post` arg that is not an ID does not toggle the builder.
	 */
	public function test_toggle_ignores_invalid_post_arg() {
		$this->log_in_product_editor();

		$_GET['post']              = 'abc';
		$_GET['otter-woo-builder'] = 1;
		$_GET['_wpnonce']          = wp_create_nonce( 'otter_woo_builder' );
		$GLOBALS['post']           = get_post( $this->plain_product_id );

		$this->assertFalse( $this->woo_builder->enable_block_editor( false, 'product' ) );
	}
}
