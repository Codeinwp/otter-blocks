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
	 * OpenAI Endpoint.
	 * 
	 * @var string
	 */
	const BASE_URL = 'https://api.openai.com/v1/chat/completions';

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
			'/openai/key',
			array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'save_api_key' ),
					'permission_callback' => function () {
						return current_user_can( 'manage_options' );
					},
				),
			)
		);

		register_rest_route(
			$namespace,
			'/openai/prompt',
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

		register_rest_route(
			$namespace,
			'/openai/generate',
			array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'forward_prompt' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);
	}

	/**
	 * Save the API key.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_Error|\WP_HTTP_Response|\WP_REST_Response
	 */
	public function save_api_key( $request ) {
		$body = $request->get_body();
		$body = json_decode( $body, true );

		if ( ! is_array( $body ) && ! isset( $body['api_key'] ) ) {
			return new \WP_Error( 'rest_invalid_json', __( 'API key is missing.', 'otter-blocks' ), array( 'status' => 400 ) );
		}

		$api_key = sanitize_text_field( $body['api_key'] );

		if ( empty( $api_key ) ) {
			delete_option( 'themeisle_open_ai_api_key' );
			return new \WP_REST_Response( array( 'message' => __( 'API key saved.', 'otter-blocks' ) ), 200 );
		}

		$response = wp_remote_post(
			self::BASE_URL,
			array(
				'method'  => 'POST',
				'headers' => array(
					'Authorization' => 'Bearer ' . $api_key,
					'Content-Type'  => 'application/json',
				),
				'body'    => wp_json_encode(
					array(
						'model'    => 'gpt-3.5-turbo',
						'messages' => array(
							array(
								'role'    => 'system',
								'content' => 'You are a helpful assistant.',
							),
							array(
								'role'    => 'user',
								'content' => 'Hello!',
							),
						),
					)
				),
				'timeout' => 2 * MINUTE_IN_SECONDS,
			)
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$body = wp_remote_retrieve_body( $response );
		$body = json_decode( $body );

		if ( json_last_error() !== JSON_ERROR_NONE && ! is_object( $body ) ) {
			return new \WP_Error( 'rest_invalid_json', __( 'Could not parse the response from OpenAI. Try again.', 'otter-blocks' ), array( 'status' => 400 ) );
		}

		if ( isset( $body->error ) ) {
			return isset( $body->error->message ) ? new \WP_Error( isset( $body->error->code ) ? $body->error->code : 'unknown_error', $body->error->message ) : new \WP_Error( 'unknown_error', __( 'An error occurred while processing the request.', 'otter-blocks' ) );
		}

		update_option( 'themeisle_open_ai_api_key', $api_key );

		return new \WP_REST_Response( array( 'message' => __( 'API key saved.', 'otter-blocks' ) ), 200 );
	}

	/**
	 * Forward the prompt to OpenAI API.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_Error|\WP_HTTP_Response|\WP_REST_Response
	 */
	public function forward_prompt( $request ) {
		// Get the body from request and decode it.
		$body = $request->get_body();
		$body = json_decode( $body, true );

		$api_key = get_option( 'themeisle_open_ai_api_key' );

		// Extract the data from keys that start with 'otter_'.
		$otter_data = array_filter(
			$body,
			function ( $key ) {
				return 0 === strpos( $key, 'otter_' );
			},
			ARRAY_FILTER_USE_KEY
		);

		// Remove the values which keys start with 'otter_'.
		$body = array_diff_key( $body, $otter_data );

		$response = wp_remote_post(
			self::BASE_URL,
			array(
				'method'  => 'POST',
				'headers' => array(
					'Authorization' => 'Bearer ' . $api_key,
					'Content-Type'  => 'application/json',
				),
				'body'    => wp_json_encode( $body ),
				'timeout' => 2 * MINUTE_IN_SECONDS,
			)
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$body = wp_remote_retrieve_body( $response );
		$body = json_decode( $body, true );

		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return new \WP_Error( 'rest_invalid_json', __( 'Could not parse the response from OpenAI. Try again.', 'otter-blocks' ), array( 'status' => 400 ) );
		}

		return new \WP_REST_Response( $body, wp_remote_retrieve_response_code( $response ) );
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
				$prompts = ! empty( $prompts ) ? $prompts : $response['prompts'];

				// Prompt can be filtered by name. By filtering by name, we can get only the prompt we need and save some bandwidth.
				$single_prompt = array_values(
					array_filter(
						$prompts,
						function ( $prompt ) use ( $request ) {
							return $prompt['otter_name'] === $request->get_param( 'name' );
						}
					)
				);

				if ( empty( $single_prompt ) ) {
					$response['prompts'] = $prompts;
					$response['code']    = '1';
					$response['error']   = __( 'Something went wrong when preparing the data for this feature.', 'otter-blocks' );
				} else {
					$response['prompts'] = $single_prompt;
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
				'error'    => __( 'Timeout is active. Please try again in', 'otter-blocks' ) . 5 . __( 'minutes.', 'otter-blocks' ),
			);
		}

		$url = add_query_arg(
			array(
				'site_url'   => get_site_url(),
				'license_id' => apply_filters( 'product_otter_license_key', 'free' ),
				'cache'      => gmdate( 'u' ),
				'isValid'    => boolval( get_option( 'themeisle_open_ai_api_key', false ) ) ? 'true' : 'false',
			),
			'https://api.themeisle.com/templates-cloud/otter-prompts'
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
			set_transient( $this->timeout_transient, '1', 5 * MINUTE_IN_SECONDS );
			return array(
				'response' => array(),
				'code'     => '2',
				'error'    => __( 'Invalid data from central server. Please try again in', 'otter-blocks' ) . 5 . __( 'minutes.', 'otter-blocks' ),
			);
		}

		set_transient( $this->transient_prompts, $response, WEEK_IN_SECONDS );

		return array(
			'prompts' => $response,
			'code'    => '0',
			'error'   => '',
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
	 * Record prompt usage.
	 *
	 * @param array $otter_metadata The metadata from the prompt usage request.
	 * @return void
	 * @phpstan-ignore-next-line
	 */
	private function record_prompt_usage( $otter_metadata ) {
		if ( ! isset( $otter_metadata['otter_used_action'] ) || ! isset( $otter_metadata['otter_user_content'] ) ) {
			return;
		}

		$action       = $otter_metadata['otter_used_action'];
		$user_content = $otter_metadata['otter_user_content'];

		$usage = get_option( 'themeisle_otter_ai_usage' );

		if ( ! is_array( $usage ) ) {
			$usage = array(
				'usage_count' => array(),
				'prompts'     => array(),
			);
		}

		if ( ! is_array( $usage['usage_count'] ) ) {
			$usage['usage_count'] = array();
		}

		if ( ! is_array( $usage['prompts'] ) ) {
			$usage['prompts'] = array();
		}

		$is_missing = true;

		foreach ( $usage['usage_count'] as &$u ) {
			if ( isset( $u['key'] ) && $u['key'] === $action ) {
				$u['value']++;
				$is_missing = false;
			}
		}

		unset( $u );

		if ( $is_missing ) {
			$usage['usage_count'][] = array(
				'key'   => $action,
				'value' => 1,
			);
		}

		$is_missing = true;

		foreach ( $usage['prompts'] as &$u ) {
			if ( isset( $u['key'] ) && $u['key'] === $action ) {
				$u['values'][] = $user_content;
				$is_missing    = false;

				// Keep only the last 10 prompts.
				if ( count( $u['values'] ) > 10 ) {
					array_shift( $u['values'] );
				}
			}
		}

		unset( $u );

		if ( $is_missing ) {
			$usage['prompts'][] = array(
				'key'    => $action,
				'values' => array( $user_content ),
			);
		}

		update_option( 'themeisle_otter_ai_usage', $usage );
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
