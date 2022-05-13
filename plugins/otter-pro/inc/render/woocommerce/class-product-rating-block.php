<?php
/**
 * Product_Rating_Block
 *
 * @package ThemeIsle\OtterPro\Render
 */

namespace ThemeIsle\OtterPro\Render\WooCommerce;

/**
 * Class Product_Rating_Block
 */
class Product_Rating_Block {

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
		if ( ! class_exists( 'WooCommerce' ) ) {
			return;
		}

		ob_start();

		global $product;

		if ( ! $product ) {
			return;
		};
		woocommerce_template_single_rating();
		$output = ob_get_clean();

		if ( empty( $output ) ) {
			$output = __( 'Your product ratings will display here.', 'otter-blocks' );
		}
		return $output;
	}
}
