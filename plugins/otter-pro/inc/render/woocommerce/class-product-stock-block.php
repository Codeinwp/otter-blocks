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


		$is_editor_preview = defined( 'REST_REQUEST' ) && REST_REQUEST;

		global $product;

		if ( ! $product ) {
			return $is_editor_preview ? __( 'Your product stock will display here.', 'otter-pro' ) : '';
		}

		$show_placeholder = $is_editor_preview || current_user_can( 'edit_post', $product->get_id() );

		$output = wc_get_stock_html( $product );

		if ( empty( $output ) && $show_placeholder ) {
			$output = __( 'Your product stock will display here.', 'otter-pro' );
		}
		return $output;
	}
}
