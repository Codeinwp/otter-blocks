<?php
/**
 * Card server logic.
 *
 * @package ThemeIsle\GutenbergBlocks\Server
 */

namespace ThemeIsle\GutenbergBlocks\Server;

/**
 * Class Plugin_Card_Server
 */
class Plugin_Card_Server {

	/**
	 * The main instance var.
	 *
	 * @var Plugin_Card_Server
	 */
	public static $instance = null;

	/**
	 * Rest route namespace.
	 *
	 * @var Plugin_Card_Server
	 */
	public $namespace = 'otter/';

	/**
	 * Rest route version.
	 *
	 * @var Plugin_Card_Server
	 */
	public $version = 'v1';

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
			'/plugins',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'search' ),
					'args'                => array(
						'search' => array(
							'type'        => 'string',
							'required'    => true,
							'description' => __( 'Search query.', 'otter-blocks' ),
						),
					),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);
	}

	/**
	 * Search WordPress Plugin
	 *
	 * Search WordPress plugin using WordPress.org API.
	 *
	 * @param mixed $request Search request.
	 *
	 * @return mixed|\WP_REST_Response
	 */
	public function search( $request ) {
		if ( ! current_user_can( 'edit_posts' ) ) {
			return false;
		}

		$return = array(
			'success' => false,
			'data'    => esc_html__( 'Something went wrong', 'otter-blocks' ),
		);

		$search = $request->get_param( 'search' );

		require_once ABSPATH . 'wp-admin/includes/plugin-install.php';

		$request = array(
			'per_page' => 12,
			'search'   => $search,
			'fields'   => array(
				'active_installs'   => true,
				'added'             => false,
				'donate_link'       => false,
				'downloadlink'      => true,
				'homepage'          => true,
				'icons'             => true,
				'last_updated'      => false,
				'requires'          => true,
				'requires_php'      => false,
				'screenshots'       => false,
				'short_description' => true,
				'slug'              => false,
				'sections'          => false,
				'requires'          => false,
				'rating'            => true,
				'ratings'           => false,
			),
		);

		$results = plugins_api( 'query_plugins', $request );

		if ( is_wp_error( $request ) ) {
			$return['data'] = 'error';
			return $return;
		}

		$return['success'] = true;

		// Get data from API.
		$return['data'] = $results;

		return rest_ensure_response( $return );
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.0.0
	 * @access public
	 * @return Plugin_Card_Server
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
	 * @since 1.0.0
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
	 * @since 1.0.0
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}
}
