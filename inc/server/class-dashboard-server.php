<?php
/**
 * Dashboard server logic.
 *
 * @package ThemeIsle\GutenbergBlocks\Server
 */

namespace ThemeIsle\GutenbergBlocks\Server;

/**
 * Class Dashboard_Server
 */
class Dashboard_Server {

	/**
	 * The main instance var.
	 *
	 * @var Dashboard_Server
	 */
	public static $instance = null;

	/**
	 * Rest route namespace.
	 *
	 * @var Dashboard_Server
	 */
	public $namespace = 'otter/';

	/**
	 * Rest route version.
	 *
	 * @var Dashboard_Server
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
			'/regenerate',
			array(
				array(
					'methods'             => \WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'rest_regenerate_styles' ),
					'permission_callback' => function () {
						return current_user_can( 'manage_options' );
					},
				),
			)
		);
	}

	/**
	 * Regenerate styles.
	 *
	 * @param \WP_REST_Request $request The request.
	 * 
	 * @return \WP_REST_Response
	 * @since   2.0.9
	 * @access  public
	 */
	public function rest_regenerate_styles( \WP_REST_Request $request ) {
		return self::regenerate_styles();
	}

	/**
	 * Function to delete Otter generated styles.
	 *
	 * @return mixed
	 * @since   1.5.3
	 * @access  public
	 */
	public static function regenerate_styles() {
		global $wp_filesystem;

		if ( ! current_user_can( 'edit_posts' ) ) {
			return;
		}

		require_once ABSPATH . '/wp-admin/includes/file.php';
		WP_Filesystem();

		$wp_upload_dir = wp_upload_dir( null, false );
		$basedir       = $wp_upload_dir['basedir'] . '/themeisle-gutenberg/';

		if ( ! $wp_filesystem->is_writable( $wp_upload_dir['basedir'] ) ) {
			return rest_ensure_response(
				array(
					'success' => false,
					'data'    => array(
						'message' => __( 'Sorry, the filesystem isn\'t writeable.', 'otter-blocks' ),
					),
				)
			);
		}

		$transient_deleted = false;

		if ( get_transient( 'otter_animations_parsed' ) ) {
			delete_transient( 'otter_animations_parsed' );
			$transient_deleted = true;
		}


		if ( ! is_dir( $basedir ) ) {
			return rest_ensure_response(
				array(
					'success' => false,
					'data'    => array(
						'message' => $transient_deleted ? __( 'Optimized code deleted.', 'otter-blocks' ) : __( 'Sorry, the directory doesn\'t exist.', 'otter-blocks' ),
					),
				)
			);
		}

		self::delete_files( $basedir );

		delete_post_meta_by_key( '_themeisle_gutenberg_block_stylesheet' );
		delete_post_meta_by_key( '_themeisle_gutenberg_block_styles' );
		delete_post_meta_by_key( '_themeisle_gutenberg_block_fonts' );

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'message' => __( 'Styles deleted.', 'otter-blocks' ),
				),
			)
		);
	}

	/**
	 * Function to delete Otter generated styles.
	 *
	 * @param string $target File path.
	 *
	 * @since   1.5.3
	 * @access  public
	 */
	public static function delete_files( $target ) {
		global $wp_filesystem;

		require_once ABSPATH . '/wp-admin/includes/file.php';
		WP_Filesystem();

		if ( is_dir( $target ) ) {
			$files = glob( $target . '*', GLOB_MARK );

			foreach ( $files as $file ) {
				self::delete_files( $file );
			}

			$wp_filesystem->delete( $target, true );
		} elseif ( is_file( $target ) ) {
			$wp_filesystem->delete( $target, true );
		}
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.7.0
	 * @access public
	 * @return Dashboard_Server
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
