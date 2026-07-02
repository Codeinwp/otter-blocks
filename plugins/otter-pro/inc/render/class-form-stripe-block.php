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
			$details_markup .= '<img src="' . esc_url( $product['images'][0] ) . '" alt="' . esc_attr( $product['description'] ) . '" />';
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
		$details_markup .= '<h3>' . esc_html( $product['name'] ) . '</h3>';
		$details_markup .= '<h5>' . $currency . $amount . '</h5>';
		$details_markup .= '</div>';

		$html_attributes = $this->get_field_attributes( $attributes );

		return sprintf(
			'<div %1$s><div class="o-stripe-checkout">%2$s</div><div class="o-payment-element"></div></div>',
			get_block_wrapper_attributes() . $html_attributes,
			$details_markup
		);
	}

	/**
	 * Build the field HTML attributes (id/name/data-field-option-name) from block attributes.
	 *
	 * @param array<string, mixed> $attributes Block attributes.
	 * @return string
	 */
	public function get_field_attributes( $attributes ) {
		return 'id="' . esc_attr( $attributes['id'] ) . '" ' .
			( isset( $attributes['mappedName'] ) ? ( ' name="' . esc_attr( $attributes['mappedName'] ) . '"' ) : '' ) .
			( isset( $attributes['fieldOptionName'] ) ? ( ' data-field-option-name="' . esc_attr( $attributes['fieldOptionName'] ) . '"' ) : '' );
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
