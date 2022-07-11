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
						'type'    => array(
							'type'              => 'string',
							'required'          => true,
							'description'       => __( 'Image Type.', 'otter-blocks' ),
							'validate_callback' => function ( $param, $request, $key ) {
								$allowed_types = array( 'featuredImage', 'authorImage', 'loggedInUserImage', 'productImage', 'postMetaImage' );
								return in_array( $param, $allowed_types );
							},
						),
						'context' => array(
							'type'              => 'integer',
							'required'          => true,
							'description'       => __( 'ID of the post being edited.', 'otter-blocks' ),
							'validate_callback' => function ( $param, $request, $key ) {
								return is_numeric( $param );
							},
						),
						'id'      => array(
							'type'              => 'integer',
							'required'          => false,
							'description'       => __( 'ID of the Post that the image belongs.', 'otter-blocks' ),
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
		$type    = $request->get_param( 'type' );
		$context = $request->get_param( 'context' );
		$id      = $request->get_param( 'id' );
		$path    = OTTER_BLOCKS_PATH . '/assets/images/placeholder.png';

		if ( 'featuredImage' === $type ) {
			$image = get_post_thumbnail_id( $context );
			if ( $image ) {
				$path  = wp_get_original_image_path( $image );
			}
		}

		if ( 'authorImage' === $type ) {
			$author = get_post_field( 'post_author', $context );
			$path   = get_avatar_url( $author );
		}

		if ( 'loggedInUserImage' === $type ) {
			$user = get_current_user_id();

			if ( true === boolval( $user ) ) {
				$path = get_avatar_url( $user );
			}
		}

		if ( 'productImage' === $type && ! empty( $id ) ) {
			$product = wc_get_product( $id );
			$image   = $product->get_image_id();
			
			if ( $image ) {
				$path  = wp_get_original_image_path( $image );
			} else {
				$image = get_option( 'woocommerce_placeholder_image', 0 );

				if ( $image ) {
					$path  = wp_get_original_image_path( $image );
				}
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
