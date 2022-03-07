<?php
/**
 * Class for Otter Pro logic.
 *
 * @package ThemeIsle
 */

namespace ThemeIsle\OtterPro;

/**
 * Class Main
 */
class Main {

	/**
	 * The main instance var.
	 *
	 * @var Main
	 */
	public static $instance = null;

	/**
	 * Initialize the class
	 */
	public function init() {
		if ( ! defined( 'OTTER_PRO_VERSION' ) ) {
			define( 'OTTER_PRO_URL', OTTER_BLOCKS_URL . 'plugins/otter-pro/' );
			define( 'OTTER_PRO_PATH', OTTER_BLOCKS_PATH . '/plugins/otter-pro/' );
			define( 'OTTER_PRO_BUILD_URL', OTTER_BLOCKS_URL . 'build/pro/' );
			define( 'OTTER_PRO_BUILD_PATH', OTTER_BLOCKS_PATH . '/build/pro/' );
			define( 'OTTER_PRO_VERSION', OTTER_BLOCKS_VERSION );
		}

		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_block_editor_assets' ) );
		add_action( 'enqueue_block_assets', array( $this, 'enqueue_block_assets' ) );
		add_filter( 'otter_blocks_autoloader', array( $this, 'autoload_classes' ) );
		add_filter( 'otter_blocks_register_blocks', array( $this, 'register_blocks' ) );
		add_filter( 'otter_blocks_register_dynamic_blocks', array( $this, 'register_dynamic_blocks' ) );
		add_filter( 'otter_blocks_register_css', array( $this, 'register_blocks_css' ) );
	}

	/**
	 * Autoload classes.
	 *
	 * @param string $classnames Block Classnames.
	 * 
	 * @since   2.0.1
	 * @access  public
	 */
	public function autoload_classes( $classnames ) {
		$classes = array(
			'\ThemeIsle\OtterPro\Plugins\Review_Woo_Integration',
			'\ThemeIsle\OtterPro\Plugins\WooCommerce_Builder',
			'\ThemeIsle\OtterPro\Server\Filter_Blocks_Server',
		);

		$classnames = array_merge( $classnames, $classes );

		return $classnames;
	}

	/**
	 * Register Blocks.
	 *
	 * @param string $blocks Blocks List.
	 * 
	 * @since   2.0.1
	 * @access  public
	 */
	public function register_blocks( $blocks ) {
		$pro_blocks = array(
			'product-add-to-cart',
			'product-images',
			'product-meta',
			'product-price',
			'product-rating',
			'product-related-products',
			'product-short-description',
			'product-stock',
			'product-tabs',
			'product-title',
			'product-upsells',
		);

		$blocks = array_merge( $blocks, $pro_blocks );

		return $blocks;
	}

	/**
	 * Register Dynamic Blocks.
	 *
	 * @param string $dynamic_blocks Dynamic Blocks.
	 * 
	 * @since   2.0.1
	 * @access  public
	 */
	public function register_dynamic_blocks( $dynamic_blocks ) {
		$blocks = array(
			'add-to-cart-button'        => '\ThemeIsle\OtterPro\Render\Add_To_Cart_Button_Block',
			'review-comparison'         => '\ThemeIsle\OtterPro\Render\Review_Comparison_Block',
			'product-add-to-cart'       => '\ThemeIsle\OtterPro\Render\Product_Add_To_Cart_Block',
			'product-images'            => '\ThemeIsle\OtterPro\Render\Product_Images_Block',
			'product-meta'              => '\ThemeIsle\OtterPro\Render\Product_Meta_Block',
			'product-price'             => '\ThemeIsle\OtterPro\Render\Product_Price_Block',
			'product-rating'            => '\ThemeIsle\OtterPro\Render\Product_Rating_Block',
			'product-related-products'  => '\ThemeIsle\OtterPro\Render\Product_Related_Products_Block',
			'product-short-description' => '\ThemeIsle\OtterPro\Render\Product_Short_Description_Block',
			'product-stock'             => '\ThemeIsle\OtterPro\Render\Product_Stock_Block',
			'product-tabs'              => '\ThemeIsle\OtterPro\Render\Product_Tabs_Block',
			'product-title'             => '\ThemeIsle\OtterPro\Render\Product_Title_Block',
			'product-upsells'           => '\ThemeIsle\OtterPro\Render\Product_Upsells_Block',
		);

		$dynamic_blocks = array_merge( $dynamic_blocks, $blocks );

		return $dynamic_blocks;
	}

	/**
	 * Register Blocks CSS.
	 *
	 * @param string $blocks Blocks List.
	 * 
	 * @since   2.0.1
	 * @access  public
	 */
	public function register_blocks_css( $blocks ) {
		$pro_blocks = array(
			'\ThemeIsle\OtterPro\CSS\Blocks\Business_Hours_CSS',
			'\ThemeIsle\OtterPro\CSS\Blocks\Business_Hours_Item_CSS',
			'\ThemeIsle\OtterPro\CSS\Blocks\Review_Comparison_CSS',
		);

		$blocks = array_merge( $blocks, $pro_blocks );

		return $blocks;
	}

	/**
	 * Autoload classes.
	 *
	 * @since   2.0.1
	 * @access  public
	 */
	public function enqueue_block_editor_assets() {
		$asset_file = include OTTER_PRO_BUILD_PATH . 'blocks.asset.php';

		wp_enqueue_script(
			'otter-pro',
			OTTER_PRO_BUILD_URL . 'blocks.js',
			array_merge(
				$asset_file['dependencies'],
				array( 'otter-blocks' )
			),
			$asset_file['version'],
			true
		);

		wp_localize_script(
			'otter-pro',
			'otterPro',
			array(
				'hasWooCommerce' => class_exists( 'WooCommerce' ),
			)
		);

		wp_enqueue_style( 'otter-pro-editor', OTTER_PRO_BUILD_URL . 'editor.css', array( 'wp-edit-blocks' ), $asset_file['version'] );

		global $pagenow;

		if ( class_exists( 'WooCommerce' ) && ( 'post.php' === $pagenow || 'post-new.php' === $pagenow ) && ( ( isset( $_GET['post'] ) && 'product' === get_post_type( sanitize_text_field( $_GET['post'] ) ) ) || ( isset( $_GET['post_type'] ) && 'product' === sanitize_text_field( $_GET['post_type'] ) ) ) ) { // phpcs:ignore WordPress.Security.NonceVerification.NoNonceVerification
			$asset_file = include OTTER_PRO_BUILD_PATH . 'woocommerce.asset.php';

			wp_enqueue_script(
				'otter-blocks-woocommerce',
				OTTER_PRO_BUILD_URL . 'woocommerce.js',
				$asset_file['dependencies'],
				$asset_file['version'],
				true
			);
		}
	}

	/**
	 * Load frontend assets for our blocks.
	 *
	 * @since   2.0.1
	 * @access  public
	 */
	public function enqueue_block_assets() {
		if ( is_admin() ) {
			return;
		}

		$asset_file = include OTTER_PRO_BUILD_PATH . 'blocks.asset.php';
		wp_enqueue_style( 'otter-pro', OTTER_PRO_BUILD_URL . 'blocks.css', [], $asset_file['version'] );
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 2.0.1
	 * @access public
	 * @return Main
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
	 * @since 2.0.1
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
	 * @since 2.0.1
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}
}
