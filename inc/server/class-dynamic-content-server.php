<?php
/**
 * Dynamic images server logic.
 *
 * @package ThemeIsle\GutenbergBlocks\Server
 */

namespace ThemeIsle\GutenbergBlocks\Server;

/**
 * Class Dynamic_Content_Server
 */
class Dynamic_Content_Server {

	/**
	 * The main instance var.
	 *
	 * @var Dynamic_Content_Server
	 */
	public static $instance = null;

	/**
	 * Rest route namespace.
	 *
	 * @var Dynamic_Content_Server
	 */
	public $namespace = 'otter/';

	/**
	 * Rest route version.
	 *
	 * @var Dynamic_Content_Server
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
			'/dynamic',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get' ),
					'args'                => array(
						'type' => array(
							'type'        => 'string',
							'required'    => false,
							'description' => __( 'Image Type.', 'otter-blocks' ),
						),
					),
					'permission_callback' => function () {
                        return true;
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
	public function get( $request ) {
		if ( ! current_user_can( 'edit_posts' ) ) {
			// return false;
		}

		$return = array(
			'success' => false,
			'data'    => esc_html__( 'Something went wrong', 'otter-blocks' ),
		);

		$search = $request->get_param( 'type' );

        $pic  = '/var/www/html/wp-content/uploads/2022/07/dummy-images-400x400-1.png';
        $size = getimagesize( $pic );

        header( 'Content-type: '.$size['mime'] );
        return readfile( $pic );
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.0.0
	 * @access public
	 * @return Dynamic_Content_Server
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
