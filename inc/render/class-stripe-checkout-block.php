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
		if ( ! isset( $attributes['product'] ) || ! isset( $attributes['price'] ) || ! Stripe_API::has_keys() ) {
			return '';
		}

		$stripe = new Stripe_API();

		if ( isset( $_GET['stripe_session_id'] ) ) {// phpcs:ignore WordPress.Security.NonceVerification.NoNonceVerification
			$session_id = esc_attr( $_GET['stripe_session_id'] );// phpcs:ignore WordPress.Security.NonceVerification.NoNonceVerification, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
			$status     = $stripe->get_status_for_price_id( $session_id, esc_attr( $attributes['price'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.NoNonceVerification

			if ( false !== $status ) {
				if ( 'success' === $status ) {
					$message = isset( $attributes['successMessage'] ) ? $attributes['successMessage'] : __( 'Your payment was successful. If you have any questions, please email orders@example.com.', 'otter-blocks' );
				} else {
					$message = isset( $attributes['cancelMessage'] ) ? $attributes['cancelMessage'] : __( 'Your payment was unsuccessful. If you have any questions, please email orders@example.com.', 'otter-blocks' );
				}

				return sprintf( '<p class="o-stripe-message-%2$s">%1$s</p>', $message, $status );
			}
		}

		$product = $stripe->create_request( 'product', $attributes['product'] );

		if ( is_wp_error( $product ) ) {
			return sprintf(
				'<div %1$s><div class="o-stripe-checkout">%2$s</div></div>',
				get_block_wrapper_attributes(),
				__( 'An error occurred! Could not retrieve product information!', 'otter-blocks' ) . $this->format_error( $product )
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
				__( 'An error occurred! Could not retrieve the price of the product!', 'otter-blocks' ) . $this->format_error( $price )
			);
		}

		$currency = Review_Block::get_currency( $price['currency'] );
		$amount   = number_format( $price['unit_amount'] / 100, 2, '.', ' ' );

		$details_markup .= '<div class="o-stripe-checkout-description">';
		$details_markup .= '<h3>' . $product['name'] . '</h3>';
		$details_markup .= '<h5>' . $currency . $amount . '</h5>';
		$details_markup .= '</div>';

		$mode = 'recurring' === $price['type'] ? 'subscription' : 'payment';

		$permalink = add_query_arg(
			array(
				'stripe_session_id' => '{CHECKOUT_SESSION_ID}',
				'product_id'        => $attributes['product'],
			),
			get_permalink()
		);

		$session = $stripe->create_request(
			'create_session',
			array(
				'success_url' => $permalink,
				'cancel_url'  => $permalink,
				'line_items'  => array(
					array(
						'price'    => $attributes['price'],
						'quantity' => 1,
					),
				),
				'mode'        => $mode,
			)
		);

		if ( is_wp_error( $session ) ) {
			$button_markup = '<a>' . __( 'The product can not be purchased anymore.', 'otter-blocks' ) . $this->format_error( $session ) . '</a>';
		} else {
			$button_markup = '<a href="' . esc_url( $session->url ) . '">' . __( 'Checkout', 'otter-blocks' ) . '</a>';
		}

		return sprintf(
			'<div %1$s><div class="o-stripe-checkout">%2$s</div>%3$s</div>',
			get_block_wrapper_attributes(),
			$details_markup,
			$button_markup
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
			'<span><strong>' . __( 'Error message: ', 'otter-blocks' ) . '</strong> ' . $error->get_error_message() . '</span>'
		) : '';
	}
}
