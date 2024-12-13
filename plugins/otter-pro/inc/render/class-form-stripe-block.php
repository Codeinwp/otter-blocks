<?php
/**
 * Stripe_Checkout_Block
 *
 * @package ThemeIsle\GutenbergBlocks\Render
 */

namespace ThemeIsle\OtterPro\Render;

use ThemeIsle\GutenbergBlocks\Render\Review_Block;
use ThemeIsle\OtterPro\Plugins\License;
use ThemeIsle\GutenbergBlocks\Plugins\Stripe_API;

/**
 * Class Form_Stripe_Block
 */
class Form_Stripe_Block {

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

		if ( ! License::has_active_license() ) {
			return '';
		}

		if ( ! isset( $attributes['product'] ) || ! isset( $attributes['price'] ) || ! Stripe_API::has_keys() ) {
			return '';
		}

		$stripe = new Stripe_API();

		$product = $stripe->create_request( 'product', $attributes['product'] );

		if ( is_wp_error( $product ) ) {
			return sprintf(
				'<div %1$s><div class="o-stripe-checkout">%2$s</div></div>',
				get_block_wrapper_attributes(),
				__( 'An error occurred! Could not retrieve product information!', 'otter-pro' ) . $this->format_error( $product )
			);
		}

		$details_markup = '';

		if ( 0 < count( $product['images'] ) ) {
			$details_markup .= '<img src="' . $product['images'][0] . '" alt="' . $product['description'] . '" />';
		}

		$price = $stripe->create_request( 'price', $attributes['price'] );

		if ( is_wp_error( $price ) ) {
			return sprintf(
				'<div %1$s><div class="o-stripe-checkout">%2$s</div></div>',
				get_block_wrapper_attributes(),
				__( 'An error occurred! Could not retrieve the price of the product!', 'otter-pro' ) . $this->format_error( $price )
			);
		}

		$currency = Review_Block::get_currency( $price['currency'] );
		$amount   = number_format( $price['unit_amount'] / 100, 2, '.', ' ' );

		$details_markup .= '<div class="o-stripe-checkout-description">';
		$details_markup .= '<h3>' . $product['name'] . '</h3>';
		$details_markup .= '<h5>' . $currency . $amount . '</h5>';
		$details_markup .= '</div>';

		$html_attributes = 'id="' . $attributes['id'] . '" ' .
			( isset( $attributes['mappedName'] ) ? ( ' name="' . $attributes['mappedName'] . '"' ) : '' ) .
			( isset( $attributes['fieldOptionName'] ) ? ( ' data-field-option-name="' . $attributes['fieldOptionName'] . '"' ) : '' );

		return sprintf(
			'<div %1$s><div class="o-stripe-checkout">%2$s</div><div class="o-payment-element"></div></div>',
			get_block_wrapper_attributes() . $html_attributes,
			$details_markup
		);
	}

	/**
	 * Format the error message.
	 *
	 * @param \WP_Error $error The error.
	 * @return string
	 */
	private function format_error( $error ) {
		return defined( 'WP_DEBUG' ) && WP_DEBUG ? (
			'<span><strong>' . __( 'Error message: ', 'otter-pro' ) . '</strong> ' . $error->get_error_message() . '</span>'
		) : '';
	}
}
