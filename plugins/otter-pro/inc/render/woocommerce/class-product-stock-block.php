<?php
/**
 * Product_Stock_Block
 *
 * @package ThemeIsle\OtterPro\Render
 */

namespace ThemeIsle\OtterPro\Render\WooCommerce;

/**
 * Class Product_Stock_Block
 */
class Product_Stock_Block {

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

		global $product;

		if ( ! $product ) {
			return;
		};
		$output = wc_get_stock_html( $product );

		if ( empty( $output ) ) {
			$output = __( 'Your product stock will display here.', 'otter-blocks' );
		}
		return $output;
	}
}
