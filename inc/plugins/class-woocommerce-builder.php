<?php
/**
 * WooCommerce Builder.
 *
 * @package ThemeIsle\GutenbergBlocks\Plugins
 */

namespace ThemeIsle\GutenbergBlocks\Plugins;

/**
 * Class WooCommerce_Builder
 */
class WooCommerce_Builder {

	/**
	 * The main instance var.
	 *
	 * @var WooCommerce_Builder
	 */
	protected static $instance = null;

	/**
	 * Initialize the class
	 */
	public function init() {
		add_action( 'add_meta_boxes', array( $this, 'register_metabox' ) );
		add_filter( 'use_block_editor_for_post_type', array( $this, 'enable_block_editor' ), 11, 2 );
		add_filter( 'wc_get_template_part', array( $this, 'wc_get_template_part' ), 1000, 3 );
		add_action( 'themeisle_gutenberg_woocommerce_content', 'the_content' );
		add_filter( 'body_class', array( $this, 'add_body_class' ), 1000, 1 );
	}

	/**
	 * Register Metabox
	 * 
	 * @param string $post_type Post type.
	 *
	 * @since   2.0.0
	 * @access  public
	 */
	public function register_metabox( $post_type ) {
		if ( defined( 'NEVE_VERSION' ) && 'valid' === apply_filters( 'product_neve_license_status', false ) ) {
			add_meta_box(
				'otter_woo_builder',
				__( 'WooCommerce Builder by Otter', 'otter-blocks' ),
				array( $this, 'render_metabox' ),
				'product',
				'side',
				'high'
			);
		}

		if ( defined( 'NEVE_VERSION' ) && ! 'valid' === apply_filters( 'product_neve_license_status', false ) ) {
			add_meta_box(
				'otter_woo_builder',
				__( 'WooCommerce Builder by Otter', 'otter-blocks' ),
				array( $this, 'render_metabox_upsell' ),
				'product',
				'side',
				'high'
			);
		}
	}

	/**
	 * Render Metabox
	 * 
	 * @param string $post_type Post type.
	 * 
	 * @since   2.0.0
	 * @access  public
	 */
	public function render_metabox( $post_type ) {
		$woo_builder_enabled = get_post_meta( get_the_ID(), '_themeisle_gutenberg_woo_builder', true );

		if ( boolval( $woo_builder_enabled ) ) {
			?>
			<div class="clear">
				<p><?php _e( 'You can go back to the regular editor from this option.', 'otter-blocks' ); ?></p>

				<a href="<?php echo esc_url( add_query_arg( 'otter-woo-builder', 0 ) ); ?>" class="button button-primary" id="otter-woo-builder">
					<?php _e( 'Disable WooCommerce Builder', 'otter-blocks' ); ?>
				</a>
			</div>
			<?php
		} else {
			?>
			<div class="clear">
				<p><?php _e( 'Use WooCommerce Builder by Otter to build a custom page for your WooCommerce products.', 'otter-blocks' ); ?></p>

				<a href="<?php echo esc_url( add_query_arg( 'otter-woo-builder', 1 ) ); ?>" class="button button-primary" id="otter-woo-builder">
					<?php _e( 'Enable WooCommerce Builder', 'otter-blocks' ); ?>
				</a>
			</div>
			<?php
		}
	}

	/**
	 * Render Metabox
	 * 
	 * @param string $post_type Post type.
	 * 
	 * @since   2.0.0
	 * @access  public
	 */
	public function render_metabox_upsell( $post_type ) {
		?>
		<div class="clear">
			<p><?php _e( 'Unlock the full power of WooCommerce Builder with Neve Pro\'s Block Editor Booster.', 'otter-blocks' ); ?></p>

			<a href="https://themeisle.com/themes/neve/pricing" target="_blank" class="button button-primary">
				<?php _e( 'Get Neve Pro', 'otter-blocks' ); ?>
			</a>
		</div>
		<?php
	}

