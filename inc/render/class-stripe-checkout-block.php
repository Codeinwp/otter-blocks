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
	 * Transient prefix for the cached checkout mode of a price.
	 *
	 * @var string
	 */
	const PRICE_MODE_CACHE_PREFIX = 'otter_stripe_price_mode_';

	/**
	 * Stripe API instance.
	 * 
	 * @var Stripe_API
	 */
	private $stripe_api;

	/**
	 * Constructor.
	 *
	 * @access public
	 * @since 3.0.0
	 */
	public function __construct() {
		$this->stripe_api = new Stripe_API();

		add_filter( 'allowed_redirect_hosts', array( $this, 'add_allowed_redirect_hosts' ) );
		add_action( 'wp_loaded', array( $this, 'watch_checkout' ) );
	}

	/**
	 * Add allowed redirect hosts.
	 *
	 * @param array $hosts Allowed hosts.
	 * @return array
	 */
	public function add_allowed_redirect_hosts( $hosts ) {
		$hosts[] = 'checkout.stripe.com';
		return $hosts;
	}

	/**
	 * Watch for the checkout.
	 */
	public function watch_checkout() {
		if ( ! isset( $_GET['action'] ) || 'buy_stripe' !== $_GET['action'] ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return;
		}

		$product_id = isset( $_GET['product_id'] ) ? sanitize_text_field( wp_unslash( $_GET['product_id'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$price_id   = isset( $_GET['price_id'] ) ? sanitize_text_field( wp_unslash( $_GET['price_id'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$url        = isset( $_GET['url'] ) ? sanitize_url( wp_unslash( $_GET['url'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended

		if ( empty( $product_id ) || empty( $price_id ) || empty( $url ) ) {
			return sprintf(
				'<div class="wp-block-themeisle-blocks-stripe-checkout"><div class="o-stripe-checkout">%s</div></div>',
				__( 'An error occurred! Could not retrieve the product information!', 'otter-blocks' )
			);
		}

		$post_id = $this->get_post_id_for_checkout( $product_id, $price_id, $url );

		if ( 0 === $post_id ) {
			return sprintf(
				'<div class="wp-block-themeisle-blocks-stripe-checkout"><div class="o-stripe-checkout">%s</div></div>',
				__( 'An error occurred! Could not retrieve the product information!', 'otter-blocks' )
			);
		}

		$permalink = add_query_arg(
			array(
				'stripe_session_id' => '{CHECKOUT_SESSION_ID}',
				'product_id'        => $product_id,
			),
			get_permalink( $post_id )
		);
	
		$session = $this->stripe_api->create_request(
			'create_session',
			array(
				'success_url' => $permalink,
				'cancel_url'  => $permalink,
				'line_items'  => array(
					array(
						'price'    => $price_id,
						'quantity' => 1,
					),
				),
				'mode'        => $this->get_mode_for_price( $price_id ),
			)
		);

		if ( is_wp_error( $session ) ) {
			return sprintf(
				'<div class="wp-block-themeisle-blocks-stripe-checkout"><div class="o-stripe-checkout">%s</div></div>',
				__( 'An error occurred! Could not create the request!', 'otter-blocks' ) . $this->format_error( $session )
			);
		}

		wp_safe_redirect( esc_url( $session->url ) );
		exit;
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
	public function render( $attributes ) {
		if ( ! isset( $attributes['product'] ) || ! isset( $attributes['price'] ) || ! Stripe_API::has_keys() ) {
			return '';
		}

		if ( isset( $_GET['stripe_session_id'] ) ) {// phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$session_id = esc_attr( $_GET['stripe_session_id'] );// phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
			$status     = $this->stripe_api->get_status_for_price_id( $session_id, esc_attr( $attributes['price'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended

			if ( false !== $status ) {
				if ( 'success' === $status ) {
					$message = isset( $attributes['successMessage'] ) ? wp_kses_post( $attributes['successMessage'] ) : __( 'Your payment was successful. If you have any questions, please email orders@example.com.', 'otter-blocks' );

					do_action( 'otter_blocks_stripe_checkout_success', $attributes, $this->stripe_api, $session_id );
				} else {
					$message = isset( $attributes['cancelMessage'] ) ? wp_kses_post( $attributes['cancelMessage'] ) : __( 'Your payment was unsuccessful. If you have any questions, please email orders@example.com.', 'otter-blocks' );
				}

				return sprintf( '<p class="o-stripe-message-%2$s">%1$s</p>', $message, $status );
			}
		}

		$product = $this->stripe_api->create_request( 'product', $attributes['product'] );

		if ( is_wp_error( $product ) ) {
			return sprintf(
				'<div %1$s><div class="o-stripe-checkout">%2$s</div></div>',
				get_block_wrapper_attributes(),
				__( 'An error occurred! Could not retrieve product information!', 'otter-blocks' ) . $this->format_error( $product )
			);
		}

		$details_markup = '';

		if ( 0 < count( $product['images'] ) ) {
			$details_markup .= '<img src="' . esc_url( $product['images'][0] ) . '" alt="' . esc_attr( $product['name'] ) . '" />';
		}

		$price = $this->stripe_api->create_request( 'price', $attributes['price'] );

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
		$details_markup .= '<h3>' . esc_html( $product['name'] ) . '</h3>';
		$details_markup .= '<h5>' . $currency . $amount . '</h5>';
		$details_markup .= '</div>';

		$session_url = add_query_arg(
			array(
				'action'     => 'buy_stripe',
				'product_id' => $attributes['product'],
				'price_id'   => $attributes['price'],
				'url'        => get_permalink(),
			),
			get_permalink()
		);

		$button_markup = '<a href="' . esc_url( $session_url ) . '">' . __( 'Checkout', 'otter-blocks' ) . '</a>';

		return sprintf(
			'<div %1$s><div class="o-stripe-checkout">%2$s</div>%3$s</div>',
			get_block_wrapper_attributes(),
			$details_markup,
			$button_markup
		);
	}

	/**
	 * Get the ID of the post that offers the given product/price pair.
	 *
	 * @param string $product_id Stripe product ID.
	 * @param string $price_id Stripe price ID.
	 * @param string $url URL of the page holding the checkout block.
	 * @return int Post ID, or 0 when the pair is not offered there.
	 */
	private function get_post_id_for_checkout( $product_id, $price_id, $url ) {
		if ( function_exists( 'wpcom_vip_url_to_postid' ) ) {
			$post_id = wpcom_vip_url_to_postid( $url );
		} else {
			$post_id = url_to_postid( $url ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.url_to_postid_url_to_postid
		}

		if ( 0 === $post_id ) {
			return 0;
		}

		$post = get_post( $post_id );

		if ( ! $post instanceof \WP_Post ) {
			return 0;
		}

		if ( 'publish' !== $post->post_status && ! current_user_can( 'read_post', $post_id ) ) {
			return 0;
		}

		$visited = array( $post_id => true );

		return $this->blocks_have_checkout( parse_blocks( $post->post_content ), $product_id, $price_id, $visited ) ? $post_id : 0;
	}

	/**
	 * Check whether a block tree contains a Stripe Checkout block for the given product/price pair.
	 *
	 * @param array<int, array<string, mixed>> $blocks Parsed blocks.
	 * @param string                           $product_id Stripe product ID.
	 * @param string                           $price_id Stripe price ID.
	 * @param array<int, bool>                 $visited Reusable block IDs already traversed.
	 * @return bool
	 */
	private function blocks_have_checkout( $blocks, $product_id, $price_id, &$visited = array() ) {
		foreach ( $blocks as $block ) {
			if ( ! isset( $block['blockName'] ) ) {
				continue;
			}

			if ( 'themeisle-blocks/stripe-checkout' === $block['blockName'] ) {
				$attrs = isset( $block['attrs'] ) ? $block['attrs'] : array();

				if ( isset( $attrs['product'], $attrs['price'] ) && $product_id === $attrs['product'] && $price_id === $attrs['price'] ) {
					return true;
				}
			}

			// Synced patterns keep their content in a separate post; guard against reference cycles.
			if ( 'core/block' === $block['blockName'] && isset( $block['attrs']['ref'] ) ) {
				$ref = (int) $block['attrs']['ref'];

				if ( ! isset( $visited[ $ref ] ) ) {
					$visited[ $ref ] = true;
					$reusable        = get_post( $ref );

					if ( $reusable instanceof \WP_Post && $this->blocks_have_checkout( parse_blocks( $reusable->post_content ), $product_id, $price_id, $visited ) ) {
						return true;
					}
				}
			}

			if ( ! empty( $block['innerBlocks'] ) && $this->blocks_have_checkout( $block['innerBlocks'], $product_id, $price_id, $visited ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Get the checkout session mode for a price.
	 *
	 * @param string $price_id Stripe price ID.
	 * @return string
	 */
	private function get_mode_for_price( $price_id ) {
		$cache_key = self::PRICE_MODE_CACHE_PREFIX . md5( $price_id );
		$cached    = get_transient( $cache_key );

		if ( 'payment' === $cached || 'subscription' === $cached ) {
			return $cached;
		}

		$price = $this->stripe_api->create_request( 'price', $price_id );

		if ( is_wp_error( $price ) || ! isset( $price['type'] ) ) {
			return 'payment';
		}

		$mode = 'recurring' === $price['type'] ? 'subscription' : 'payment';

		set_transient( $cache_key, $mode, WEEK_IN_SECONDS );

		return $mode;
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
