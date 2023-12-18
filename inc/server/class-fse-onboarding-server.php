<?php
/**
 * FSE Onboarding server logic.
 *
 * @package ThemeIsle\GutenbergBlocks\Server
 */

namespace ThemeIsle\GutenbergBlocks\Server;

use ThemeIsle\GutenbergBlocks\Plugins\FSE_Onboarding;

/**
 * Class FSE_Onboarding_Server
 */
class FSE_Onboarding_Server {

	/**
	 * The main instance var.
	 *
	 * @var FSE_Onboarding_Server|null
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
			'/onboarding/templates',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_templates' ),
					'permission_callback' => function () {
						return current_user_can( 'manage_options' );
					},
				),
			)
		);
	}

	/**
	 * List Templates.
	 *
	 * @param \WP_REST_Request $request The request.
	 * 
	 * @return \WP_REST_Response
	 * @access  public
	 */
	public function get_templates( \WP_REST_Request $request ) {
		$fse_onboarding = FSE_Onboarding::instance();

		$templates = $fse_onboarding->get_templates();

		if ( ! $templates ) {
			return rest_ensure_response(
				array(
					'success' => false,
					'data'    => array(
						'message' => __( 'Missing templates', 'otter-blocks' ),
					),
				)
			);
		}

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => $templates,
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
	 * @return FSE_Onboarding_Server
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
