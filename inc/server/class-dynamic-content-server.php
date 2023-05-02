<?php
/**
 * Dynamic images server logic.
 *
 * @package ThemeIsle\GutenbergBlocks\Server
 */

namespace ThemeIsle\GutenbergBlocks\Server;

use ThemeIsle\GutenbergBlocks\Plugins\Dynamic_Content;

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
						'type'     => array(
							'type'              => 'string',
							'required'          => true,
							'description'       => __( 'Image Type.', 'otter-blocks' ),
							'sanitize_callback' => function ( $param ) {
								return (string) esc_attr( $param );
							},
							'validate_callback' => function ( $param, $request, $key ) {
								$allowed_types = array( 'featuredImage', 'author', 'loggedInUser', 'logo', 'postMeta', 'product', 'acf' );
								return in_array( $param, $allowed_types );
							},
						),
						'uid'      => array(
							'type'              => 'integer',
							'required'          => true,
							'description'       => __( 'Unique ID.', 'otter-blocks' ),
							'sanitize_callback' => function ( $param ) {
								return intval( $param );
							},
							'validate_callback' => function ( $param, $request, $key ) {
								return is_numeric( $param );
							},
						),
						'context'  => array(
							'type'              => array( 'string', 'integer' ),
							'required'          => true,
							'description'       => __( 'ID of the post being edited.', 'otter-blocks' ),
							'sanitize_callback' => function ( $param ) {
								return is_numeric( $param ) ? intval( $param ) : esc_attr( $param );
							},
							'validate_callback' => function ( $param, $request, $key ) {
								return is_numeric( $param ) || is_string( $param );
							},
						),
						'id'       => array(
							'type'              => 'integer',
							'required'          => false,
							'description'       => __( 'ID of the Post that the image belongs.', 'otter-blocks' ),
							'sanitize_callback' => function ( $param ) {
								return intval( $param );
							},
							'validate_callback' => function ( $param, $request, $key ) {
								return is_numeric( $param );
							},
						),
						'fallback' => array(
							'type'              => 'string',
							'required'          => false,
							'description'       => __( 'Fallback image.', 'otter-blocks' ),
							'sanitize_callback' => function ( $param ) {
								return esc_attr( $param );
							},
							'validate_callback' => function ( $param, $request, $key ) {
								return is_string( $key );
							},
						),
						'meta'     => array(
							'type'              => 'string',
							'required'          => false,
							'description'       => __( 'Meta key.', 'otter-blocks' ),
							'sanitize_callback' => function ( $param ) {
								return esc_attr( $param );
							},
							'validate_callback' => function ( $param, $request, $key ) {
								return is_string( $key );
							},
						),
					),
					'permission_callback' => function () {
						return true;
					},
				),
			)
		);

		register_rest_route(
			$namespace,
			'/dynamic/preview',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => function( $request ) {
						return Dynamic_Content::instance()->apply_data( $request->get_params() );
					},
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
		$type     = $request->get_param( 'type' );
		$context  = $request->get_param( 'context' );
		$fallback = $request->get_param( 'fallback' );
		$path     = OTTER_BLOCKS_PATH . '/assets/images/placeholder.jpg';

		if ( ! empty( $fallback ) ) {

			$fallback           = sanitize_text_field( $fallback );
			$feedback_full_path = realpath( $fallback );

			if ( false !== $feedback_full_path && @getimagesize( $fallback ) ) { // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
				$path = $feedback_full_path;
			}
		}

		$default = $path;

		if ( 'featuredImage' === $type ) {
			$image = get_post_thumbnail_id( $context );
			if ( $image ) {
				$path = wp_get_original_image_path( $image );
			}
		}

		if ( 'author' === $type ) {
			$author = get_post_field( 'post_author', $context );
			$path   = get_avatar_url( $author );
		}

		if ( 'loggedInUser' === $type ) {
			$user = get_current_user_id();

			if ( true === boolval( $user ) ) {
				$path = get_avatar_url( $user );
			}
		}

		if ( 'logo' === $type ) {
			$custom_logo_id = get_theme_mod( 'custom_logo' );

			if ( $custom_logo_id ) {
				$path = wp_get_original_image_path( $custom_logo_id );
			}
		}

		$path = apply_filters( 'otter_blocks_evaluate_dynamic_content_media_server', $path, $request );

		if ( $size = @getimagesize( $path ) ) { // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged, Squiz.PHP.DisallowMultipleAssignments.FoundInControlStructure
			ob_start();
				readfile( $path ); //phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_read_readfile
			$output = ob_get_contents();

			header( 'Content-type: ' . $size['mime'] );
			return $output;
		}

		ob_start();
			readfile( $path ); //phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_read_readfile
		$output = ob_get_contents();

		header( 'Content-type: ' . $size['mime'] );
		return $output;
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
