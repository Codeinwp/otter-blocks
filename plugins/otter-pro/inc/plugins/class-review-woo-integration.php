<?php
/**
 * Review Block WooCommerce Integration.
 *
 * @package ThemeIsle\OtterPro\Plugins
 */

namespace ThemeIsle\OtterPro\Plugins;

use ThemeIsle\OtterPro\Plugins\License;

/**
 * Class Review_Woo_Integration
 */
class Review_Woo_Integration {

	/**
	 * The main instance var.
	 *
	 * @var Review_Woo_Integration
	 */
	protected static $instance = null;

	/**
	 * Initialize the class
	 */
	public function init() {
		if ( License::has_active_license() ) {
			add_filter( 'otter_blocks_review_block_woocommerce', array( $this, 'apply_woo_data' ), 1 );
		}
	}

	/**
	 * Apply Woo Data
	 * 
	 * @param array $attributes Block Attributes.
	 *
	 * @since   2.0.1
	 * @access  public
	 */
	public function apply_woo_data( $attributes ) {
		$product = wc_get_product( $attributes['product'] );

		if ( ! $product ) {
			return $attributes;
		}

		$attributes['title']       = $product->get_name();
		$attributes['description'] = $product->get_short_description();
		$attributes['price']       = $product->get_regular_price() ? $product->get_regular_price() : $product->get_price();
		$attributes['currency']    = get_woocommerce_currency();

		if ( ! empty( $product->get_sale_price() ) && $attributes['price'] !== $product->get_sale_price() ) {
			$attributes['discounted'] = $product->get_sale_price();
		}

		$attributes['image'] = array(
			'id'  => $product->get_image_id(),
			'url' => wp_get_attachment_image_url( $product->get_image_id(), '' ),
			'alt' => get_post_meta( $product->get_image_id(), '_wp_attachment_image_alt', true ),
		);

		$attributes['links'] = array(
			array(
				'label'       => __( 'Buy Now', 'otter-blocks' ),
				'href'        => method_exists( $product, 'get_product_url' ) ? $product->get_product_url() : $product->get_permalink(),
				'isSponsored' => method_exists( $product, 'get_product_url' ),
			),
		);

		return $attributes;
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 2.0.1
	 * @access public
	 * @return Review_Woo_Integration
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
