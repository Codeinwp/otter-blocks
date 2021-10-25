<?php
/**
 * Add_To_Cart_Button_Block
 *
 * @package ThemeIsle\GutenbergBlocks\Render
 */

namespace ThemeIsle\GutenbergBlocks\Render;

use ThemeIsle\GutenbergBlocks\Base_Block;

/**
 * Class Add_To_Cart_Button_Block
 */
class Add_To_Cart_Button_Block extends Base_Block {

	/**
	 * Every block needs a slug, so we need to define one and assign it to the `$this->block_slug` property
	 *
	 * @return mixed
	 */
	protected function set_block_slug() {
		$this->block_slug = 'add-to-cart-button';
	}

	/**
	 * Set the attributes required on the server side.
	 *
	 * @return mixed
	 */
	protected function set_attributes() {
		$this->attributes = array(
			'className' => array(
				'type' => 'string',
			),
			'product'   => array(
				'type' => 'number',
			),
		);
	}

	/**
	 * Block render function for server-side.
	 *
	 * This method will pe passed to the render_callback parameter and it will output
	 * the server side output of the block.
	 *
	 * @param array $attributes Block attrs.
	 * @return mixed|string
	 */
	protected function render( $attributes ) {
		if ( ! 'valid' === apply_filters( 'product_neve_license_status', false ) || ! class_exists( 'WooCommerce' ) ) {
			return;
		}

		$product = wc_get_product( $attributes['product'] );

		if ( ! $product ) {
			return;
		}

		$class = isset( $attributes['className'] ) ? $attributes['className'] : '';
		$class = 'wp-block-button ' . esc_attr( $class );

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

		return '<div class="' . $class . '">' . $button . '</div>';
	}
}
