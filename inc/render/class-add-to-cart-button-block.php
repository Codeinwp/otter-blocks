<?php
/**
 * Add_To_Cart_Button_Block
 *
 * @package ThemeIsle\GutenbergBlocks\Render
 */

namespace ThemeIsle\GutenbergBlocks\Render;

/**
 * Class Add_To_Cart_Button_Block
 */
class Add_To_Cart_Button_Block {

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
		if ( ! 'valid' === apply_filters( 'product_neve_license_status', false ) || ! class_exists( 'WooCommerce' ) || ! isset( $attributes['product'] ) ) {
			return;
		}

		$product = wc_get_product( $attributes['product'] );

		if ( ! $product ) {
			return;
		}

		$attrs = array(
			'aria-label'       => $product->add_to_cart_description(),
			'data-quantity'    => '1',
			'data-product_id'  => $product->get_id(),
			'data-product_sku' => $product->get_sku(),
			'rel'              => 'nofollow',
			'class'            => 'wp-block-button__link add_to_cart_button',
		);

		if (
			$product->supports( 'ajax_add_to_cart' ) &&
			$product->is_purchasable() &&
			( $product->is_in_stock() || $product->backorders_allowed() )
		) {
			$attrs['class'] .= ' ajax_add_to_cart';
		}

		$button = sprintf(
			'<a href="%s" %s>%s</a>',
			esc_url( $product->add_to_cart_url() ),
			wc_implode_html_attributes( $attrs ),
			esc_html( $product->add_to_cart_text() )
		);

		return sprintf(
			'<div %1$s>%2$s</div>',
			$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'wp-block-button' ) ),
			$button
		);
	}
}
