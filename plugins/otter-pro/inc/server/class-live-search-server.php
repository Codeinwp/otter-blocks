<?php
/**
 * Live Search server logic.
 *
 * @package ThemeIsle\OtterPro\Server
 */

namespace ThemeIsle\OtterPro\Server;

use WP_Query;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

/**
 * Class Live_Search_Server
 */
class Live_Search_Server {

	/**
	 * The main instance var.
	 *
	 * @var Live_Search_Server
	 * @since 2.0.0
	 */
	public static $instance = null;

	/**
	 * Rest route namespace.
	 *
	 * @var Live_Search_Server
	 * @since 2.0.0
	 */
	public $namespace = 'otter/';

	/**
	 * Rest route version.
	 *
	 * @var Live_Search_Server
	 * @since 2.0.0
	 */
	public $version = 'v1';


	/**
	 * Initialize the class
	 *
	 * @since 2.0.0
	 */
	public function init() {
		/**
		 * Register the REST API endpoints.
		 */
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}


	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.0.0
	 * @access public
	 * @return Live_Search_Server
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
			self::$instance->init();
		}

		return self::$instance;
	}

	/**
	 * Register REST API route
	 *
	 * @return void
	 * @since 2.0.0
	 */
	public function register_routes() {
		$namespace = $this->namespace . $this->version;
		register_rest_route(
			$namespace,
			'/live-search',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'search' ),
				'permission_callback' => function ( $request ) {
					$nonces = $request->get_header_as_array( 'X-WP-Nonce' );
					if ( isset( $nonces ) ) {
						foreach ( $nonces as $nonce ) {
							if ( wp_verify_nonce( $nonce, 'wp_rest' ) ) {
								return __return_true();
							}
						}
					}
					return __return_false();
				},
			)
		);
	}

	/**
	 * Get information from the provider services.
	 *
	 * @param WP_REST_Request $request The API request.
	 * @return WP_REST_Response
	 * @since 2.0.3
	 */
	public function search( WP_REST_Request $request ) {
		$query = new WP_Query(
			array(
				'posts_per_page' => 20,
				'post_type'      => $request->get_param( 'post_types' ),
				's'              => $request->get_param( 's' ),
			)
		);

		return new WP_REST_Response(
			array(
				'success' => true,
				'results' => array_map(
					function( $post ) {
						return array(
							'link'  => get_permalink( $post->ID ),
							'title' => $post->post_title,
						);
					},
					$query->posts
				),
			)
		);
	}

	/**
	 * Throw error on object clone
	 *
	 * The whole idea of the singleton design pattern is that there is a single
	 * object therefore, we don't want the object to be cloned.
	 *
	 * @access public
	 * @return void
	 * @since 2.0.0
	 */
	public function __clone() {
		// Cloning instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}

	/**
	 * Disable unserializing of the class
	 *
	 * @access public
	 * @return void
	 * @since 2.0.0
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}
}
