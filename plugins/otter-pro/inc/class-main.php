<?php
/**
 * Class for Otter Pro logic.
 *
 * @package ThemeIsle
 */

namespace ThemeIsle\Otter_Pro;

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
		if ( ! defined( 'OTTER_PRO_URL' ) ) {
			define( 'OTTER_PRO_URL', OTTER_BLOCKS_URL . 'plugins/otter-pro/' );
			define( 'OTTER_PRO_PATH', OTTER_BLOCKS_PATH . 'plugins/otter-pro/' );
		}

		add_action( 'themeisle_blocks_autoloader', array( $this, 'autoload_classes' ) );
		add_action( 'themeisle_blocks_register_blocks', array( $this, 'register_blocks' ) );
		add_action( 'themeisle_blocks_register_dynamic_blocks', array( $this, 'register_dynamic_blocks' ) );
	}

	/**
	 * Autoload classes.
	 *
	 * @since   2.0.1
	 * @access  public
	 */
	public function autoload_classes( $classnames ) {
		$classes = array(
			'\ThemeIsle\Otter_Pro\Plugins\WooCommerce_Builder'
		);

		$classnames = array_merge( $classnames, $classes );

		return $classnames;
	}

	/**
	 * Register Dynamic Blocks.
	 *
	 * @since   2.0.1
	 * @access  public
	 */
	public function register_dynamic_blocks( $dynamic_blocks ) {
		$blocks = array(
			'product-add-to-cart'       => '\ThemeIsle\Otter_Pro\Render\Product_Add_To_Cart_Block',
			'product-images'            => '\ThemeIsle\Otter_Pro\Render\Product_Images_Block',
			'product-meta'              => '\ThemeIsle\Otter_Pro\Render\Product_Meta_Block',
			'product-price'             => '\ThemeIsle\Otter_Pro\Render\Product_Price_Block',
			'product-rating'            => '\ThemeIsle\Otter_Pro\Render\Product_Rating_Block',
			'product-related-products'  => '\ThemeIsle\Otter_Pro\Render\Product_Related_Products_Block',
			'product-short-description' => '\ThemeIsle\Otter_Pro\Render\Product_Short_Description_Block',
			'product-stock'             => '\ThemeIsle\Otter_Pro\Render\Product_Stock_Block',
			'product-tabs'              => '\ThemeIsle\Otter_Pro\Render\Product_Tabs_Block',
			'product-title'             => '\ThemeIsle\Otter_Pro\Render\Product_Title_Block',
			'product-upsells'           => '\ThemeIsle\Otter_Pro\Render\Product_Upsells_Block',
		);

		$dynamic_blocks = array_merge( $dynamic_blocks, $blocks );

		return $dynamic_blocks;
	}

	/**
	 * Register Blocks.
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
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.0.0
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
	 * @since 1.0.0
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
	 * @since 1.0.0
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}
}
