<?php
/**
 * Product_Tabs_Block
 *
 * @package ThemeIsle\GutenbergBlocks\Render
 */

namespace ThemeIsle\GutenbergBlocks\Render;

/**
 * Class Product_Tabs_Block
 */
class Product_Tabs_Block {

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
		if ( ! 'valid' === apply_filters( 'product_neve_license_status', false ) || ! class_exists( 'WooCommerce' ) ) {
			return;
		}

		ob_start();

		global $product;

		if ( ! $product ) {
			return;
		};

		add_filter(
			'woocommerce_product_tabs',
			function( $tabs ) {
				unset( $tabs['description'] );
				return $tabs;
			} 
		);

		woocommerce_output_product_data_tabs();
		$output = ob_get_clean();
		return $output;
	}
}
