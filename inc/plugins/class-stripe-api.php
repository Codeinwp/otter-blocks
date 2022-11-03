<?php
/**
 * Stripe API.
 *
 * @package ThemeIsle\GutenbergBlocks\Plugins
 */

namespace ThemeIsle\GutenbergBlocks\Plugins;

use Stripe\StripeClient;

/**
 * Class Stripe_API
 */
class Stripe_API {

	/**
	 * The main instance var.
	 *
	 * @var Stripe_API
	 */
	public static $instance = null;

	/**
	 * Stripe Object.
	 *
	 * @var Stripe_API
	 */
	public $stripe = '';

	/**
	 * Constructor
	 *
	 * @access public
	 */
	public function __construct() {
		$api_key      = get_option( 'themeisle_stripe_api_key' );
		$this->stripe = new StripeClient( $api_key );

		if ( ! session_id() && ! function_exists( 'is_wpcom_vip' ) ) { // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.session_session_id
			session_start(); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.session_session_start
		}
	}

	/**
	 * Build Error Message
	 *
	 * @param object $error Error Object.
	 * 
	 * @return \WP_Error
	 * @access  public
	 */
	public function build_error_response( $error ) {
		return new \WP_Error(
			'otter_stripe_error',
			$error->getError()->message,
			array(
				'status' => $error->getHttpStatus(),
				'code'   => $error->getError()->code,
				'type'   => $error->getError()->type,
			)
		);
	}

	/**
	 * Make Stripe Request
	 *
	 * @param string $path Request path.
	 * @param array  $args Request arguments.
	 * 
	 * @return mixed
	 * @access public
	 */
	public function create_request( $path, $args = array() ) {
		$response = array();

		try {
			switch ( $path ) {
				case 'products':
					$response = $this->stripe->products->all( $args );
					break;
				case 'product':
					$response = $this->stripe->products->retrieve( $args );
					break;
				case 'prices':
					$response = $this->stripe->prices->all( $args );
					break;
				case 'price':
					$response = $this->stripe->prices->retrieve( $args );
					break;
				case 'create_session':
					$response = $this->stripe->checkout->sessions->create( $args );
					break;
				case 'get_session':
					$response = $this->stripe->checkout->sessions->retrieve( $args );
					break;
				case 'session_items':
					$response = $this->stripe->checkout->sessions->allLineItems( $args );
					break;
				default:
					break;
			}
		} catch ( \Stripe\Exception\CardException $e ) {
			$response = $this->build_error_response( $e );
		} catch ( \Stripe\Exception\RateLimitException $e ) {
			$response = $this->build_error_response( $e );
		} catch ( \Stripe\Exception\InvalidRequestException $e ) {
			$response = $this->build_error_response( $e );
		} catch ( \Stripe\Exception\AuthenticationException $e ) {
			$response = $this->build_error_response( $e );
		} catch ( \Stripe\Exception\ApiConnectionException $e ) {
			$response = $this->build_error_response( $e );
		} catch ( \Stripe\Exception\ApiErrorException $e ) {
			$response = $this->build_error_response( $e );
		} catch ( Exception $e ) {
			$response = $this->build_error_response( $e );
		}

		return $response;
	}

	/**
	 * Get status for price id.
	 *
	 * @param string $session_id Stripe Session ID.
	 * @param string $price_id Price ID.
	 * 
	 * @return false|string
	 * @access  public
	 */
	public function get_status_for_price_id( $session_id, $price_id ) {
		$session   = $this->create_request( 'get_session', $session_id );
		$status    = 'complete' === $session['status'] ? 'success' : 'error';
		$items     = $this->create_request( 'session_items', $session_id );
		$price_ids = array();
		$message   = '';

		if ( 0 < count( $items['data'] ) ) {
			foreach ( $items['data'] as $item ) {
				$price_ids[] = $item['price']['id'];
			}
			$price = $this->create_request( 'get_price', $items['data'][0]['price']['id'] );
		}

		if ( ! in_array( $price_id, $price_ids ) ) {
			return false;
		}

		return $status;
	}

	/**
	 * Set Customer ID for curent user.
	 *
	 * @param string $session_id Stripe Session ID.
	 * 
	 * @access  public
	 */
	public function save_customer_id( $session_id ) {
		if ( false !== $this->get_customer_id() ) {
			return;
		}

		$session = $this->create_request( 'get_session', $session_id );

		if ( ! isset( $session['customer'] ) || empty( $session['customer'] ) ) {
			return;
		}

		$customer = $session['customer'];

		if ( is_user_logged_in() ) {
			$user_id = get_current_user_id();

			if ( empty( get_user_meta( $user_id, 'o_stripe_customer_id', true ) ) ) {
				$updated = update_user_meta( $user_id, 'o_stripe_customer_id', $customer );
			}
		}

		if ( ! function_exists( 'is_wpcom_vip' ) ) {
			$_SESSION['o_stripe_customer_id'] = $customer; // phpcs:ignore WordPressVIPMinimum.Variables.RestrictedVariables.session___SESSION
		}
	}

	/**
	 * Get Customer ID for curent user.
	 * 
	 * @return false|string
	 * @access  public
	 */
	public function get_customer_id() {
		$customer_id = false;

		if ( ! function_exists( 'is_wpcom_vip' ) && isset( $_SESSION['o_stripe_customer_id'] ) ) { //phpcs:ignore WordPressVIPMinimum.Variables.RestrictedVariables.session___SESSION
			$customer_id = esc_attr( $_SESSION['o_stripe_customer_id'] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized, WordPressVIPMinimum.Variables.RestrictedVariables.session___SESSION
		}

		if ( is_user_logged_in() ) {
			$user_id = get_current_user_id();

			if ( ! empty( get_user_meta( $user_id, 'o_stripe_customer_id', true ) ) ) {
				$customer_id = get_user_meta( $user_id, 'o_stripe_customer_id', true );
			}
		}

		return $customer_id;
	}
}
