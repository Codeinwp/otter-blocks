<?php
/**
 * Css handler.
 *
 * @package ThemeIsle\GutenbergBlocks\CSS
 */

namespace ThemeIsle\GutenbergBlocks\CSS;

use ThemeIsle\GutenbergBlocks\Base_CSS;

use tubalmartin\CssMin\Minifier as CSSmin;

/**
 * Class CSS_Handler
 */
class CSS_Handler extends Base_CSS {

	/**
	 * The main instance var.
	 *
	 * @var CSS_Handler
	 */
	public static $instance = null;

	/**
	 * Initialize the class
	 */
	public function init() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
		add_action( 'rest_api_init', array( $this, 'autoload_block_classes' ) );
		add_action( 'before_delete_post', array( __CLASS__, 'delete_css_file' ) );
		add_action( 'customize_save_after', array( __CLASS__, 'save_widgets_styles' ) );
	}

	/**
	 * Register REST API route
	 *
	 * @since   1.3.0
	 * @access  public
	 */
	public function register_routes() {
		$namespace = $this->namespace . $this->version;

		register_rest_route(
			$namespace,
			'/post_styles/(?P<id>\d+)',
			array(
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'save_post_meta' ),
					'args'                => array(
						'id' => array(
							'type'              => 'integer',
							'required'          => true,
							'description'       => __( 'ID of the Post.', 'otter-blocks' ),
							'validate_callback' => function ( $param, $request, $key ) {
								return is_numeric( $param );
							},
						),
					),
					'permission_callback' => function () {
						return current_user_can( 'publish_posts' );
					},
				),
			)
		);

		register_rest_route(
			$namespace,
			'/block_styles/(?P<id>\d+)',
			array(
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'save_block_meta' ),
					'args'                => array(
						'id' => array(
							'type'              => 'integer',
							'required'          => true,
							'description'       => __( 'ID of the Reusable Block.', 'otter-blocks' ),
							'validate_callback' => function ( $param, $request, $key ) {
								return is_numeric( $param );
							},
						),
					),
					'permission_callback' => function () {
						return current_user_can( 'publish_posts' );
					},
				),
			)
		);

		register_rest_route(
			$namespace,
			'/widget_styles',
			array(
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'save_widgets_styles' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_theme_options' );
					},
				),
			)
		);
	}

	/**
	 * Function to save post CSS.
	 *
	 * @param \WP_REST_Request $request Rest request.
	 *
	 * @return mixed
	 * @since   1.3.0
	 * @access  public
	 */
	public function save_post_meta( \WP_REST_Request $request ) {
		if ( ! current_user_can( 'edit_posts' ) ) {
			return false;
		}

		$post_id = $request->get_param( 'id' );
		self::generate_css_file( $post_id );

		return rest_ensure_response( array( 'message' => __( 'CSS updated.', 'otter-blocks' ) ) );
	}

	/**
	 * Generate CSS file.
	 *
	 * @param int $post_id Post id.
	 */
	public static function generate_css_file( $post_id ) {
		$css = self::instance()->get_blocks_css( $post_id );
		self::save_css_file( $post_id, $css );
	}

	/**
	 * Get CSS url for post.
	 *
	 * @param int/string $type Post ID or Widget.
	 *
	 * @return string File url.
	 */
	public static function get_css_url( $type = 'widgets' ) {
		$file_name = '';

		if ( 'widgets' === $type ) {
			$file_name = get_option( 'themeisle_blocks_widgets_css_file' );
		} else {
			$file_name = get_post_meta( $type, '_themeisle_gutenberg_block_stylesheet', true );
		}

		if ( empty( $file_name ) ) {
			return false;
		}

		$wp_upload_dir = wp_upload_dir( null, false );
		$baseurl       = $wp_upload_dir['baseurl'] . '/themeisle-gutenberg/';

		return $baseurl . $file_name . '.css';
	}

	/**
	 * Check if we have a CSS file for this post.
	 *
	 * @param int/string $type Post ID or Widget.
	 *
	 * @return bool
	 */
	public static function has_css_file( $type = 'widgets' ) {
		$file_name = '';

		if ( 'widgets' === $type ) {
			$file_name = get_option( 'themeisle_blocks_widgets_css_file' );
		} else {
			$file_name = get_post_meta( $type, '_themeisle_gutenberg_block_stylesheet', true );
		}

		if ( empty( $file_name ) ) {
			return false;
		}

		$wp_upload_dir = wp_upload_dir( null, false );
		$basedir       = $wp_upload_dir['basedir'] . '/themeisle-gutenberg/';
		$file_path     = $basedir . $file_name . '.css';

		return is_file( $file_path );
	}

	/**
	 * Function to save reusable block CSS.
	 *
	 * @param \WP_REST_Request $request Rest request.
	 *
	 * @return mixed
	 * @since   1.3.0
	 * @access  public
	 */
	public function save_block_meta( \WP_REST_Request $request ) {
		if ( ! current_user_can( 'edit_posts' ) ) {
			return false;
		}

		$post_id = $request->get_param( 'id' );
		$css     = $this->get_reusable_block_css( $post_id );

		self::save_css_file( $post_id, $css );

		return rest_ensure_response( array( 'message' => __( 'CSS updated.', 'otter-blocks' ) ) );
	}


	/**
	 * Function to save CSS into WordPress Filesystem.
	 *
	 * @param int    $post_id Post id.
	 * @param string $css CSS string.
	 *
	 * @return bool
	 * @since   1.3.0
	 * @access  public
	 */
	public static function save_css_file( $post_id, $css ) {
		if ( empty( $css ) ) {
			return self::delete_css_file( $post_id );
		}

		global $wp_filesystem;
		require_once ABSPATH . '/wp-admin/includes/file.php';
		WP_Filesystem();

		$file_name     = 'post-v2-' . $post_id . '-' . time();
		$wp_upload_dir = wp_upload_dir( null, false );
		$upload_dir    = $wp_upload_dir['basedir'] . '/themeisle-gutenberg/';
		$file_path     = $upload_dir . $file_name . '.css';

		$css = wp_filter_nohtml_kses( $css );

		$css = self::compress( $css );

		update_post_meta( $post_id, '_themeisle_gutenberg_block_styles', $css );

		$existing_file      = get_post_meta( $post_id, '_themeisle_gutenberg_block_stylesheet', true );
		$existing_file_path = $upload_dir . $existing_file . '.css';

		if ( $existing_file && is_file( $existing_file_path ) ) {
			self::delete_css_file( $post_id );
		}

		if ( count( self::$google_fonts ) > 0 ) {
			update_post_meta( $post_id, '_themeisle_gutenberg_block_fonts', self::$google_fonts );
		} else {
			if ( get_post_meta( $post_id, '_themeisle_gutenberg_block_fonts', true ) ) {
				delete_post_meta( $post_id, '_themeisle_gutenberg_block_fonts' );
			}
		}

		if ( self::is_writable() ) {
			$target_dir = $wp_filesystem->is_dir( $upload_dir );

			if ( ! $wp_filesystem->is_writable( $wp_upload_dir['basedir'] ) ) {
				return false;
			}

			if ( ! $target_dir ) {
				wp_mkdir_p( $upload_dir );
			}

			$wp_filesystem->put_contents( $file_path, $css, FS_CHMOD_FILE );

			if ( file_exists( $file_path ) ) {
				update_post_meta( $post_id, '_themeisle_gutenberg_block_stylesheet', $file_name );
			}
		}

		return true;
	}

	/**
	 * Function to delete CSS from WordPress Filesystem.
	 *
	 * @param int $post_id Post id.
	 *
	 * @return bool
	 * @since   1.3.0
	 * @access  public
	 */
	public static function delete_css_file( $post_id ) {
		global $wp_filesystem;

		if ( ! current_user_can( 'edit_posts' ) ) {
			return false;
		}

		require_once ABSPATH . '/wp-admin/includes/file.php';
		WP_Filesystem();

		$wp_upload_dir = wp_upload_dir( null, false );

		if ( ! $wp_filesystem->is_writable( $wp_upload_dir['basedir'] ) ) {
			return;
		}

		$file_name = get_post_meta( $post_id, '_themeisle_gutenberg_block_stylesheet', true );

		if ( $file_name ) {
			delete_post_meta( $post_id, '_themeisle_gutenberg_block_stylesheet' );
		}

		$upload_dir = $wp_upload_dir['basedir'] . '/themeisle-gutenberg/';
		$file_path  = $upload_dir . $file_name . '.css';


		if ( ! file_exists( $file_path ) || ! self::is_writable() ) {
			return;
		}

		$wp_filesystem->delete( $file_path, true );

		return true;
	}

	/**
	 * Function to save/resave widget styles.
	 *
	 * @return  bool
	 * @since   1.7.0
	 * @access  public
	 */
	public static function save_widgets_styles() {
		global $wp_filesystem;
		require_once ABSPATH . '/wp-admin/includes/file.php';
		WP_Filesystem();

		$css = self::instance()->get_widgets_css();

		if ( empty( $css ) ) {
			$file_path = get_option( 'themeisle_blocks_widgets_css_file' );

			if ( ! file_exists( $file_path ) ) {
				return false;
			}

			delete_option( 'themeisle_blocks_widgets_css_file' );
			delete_option( 'themeisle_blocks_widgets_css' );

			return $wp_filesystem->delete( $file_path, true );
		}

		if ( count( self::$google_fonts ) > 0 ) {
			update_option( 'themeisle_blocks_widgets_fonts', self::$google_fonts );
		} else {
			if ( get_option( 'themeisle_blocks_widgets_fonts' ) ) {
				delete_option( 'themeisle_blocks_widgets_fonts' );
			}
		}

		$file_name     = 'widgets-' . time();
		$wp_upload_dir = wp_upload_dir( null, false );
		$upload_dir    = $wp_upload_dir['basedir'] . '/themeisle-gutenberg/';
		$file_path     = $upload_dir . $file_name . '.css';

		$css = wp_filter_nohtml_kses( $css );

		$css = self::compress( $css );

		update_option( 'themeisle_blocks_widgets_css', $css );

		if ( self::is_writable() ) {
			$existing_file      = get_option( 'themeisle_blocks_widgets_css_file' );
			$existing_file_path = $upload_dir . $existing_file . '.css';

			if ( $existing_file && is_file( $existing_file_path ) ) {
				$wp_filesystem->delete( $existing_file_path, true );
			}

			$target_dir = $wp_filesystem->is_dir( $upload_dir );

			if ( ! $wp_filesystem->is_writable( $wp_upload_dir['basedir'] ) ) {
				return false;
			}

			if ( ! $target_dir ) {
				wp_mkdir_p( $upload_dir );
			}

			$wp_filesystem->put_contents( $file_path, $css, FS_CHMOD_FILE );

			if ( file_exists( $file_path ) ) {
				update_option( 'themeisle_blocks_widgets_css_file', $file_name );
			}
		}

		return true;
	}

	/**
	 * Check if the path is writable.
	 *
	 * @return boolean
	 * @since   2.0.0
	 * @access  public
	 */
	public static function is_writable() {
		global $wp_filesystem;
		include_once ABSPATH . 'wp-admin/includes/file.php';
		WP_Filesystem();

		$wp_upload_dir = wp_upload_dir( null, false );
		$upload_dir    = $wp_upload_dir['basedir'];

		if ( ! function_exists( 'WP_Filesystem' ) ) {
			return false;
		}

		$writable = WP_Filesystem( false, $upload_dir );

		return $writable && 'direct' === $wp_filesystem->method;
	}

	/**
	 * Compress CSS
	 *
	 * @param string $css Compress css.
	 *
	 * @return string Compressed css.
	 * @since   1.3.0
	 * @access  public
	 */
	public static function compress( $css ) {
		$compressor = new CSSmin();

		// Override any PHP configuration options before calling run().
		$compressor->setMemoryLimit( '256M' );
		$compressor->setMaxExecutionTime( 120 );
		$compressor->setPcreBacktrackLimit( 3000000 );
		$compressor->setPcreRecursionLimit( 150000 );

		$css = htmlspecialchars_decode( $css );
		$css = $compressor->run( $css );

		return $css;
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @return CSS_Handler
	 * @since 1.3.0
	 * @access public
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
	 * @return void
	 * @since 1.3.0
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
	 * @since 1.3.0
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}
}
