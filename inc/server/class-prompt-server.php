<?php
/**
 * Prompt server logic.
 *
 * @package ThemeIsle\GutenbergBlocks\Server
 */

namespace ThemeIsle\GutenbergBlocks\Server;

/**
 * Class Prompt_Server
 */
class Prompt_Server {

	/**
	 * The main instance var.
	 *
	 * @var Prompt_Server|null
	 */
	public static $instance = null;

	/**
	 * Rest route namespace.
	 *
	 * @var string
	 */
	public $namespace = 'otter/';

	/**
	 * Rest route version.
	 *
	 * @var string
	 */
	public $version = 'v1';

	/**
	 * Transient name for prompts.
	 *
	 * @var string
	 */
	public $transient_prompts = 'otter_prompts';

	/**
	 * Timeout for prompts request.
	 *
	 * @var string
	 */
	public $timeout_transient = 'otter_prompts_timeout';

	/**
	 * Initialize the class
	 */
	public function init() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register REST API route
	 */
	public function register_routes() {
		$namespace = $this->namespace . $this->version;

		register_rest_route(
			$namespace,
			'/prompt',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_prompts' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);

	}

	/**
	 * Get prompts.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_Error|\WP_HTTP_Response|\WP_REST_Response
	 */
	public function get_prompts( $request ) {
		$response = array(
			'prompts' => array(),
			'code'    => '0',
			'error'   => '',
		);

		// Get the saved prompts.
		$prompts = get_transient( $this->transient_prompts );

		if ( false === $prompts ) {
			/**
			 * If we don't have the prompts saved, we need to retrieve them from the server. Once retrieved, we save them in a transient and return them.
			 */
			$response = $this->retrieve_prompts_from_server();
		}

		if ( '0' === $response['code'] ) {
			if ( $request->get_param( 'name' ) !== null ) {
				$prompts = false !== $prompts ? $prompts : $response['prompts'];
				// Prompt can be filtered by name. By filtering by name, we can get only the prompt we need and save some bandwidth.
				$response['prompts'] = $prompts; // TODO: temporary change. The original did not give an array as JSON response.

				if ( empty( $response['prompts'] ) ) {
					$response['prompts'] = array();
					$response['code']    = '1';
					$response['error']   = __( 'Something went wrong when preparing the data for this feature.', 'otter-blocks' );
				}
			} else {
				$response['prompts'] = $prompts;
			}
		}


		return rest_ensure_response( $response );
	}

	/**
	 *
	 * Retrieve prompts from server.
	 *
	 * @return array
	 */
	public function retrieve_prompts_from_server() {

		if ( false !== get_transient( $this->timeout_transient ) ) {
			return array(
				'response' => array(),
				'code'     => '3',
				'error'    => __( 'Fetching from central server has failed. Please try again later.', 'otter-blocks' ),
			);
		}

		$url = add_query_arg(
			array(
				'site_url'   => get_site_url(),
				'license_id' => apply_filters( 'product_otter_license_key', 'free' ),
				'cache'      => gmdate( 'u' ),
			),
			'http://localhost:3000/prompts' // TODO: change to https://api.themeisle.com/otter/prompts when it is ready.
		);

		$response = '';

		if ( function_exists( 'vip_safe_wp_remote_get' ) ) {
			$response = vip_safe_wp_remote_get( esc_url_raw( $url ) );
		} else {
			$response = wp_remote_get( esc_url_raw( $url ) ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.wp_remote_get_wp_remote_get
		}

		$response = wp_remote_retrieve_body( $response );
		$response = json_decode( $response, true );

		if ( ! is_array( $response ) || 0 === count( $response ) || ! $this->check_prompt_structure( $response ) ) {
			set_transient( $this->timeout_transient, '1', HOUR_IN_SECONDS );
			return array(
				'response' => array(),
				'code'     => '2',
				'error'    => __( 'Could not fetch the data from the central server.', 'otter-blocks' ),
			);
		}

		set_transient( $this->transient_prompts, $response, WEEK_IN_SECONDS );

		return array(
			'response' => $response,
			'code'     => '0',
			'error'    => '',
		);
	}

	/**
	 * Check if the prompt structure is valid.
	 *
	 * @param mixed $response Response from the server.
	 * @return bool
	 */
	public function check_prompt_structure( $response ) {
		if ( ! isset( $response ) ) {
			return false;
		}

		if ( ! is_array( $response ) ) {
			return false;
		}

		if ( 0 === count( $response ) ) {
			return false;
		}

		return true;
	}


	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.7.0
	 * @access public
	 * @return Prompt_Server
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