	/**
	 * Enable the Block Editfor
	 * 
	 * @param bool   $can_edit Whether the post type can be edited or not.
	 * @param string $post_type Post type.
	 *
	 * @since   2.0.0
	 * @access  public
	 */
	public function enable_block_editor( $can_edit, $post_type ) {
		if ( isset( $_GET['otter-woo-builder'] ) && 'product' === $post_type ) { // phpcs:ignore WordPress.Security.NonceVerification.NoNonceVerification
			if ( ! boolval( $_GET['otter-woo-builder'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.NoNonceVerification
				$_GET['toggle-woobuilder'] = 0; // phpcs:ignore WordPress.Security.NonceVerification.NoNonceVerification
				$post_id                   = get_the_ID();

				if ( has_blocks( $post_id ) ) {
					$post = array(
						'ID'           => $post_id,
						'post_content' => '',
					);

					wp_update_post( $post );
				}

				delete_post_meta( $post_id, '_themeisle_gutenberg_woo_builder' );
			} else {
				update_post_meta( get_the_ID(), '_themeisle_gutenberg_woo_builder', rest_sanitize_boolean( $_GET['otter-woo-builder'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.NoNonceVerification, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
			}

			return rest_sanitize_boolean( $_GET['otter-woo-builder'] ); // phpcs:ignore WordPress.Security.NonceVerification.NoNonceVerification, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		}

		$woo_builder_enabled = get_post_meta( get_the_ID(), '_themeisle_gutenberg_woo_builder', true );

		return 'product' === $post_type ? boolval( $woo_builder_enabled ) : $can_edit;
	}

	/**
	 * Get Block Template
	 * 
	 * @param string $template Template path.
	 * @param string $slug Template slug.
	 * @param string $name Template name.
	 *
	 * @since   2.0.0
	 * @access  public
	 */
	public function wc_get_template_part( $template, $slug, $name ) {
		$woo_builder_enabled = get_post_meta( get_the_ID(), '_themeisle_gutenberg_woo_builder', true );

		if (
			'content' == $slug &&
			'single-product' == $name &&
			boolval( $woo_builder_enabled )
		) {

			if ( class_exists( '\Neve\Views\Product_Layout' ) && class_exists( '\Neve_Pro\Modules\Woocommerce_Booster\Views\Single_Product' ) ) {
				$single_product     = new \Neve_Pro\Modules\Woocommerce_Booster\Views\Single_Product();
				$product_layout     = new \Neve\Views\Product_Layout();
				$product_navigation = get_theme_mod( 'neve_enable_product_navigation', false );

				if ( $product_navigation ) {
					remove_action( 'woocommerce_before_single_product_summary', array( $single_product, 'render_product_navigation' ), 10 );
					add_action( 'woocommerce_before_single_product', array( $single_product, 'render_product_navigation' ), 10 );
				}

				remove_action( 'woocommerce_after_single_product_summary', array( $this, 'render_exclusive_products_section' ), 20 );
				add_action( 'woocommerce_after_single_product', array( $product_layout, 'render_exclusive_products_section' ), 20 );
			}

			return OTTER_BLOCKS_PATH . '/inc/render/woocommerce/tpl/content-single-product.php';
		}

		return $template;
	}

	/**
	 * Add Body Class
	 * 
	 * @param array $classes Body classes.
	 *
	 * @since   2.0.0
	 * @access  public
	 * @return  array
	 */
	public function add_body_class( $classes ) {
		$woo_builder_enabled = get_post_meta( get_the_ID(), '_themeisle_gutenberg_woo_builder', true );

		if ( boolval( $woo_builder_enabled ) ) {
			$classes[] = 'o-woocommerce-builder';
		}

		return $classes;
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 2.0.0
	 * @access public
	 * @return WooCommerce_Builder
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
			self::$instance->init();
		}

		return self::$instance;
	}

	/**
	 * Throw error on object clone
	 *
	 * The whole idea of the singleton design pattern is that there is a single
	 * object therefore, we don't want the object to be cloned.
	 *
	 * @access public
	 * @since 2.0.0
	 * @return void
	 */
	public function __clone() {
		// Cloning instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}

	/**
	 * Disable unserializing of the class
	 *
	 * @access public
	 * @since 2.0.0
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}
}
