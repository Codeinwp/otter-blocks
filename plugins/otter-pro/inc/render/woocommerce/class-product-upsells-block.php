<?php
/**
 * Product_Upsells_Block
 *
 * @package ThemeIsle\OtterPro\Render
 */

namespace ThemeIsle\OtterPro\Render\WooCommerce;

/**
 * Class Product_Upsells_Block
 */
class Product_Upsells_Block {

	/**
	 * Block render function for server-side.
	 *
	 * This method will pe passed to the render_callback parameter and it will output
	 * the server side output of the block.
	 *
	 * @param array $attributes Block attrs.
	 * @return mixed|string
	 */
	public function render( $attributes ) {
		if ( ! class_exists( 'WooCommerce' ) || is_admin() ) {
			return;
		}

		ob_start();

		global $product;

		if ( ! $product ) {
			return;
		};
		woocommerce_upsell_display();
		$output = ob_get_clean();
		return $output;
	}
}
