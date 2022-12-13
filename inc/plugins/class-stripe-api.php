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
		if ( ! self::has_keys() ) {
			return;
		}

		\Stripe\Stripe::setAppInfo(
			'WordPress Otter Blocks',
			OTTER_BLOCKS_VERSION,
			'https://github.com/Codeinwp/otter-blocks/'
		);

		$api_key      = get_option( 'themeisle_stripe_api_key' );
		$this->stripe = new StripeClient(
			array(
				'api_key'        => $api_key,
				'stripe_version' => '2022-11-15',
			)
		);

		add_action( 'init', array( $this, 'init' ) );
	}

	/**
	 * Check if API keys are set
	 * 
	 * @return bool
	 * @access public
	 */
	public static function has_keys() {
		$api_key = get_option( 'themeisle_stripe_api_key' );
		return empty( $api_key ) ? false : true;
	}

	/**
	 * Init
	 *
	 * @access public
	 */
	public function init() {
		if ( isset( $_GET['stripe_session_id'] ) ) {// phpcs:ignore WordPress.Security.NonceVerification.NoNonceVerification
			$session_id = esc_attr( $_GET['stripe_session_id'] );// phpcs:ignore WordPress.Security.NonceVerification.NoNonceVerification, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
			$session    = $this->create_request( 'get_session', $session_id );

			if ( isset( $session['status'] ) && 'complete' === $session['status'] ) {
				$this->save_customer_data( $session_id );
			}
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
				case 'get_subscription':
					$response = $this->stripe->subscriptions->retrieve( $args );
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
		} catch ( \Stripe\Exception\InvalidArgumentException $e ) {
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
	public function save_customer_data( $session_id ) {
		$user_id = get_current_user_id();

		$session = $this->create_request( 'get_session', $session_id );

		if ( ! isset( $session['customer'] ) || empty( $session['customer'] ) ) {
			return;
		}

		$data = $this->get_customer_data();
		$id   = hash( 'md4', $session_id );
		$ids  = array_column( $data, 'id' );

		if ( in_array( $id, $ids ) ) {
			return;
		}

		$mode = $session['mode'];

		$object = array(
			'id'   => $id,
			'mode' => $mode,
		);

		if ( 'subscription' === $mode && isset( $session['subscription'] ) && ! empty( $session['subscription'] ) ) {
			$object['subscription_id'] = $session['subscription'];
		}

		$queries = [];
		parse_str( $session['success_url'], $queries );
		if ( isset( $queries['product_id'] ) ) {
			$object['product_id'] = $queries['product_id'];
		}

		array_push( $data, $object );

		if ( ! $user_id ) {
			setcookie( 'o_stripe_data', wp_json_encode( $data ), strtotime( '+1 week' ), COOKIEPATH, COOKIE_DOMAIN, false ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.cookies_setcookie
			return;
		}

		update_user_meta( $user_id, 'o_stripe_data', wp_json_encode( $data ) );
	}

	/**
	 * Get Customer ID for curent user.
	 * 
	 * @return  array
	 * @access  public
	 */
	public function get_customer_data() {
		$data = array();

		$user_id = get_current_user_id();

		if ( ! $user_id ) {
			if ( isset( $_COOKIE['o_stripe_data'] ) && ! empty( $_COOKIE['o_stripe_data'] ) ) { // phpcs:ignore WordPressVIPMinimum.Variables.RestrictedVariables.cache_constraints___COOKIE
				$data = json_decode( stripcslashes( $_COOKIE['o_stripe_data'] ), true ); // phpcs:ignore WordPressVIPMinimum.Variables.RestrictedVariables.cache_constraints___COOKIE, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
			}

			return $data;
		}

		if ( empty( get_user_meta( $user_id, 'o_stripe_data', true ) ) ) {
			return $data;
		}

		$data = get_user_meta( $user_id, 'o_stripe_data', true );

		return json_decode( $data, true );
	}

	/**
	 * Check if user owns a product.
	 *
	 * @param string $product Product ID.
	 * 
	 * @return  bool
	 * @access  public
	 */
	public function check_purchase( $product ) {
		$data = $this->get_customer_data();

		if ( 1 > count( $data ) ) {
			return false;
		}

		$possible_values = array_filter(
			$data,
			function( $item ) use ( $product ) {
				return $product === $item['product_id'];
			}
		);

		if ( 1 > count( $possible_values ) ) {
			return false;
		}

		$bool = false;

		foreach ( $possible_values as $value ) {
			if ( 'subscription' === $value['mode'] ) {
				$subscription = $this->create_request( 'get_subscription', $value['subscription_id'] );

				if ( 'active' !== $subscription['status'] ) {
					continue;
				}

				$bool = true;
				break;
			}

			if ( 'payment' === $value['mode'] ) {
				$bool = true;
				break;
			}
		}
		
		return $bool;
	}
}
