<?php
/**
 * Class for Otter Pro logic.
 *
 * @package ThemeIsle
 */

namespace ThemeIsle\OtterPro;

use ThemeIsle\OtterPro\Plugins\License;

/**
 * Class Main
 */
class Main {

	/**
	 * The main instance var.
	 *
	 * @var Main|null
	 */
	public static $instance = null;

	/**
	 * Initialize the class
	 */
	public function init() {
		if ( ! defined( 'OTTER_PRO_VERSION' ) ) {
			define( 'OTTER_PRO_VERSION', OTTER_BLOCKS_VERSION );
			define( 'OTTER_PRO_URL', OTTER_BLOCKS_URL . 'plugins/otter-pro/' );
			define( 'OTTER_PRO_PATH', OTTER_BLOCKS_PATH . '/plugins/otter-pro' );
			define( 'OTTER_PRO_BASEFILE', OTTER_PRO_PATH . '/otter-pro.php' );
			define( 'OTTER_PRO_BUILD_URL', OTTER_BLOCKS_URL . 'build/pro/' );
			define( 'OTTER_PRO_BUILD_PATH', OTTER_BLOCKS_PATH . '/build/pro/' );
		}

		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_block_editor_assets' ) );
		add_filter( 'otter_blocks_autoloader', array( $this, 'autoload_classes' ) );

		if ( License::has_active_license() ) {
			add_filter( 'otter_blocks_register_blocks', array( $this, 'register_blocks' ) );
			add_filter( 'otter_blocks_register_dynamic_blocks', array( $this, 'register_dynamic_blocks' ) );
			add_filter( 'otter_blocks_register_css', array( $this, 'register_blocks_css' ) );
			add_action( 'admin_print_scripts-toplevel_page_otter', array( $this, 'enqueue_options_assets' ) );
		}
	}

	/**
	 * Autoload classes.
	 *
	 * @param array $classnames Block Classnames.
	 *
	 * @since   2.0.1
	 * @access  public
	 */
	public function autoload_classes( $classnames ) {
		$classes = array(
			'\ThemeIsle\OtterPro\Plugins\Block_Conditions',
			'\ThemeIsle\OtterPro\Plugins\Dynamic_Content',
			'\ThemeIsle\OtterPro\Plugins\Fonts_Module',
			'\ThemeIsle\OtterPro\Plugins\Form_Pro_Features',
			'\ThemeIsle\OtterPro\Plugins\Form_Emails_Storing',
			'\ThemeIsle\OtterPro\Plugins\License',
			'\ThemeIsle\OtterPro\Plugins\Live_Search',
			'\ThemeIsle\OtterPro\Plugins\Options_Settings',
			'\ThemeIsle\OtterPro\Plugins\Patterns',
			'\ThemeIsle\OtterPro\Plugins\Posts_ACF_Integration',
			'\ThemeIsle\OtterPro\Plugins\Review_Woo_Integration',
			'\ThemeIsle\OtterPro\Plugins\WooCommerce_Builder',
			'\ThemeIsle\OtterPro\Plugins\Stripe_Pro_Features',
			'\ThemeIsle\OtterPro\Server\Dashboard_Server',
			'\ThemeIsle\OtterPro\Server\Filter_Blocks_Server',
			'\ThemeIsle\OtterPro\Server\Live_Search_Server',
			'\ThemeIsle\OtterPro\Server\Posts_ACF_Server',
		);

		$classnames = array_merge( $classnames, $classes );

		return $classnames;
	}

	/**
	 * Register Blocks.
	 *
	 * @param array $blocks Blocks List.
	 *
	 * @since   2.0.1
	 * @access  public
	 */
	public function register_blocks( $blocks ) {
		$pro_blocks = array(
			'add-to-cart-button',
			'business-hours',
			'business-hours-item',
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
			'review-comparison',
			'form-file',
			'form-hidden-field',
			'form-stripe-field',
		);

		$blocks = array_merge( $blocks, $pro_blocks );

		return $blocks;
	}

