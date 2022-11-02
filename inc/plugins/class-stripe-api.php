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
}
