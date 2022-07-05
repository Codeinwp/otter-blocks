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
							'required'    => true,
							'description' => __( 'Image Type.', 'otter-blocks' ),
						),
						'id'   => array(
							'type'              => 'integer',
							'required'          => true,
							'description'       => __( 'ID of the Post.', 'otter-blocks' ),
							'validate_callback' => function ( $param, $request, $key ) {
								return is_numeric( $param );
							},
						),
					),
					'permission_callback' => function () {
						return true;
					},
				),
			)
		);
	}

	/**
	 * Get Dynamic Image
	 *
	 * Get dynamic image from WordPress.
	 *
	 * @param mixed $request Request arguments.
	 *
	 * @return mixed|\WP_REST_Response
	 */
	public function get( $request ) {
		$type = $request->get_param( 'type' );
		$id   = $request->get_param( 'id' );
		$path = OTTER_BLOCKS_PATH . '/assets/images/placeholder.png';

		if ( 'featuredImage' === $type ) {
			$image = get_post_thumbnail_id( $id );
			if ( $image ) {
				$path  = wp_get_original_image_path( $image );
			}
		}

        $size = getimagesize( $path );

        header( 'Content-type: '.$size['mime'] );
        return readfile( $path );
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
