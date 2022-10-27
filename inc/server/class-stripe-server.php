<?php
/**
 * Stripe server logic.
 *
 * @package ThemeIsle\GutenbergBlocks\Server
 */

namespace ThemeIsle\GutenbergBlocks\Server;

use Stripe\StripeClient;

/**
 * Class Stripe_Server
 */
class Stripe_Server {

	/**
	 * The main instance var.
	 *
	 * @var Stripe_Server
	 */
	public static $instance = null;

	/**
	 * Rest route namespace.
	 *
	 * @var Stripe_Server
	 */
	public $namespace = 'otter/';

	/**
	 * Rest route version.
	 *
	 * @var Stripe_Server
	 */
	public $version = 'v1';

	/**
	 * Stripe API Key.
	 *
	 * @var Stripe_Server
	 */
	public $api_key = '';

	/**
	 * Stripe Object.
	 *
	 * @var Stripe_Server
	 */
	public $stripe = '';

	/**
	 * Initialize the class
	 */
	public function init() {
		$this->api_key = get_option( 'themeisle_stripe_api_key' );
		$this->stripe  = new StripeClient( $this->api_key );
		
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register REST API route
	 */
	public function register_routes() {
		$namespace = $this->namespace . $this->version;

		register_rest_route(
			$namespace,
			'/stripe/products',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'products' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);
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
	 * @param callback $callback Request callback.
	 * 
	 * @return  mixed
	 * @access  public
	 */
	public function create_request( $callback ) {
		try {
			$response = $callback;
		} catch ( \Stripe\Exception\ApiErrorException $e ) {
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

		return rest_ensure_response( $response );
	}

	/**
	 * List Products.
	 *
	 * @param \WP_REST_Request $request The request.
	 * 
	 * @return \WP_REST_Response
	 * @access  public
	 */
	public function products( \WP_REST_Request $request ) {
		return $this->create_request(
			$this->stripe->products->all(
				array(
					'active' => true,
					'limit'  => 50,
				)
			) 
		);
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.7.0
	 * @access public
	 * @return Stripe_Server
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
			self::$instance->init();
		}

		return self::$instance;
	}

	/**
	 * Throw error on object clone
	 *
	 * The whole idea of the singleton design pattern is that there is a single
	 * object therefore, we don't want the object to be cloned.
	 *
	 * @access public
	 * @since 1.7.0
	 * @return void
	 */
	public function __clone() {
		// Cloning instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}

	/**
	 * Disable unserializing of the class
	 *
	 * @access public
	 * @since 1.7.0
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}
}