	/**
	 * Register Dynamic Blocks.
	 *
	 * @param array $dynamic_blocks Dynamic Blocks.
	 *
	 * @since   2.0.1
	 * @access  public
	 */
	public function register_dynamic_blocks( $dynamic_blocks ) {
		$blocks = array(
			'add-to-cart-button'        => '\ThemeIsle\OtterPro\Render\Add_To_Cart_Button_Block',
			'product-add-to-cart'       => '\ThemeIsle\OtterPro\Render\WooCommerce\Product_Add_To_Cart_Block',
			'product-images'            => '\ThemeIsle\OtterPro\Render\WooCommerce\Product_Images_Block',
			'product-meta'              => '\ThemeIsle\OtterPro\Render\WooCommerce\Product_Meta_Block',
			'product-price'             => '\ThemeIsle\OtterPro\Render\WooCommerce\Product_Price_Block',
			'product-rating'            => '\ThemeIsle\OtterPro\Render\WooCommerce\Product_Rating_Block',
			'product-related-products'  => '\ThemeIsle\OtterPro\Render\WooCommerce\Product_Related_Products_Block',
			'product-short-description' => '\ThemeIsle\OtterPro\Render\WooCommerce\Product_Short_Description_Block',
			'product-stock'             => '\ThemeIsle\OtterPro\Render\WooCommerce\Product_Stock_Block',
			'product-tabs'              => '\ThemeIsle\OtterPro\Render\WooCommerce\Product_Tabs_Block',
			'product-title'             => '\ThemeIsle\OtterPro\Render\WooCommerce\Product_Title_Block',
			'product-upsells'           => '\ThemeIsle\OtterPro\Render\WooCommerce\Product_Upsells_Block',
			'review-comparison'         => '\ThemeIsle\OtterPro\Render\Review_Comparison_Block',
			'form-file'                 => '\ThemeIsle\OtterPro\Render\Form_File_Block',
			'form-hidden-field'         => '\ThemeIsle\OtterPro\Render\Form_Hidden_Block',
			'form-stripe-field'         => '\ThemeIsle\OtterPro\Render\Form_Stripe_Block',
			'modal'                     => '\ThemeIsle\OtterPro\Render\Modal_Block',
		);

		$dynamic_blocks = array_merge( $dynamic_blocks, $blocks );

		return $dynamic_blocks;
	}

	/**
	 * Register Blocks CSS.
	 *
	 * @param array $blocks Blocks List.
	 *
	 * @since   2.0.1
	 * @access  public
	 */
	public function register_blocks_css( $blocks ) {
		$pro_blocks = array(
			'\ThemeIsle\OtterPro\CSS\Blocks\Business_Hours_CSS',
			'\ThemeIsle\OtterPro\CSS\Blocks\Business_Hours_Item_CSS',
			'\ThemeIsle\OtterPro\CSS\Blocks\Review_Comparison_CSS',
			'\ThemeIsle\OtterPro\CSS\Blocks\Form_File_CSS',
			'\ThemeIsle\OtterPro\CSS\Blocks\Form_Stripe_Field_CSS',
			'\ThemeIsle\OtterPro\CSS\Blocks\Modal_CSS',
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

		wp_set_script_translations( 'otter-pro', 'otter-pro' );

		wp_localize_script(
			'otter-pro',
			'otterPro',
			array(
				'isActive'       => License::has_active_license(),
				'isExpired'      => License::has_expired_license(),
				'licenseType'    => License::get_license_type(),
				'hasNeveLicense' => ( License::has_active_license() && isset( License::get_license_data()->otter_pro ) ) ? true : false,
				'hasWooCommerce' => class_exists( 'WooCommerce' ),
				'hasLearnDash'   => defined( 'LEARNDASH_VERSION' ),
				'hasACF'         => class_exists( 'ACF' ),
				'rootUrl'        => get_site_url(),
				'hasIPHubAPI'    => empty( get_option( 'otter_iphub_api_key', '' ) ) ? false : true,
			)
		);

		global $pagenow;

		if ( class_exists( 'WooCommerce' ) && ( 'post.php' === $pagenow || 'post-new.php' === $pagenow ) && ( ( isset( $_GET['post'] ) && 'product' === get_post_type( intval( $_GET['post'] ) ) ) || ( isset( $_GET['post_type'] ) && 'product' === sanitize_text_field( $_GET['post_type'] ) ) ) ) { // phpcs:ignore WordPress.Security.NonceVerification.NoNonceVerification
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
	 * Load assets for option page.
	 *
	 * @since   2.0.5
	 * @access  public
	 */
	public function enqueue_options_assets() {
		$asset_file = include OTTER_PRO_BUILD_PATH . 'dashboard.asset.php';

		wp_enqueue_script(
			'otter-dashboard-scripts',
			OTTER_PRO_BUILD_URL . 'dashboard.js',
			array_merge(
				$asset_file['dependencies'],
				array( 'otter-blocks-scripts' )
			),
			$asset_file['version'],
			true
		);
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
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-pro' ), '1.0.0' );
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
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-pro' ), '1.0.0' );
	}
}
