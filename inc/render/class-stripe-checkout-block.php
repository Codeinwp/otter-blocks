<?php
/**
 * Stripe_Checkout_Block
 *
 * @package ThemeIsle\GutenbergBlocks\Render
 */

namespace ThemeIsle\GutenbergBlocks\Render;

use ThemeIsle\GutenbergBlocks\Plugins\Stripe_API;

use ThemeIsle\GutenbergBlocks\Render\Review_Block;

/**
 * Class Stripe_Checkout_Block
 */
class Stripe_Checkout_Block {

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
		if ( ! isset( $attributes['product'] ) || ! isset( $attributes['price'] ) ) {
			return '';
		}

		$stripe = new Stripe_API();

		$product = $stripe->create_request(
			'product',
			$attributes['product']
		);

		$details_markup = '';

		if ( 0 < count( $product['images'] ) ) {
			$details_markup .= '<img src="' . $product['images'][0] . '" alt="' . $product['description'] . '" />';
		}

		$price = $stripe->create_request(
			'price',
			$attributes['price']
		);

		$currency = Review_Block::get_currency( $price['currency'] );
		$amount   = number_format( $price['unit_amount'] / 100, 2, '.', ' ' );

		$details_markup .= '<div class="o-stripe-checkout-description">';
		$details_markup .= '<h3>' . $product['name'] . '</h3>';
		$details_markup .= '<h5>' . $currency . $amount . '</h5>';
		$details_markup .= '</div>';


		$button_markup = '<form action="#URL_GOES_HERE" method="POST"><button type="submit">' . __( 'Checkout', 'otter-blocks' ) . '</button></form>';

		return sprintf(
			'<div %1$s><div class="o-stripe-checkout">%2$s</div>%3$s</div>',
			get_block_wrapper_attributes(),
			$details_markup,
			$button_markup
		);
	}
}
