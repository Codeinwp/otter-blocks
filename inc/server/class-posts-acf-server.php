<?php
/**
 * Card server logic.
 *
 * @package ThemeIsle\GutenbergBlocks\Server
 */

namespace ThemeIsle\GutenbergBlocks\Server;

/**
 * Class Posts_ACF_Server
 */
class Posts_ACF_Server {

	/**
	 * The main instance var.
	 *
	 * @var Posts_ACF_Server
	 */
	public static $instance = null;

	/**
	 * Rest route namespace.
	 *
	 * @var Posts_ACF_Server
	 */
	public $namespace = 'otter/';

	/**
	 * Rest route version.
	 *
	 * @var Posts_ACF_Server
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
	 *
	 * @since 1.7.6
	 */
	public function register_routes() {
		$namespace = $this->namespace . $this->version;

		register_rest_route(
			$namespace,
			'/acf-fields',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_acf_fields' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);
	}

	/**
	 * Get the ACF data about custom meta fields.
	 *
	 * @param mixed $request Rest request.
	 * @since 1.7.6
	 * @return mixed|\WP_REST_Response
	 */
	public function get_acf_fields( $request ) {
		$return = array(
			'success' => false,
		);

		if ( ! ( function_exists( 'acf_get_field_groups' ) && function_exists( 'acf_get_fields' ) ) ) {
			$return['error']     = esc_html__( 'ACF is not installed!', 'otter-blocks' );
			$return['eror_code'] = 1;
			return rest_ensure_response( $return );
		}

		$return['groups'] = array();
		$groups           = acf_get_field_groups();

		foreach ( $groups as $group ) {
			$group_data = array(
				'data'   => $group,
				'fields' => array(),
			);

			$fields = acf_get_fields( $group );

			foreach ( $fields as $field ) {
				array_push( $group_data['fields'], $field );
			}
			array_push( $return['groups'], $group_data );
		}

		$return['success'] = true;
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
