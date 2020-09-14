<?php
/**
 * Otter main class.
 *
 * @package @OtterBlocks
 */

/**
 * Class Otter_Blocks
 *
 * Otter Blocks class to initilize Guterberg Blocks.
 */
class Otter_Blocks {

	/**
	 * Otter_Blocks class instance.
	 *
	 * @since   1.0.0
	 * @access  public
	 * @var Otter_Blocks
	 */
	public static $instance = null;

	/**
	 * Rest route namespace.
	 *
	 * @var Otter_Blocks
	 */
	public $namespace = 'themeisle-gutenberg-blocks/';

	/**
	 * Rest route version.
	 *
	 * @var Otter_Blocks
	 */
	public $version = 'v1';

	/**
	 * Otter_Blocks constructor.
	 *
	 * @since   1.0.0
	 * @access  public
	 */
	public function __construct() {
		$this->name        = __( 'Otter', 'otter-blocks' );
		$this->description = __( 'Blocks for Gutenberg', 'otter-blocks' );
	}

	/**
	 * Method to define hooks needed.
	 *
	 * @since   1.0.0
	 * @access  public
	 */
	public function init() {
		add_action( 'enqueue_block_assets', array( $this, 'enqueue_block_assets' ) );
		add_action( 'init', array( $this, 'load_gutenberg_blocks' ) );
		add_action( 'admin_menu', array( $this, 'register_menu_page' ) );
		add_action( 'init', array( $this, 'register_settings' ), 99 );
		add_action( 'admin_init', array( $this, 'maybe_redirect' ) );
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Load assets for our blocks.
	 *
	 * @since   1.0.0
	 * @access  public
	 */
	public function enqueue_block_assets() {
		wp_register_style( 'font-awesome-5', plugins_url( 'assets/fontawesome/css/all.min.css', __FILE__ ), [], OTTER_BLOCKS_VERSION );
		wp_register_style( 'font-awesome-4-shims', plugins_url( 'assets/fontawesome/css/v4-shims.min.css', __FILE__ ), [], OTTER_BLOCKS_VERSION );

		if ( is_admin() ) {
			wp_enqueue_style( 'font-awesome-5' );
			wp_enqueue_style( 'font-awesome-4-shims' );
		}
	}

	/**
	 * Load Gutenberg Blocks
	 *
	 * @since   1.0.0
	 * @access  public
	 */
	public function load_gutenberg_blocks() {
		load_plugin_textdomain( 'otter-blocks', false, basename( dirname( __FILE__ ) ) . '/languages' );

		if ( class_exists( '\ThemeIsle\GutenbergCSS' ) && get_option( 'themeisle_blocks_settings_css_module', true ) ) {
			\ThemeIsle\GutenbergCSS::instance();
		}

		if ( class_exists( '\ThemeIsle\GutenbergAnimation' ) && get_option( 'themeisle_blocks_settings_blocks_animation', true ) ) {
			\ThemeIsle\GutenbergAnimation::instance();
		}

		if ( class_exists( '\ThemeIsle\GutenbergMenuIcons' ) && get_option( 'themeisle_blocks_settings_menu_icons', true ) ) {
			\ThemeIsle\GutenbergMenuIcons::instance();
		}

		if ( class_exists( '\ThemeIsle\GutenbergBlocks\Main' ) ) {
			\ThemeIsle\GutenbergBlocks\Main::instance( $this->name );
		}
	}

	/**
	 * Register Admin Page
	 *
	 * @since   1.2.0
	 * @access  public
	 */
	public function register_menu_page() {
		$page_hook_suffix = add_options_page(
			__( 'Otter', 'otter-blocks' ),
			__( 'Otter', 'otter-blocks' ),
			'manage_options',
			'otter',
			array( $this, 'menu_callback' )
		);

		add_action( "admin_print_scripts-{$page_hook_suffix}", array( $this, 'enqueue_options_assets' ) );
	}

	/**
	 * Register Settings
	 *
	 * @since   1.2.0
	 * @access  public
	 */
	public function register_settings() {
		register_setting(
			'themeisle_blocks_settings',
			'themeisle_blocks_settings_redirect',
			array(
				'type'         => 'boolean',
				'description'  => __( 'Redirect on new install.', 'otter-blocks' ),
				'show_in_rest' => true,
				'default'      => true,
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'themeisle_blocks_settings_tour',
			array(
				'type'         => 'boolean',
				'description'  => __( 'Show tour for Otter.', 'otter-blocks' ),
				'show_in_rest' => true,
				'default'      => true,
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'themeisle_blocks_settings_css_module',
			array(
				'type'         => 'boolean',
				'description'  => __( 'Custom CSS module allows to add custom CSS to each block in Block Editor.', 'otter-blocks' ),
				'show_in_rest' => true,
				'default'      => true,
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'themeisle_blocks_settings_blocks_animation',
			array(
				'type'         => 'boolean',
				'description'  => __( 'Blocks Animation module allows to add CSS animations to each block in Block Editor.', 'otter-blocks' ),
				'show_in_rest' => true,
				'default'      => true,
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'themeisle_blocks_settings_menu_icons',
			array(
				'type'         => 'boolean',
				'description'  => __( 'Menu Icons module allows to add icons to navigation menu items in Block Editor.', 'otter-blocks' ),
				'show_in_rest' => true,
				'default'      => true,
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'otter_blocks_logger_flag',
			array(
				'type'         => 'string',
				'description'  => __( 'Become a contributor by opting in to our anonymous data tracking. We guarantee no sensitive data is collected.', 'otter-blocks' ),
				'show_in_rest' => true,
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'otter_blocks_logger_data',
			array(
				'type'         => 'object',
				'description'  => __( 'Anonymous data tracking object.', 'otter-blocks' ),
				'show_in_rest' => array(
					'schema' => array(
						'type'       => 'object',
						'properties' => array(
							'blocks'     => array(
								'type'  => 'array',
								'items' => array(
									'type'       => 'object',
									'properties' => array(
										'name'       => array(
											'type' => 'string',
										),
										'instances'  => array(
											'type' => 'number',
										),
									),
								),
							),
							'templates'  => array(
								'type'  => 'array',
								'items' => array(
									'type'       => 'object',
									'properties' => array(
										'url'        => array(
											'type' => 'string',
										),
										'instances'  => array(
											'type' => 'number',
										),
									),
								),
							),
						),
					),
				),
				'default'      => array(
					'blocks' => array(),
					'templates' => array(),
				),
			)
		);
	}

	/**
	 * Load assets for option page.
	 *
	 * @since   1.2.0
	 * @access  public
	 */
	public function enqueue_options_assets() {
		if ( OTTER_BLOCKS_DEV ) {
			$version = time();
		} else {
			$version = OTTER_BLOCKS_VERSION;
		}

		$tour = get_option( 'themeisle_blocks_settings_tour' );

		$wp_upload_dir = wp_upload_dir( null, false );
		$basedir       = $wp_upload_dir['basedir'] . '/themeisle-gutenberg/';

		wp_enqueue_style(
			'otter-blocks-styles',
			plugins_url( 'build/build.css', __FILE__ ),
			array( 'wp-components' ),
			$version
		);

		wp_enqueue_script(
			'otter-blocks-scripts',
			plugins_url( 'build/build.js', __FILE__ ),
			array( 'react', 'react-dom', 'wp-api-fetch', 'wp-i18n', 'wp-api', 'wp-components', 'wp-element' ),
			$version,
			true
		);

		wp_localize_script(
			'otter-blocks-scripts',
			'otterObj',
			array(
				'version'     => OTTER_BLOCKS_VERSION,
				'assetsPath'  => plugins_url( 'assets/', __FILE__ ),
				'showTour'    => $tour,
				'stylesExist' => is_dir( $basedir ),
				'navExists'   => WP_Block_Type_Registry::get_instance()->is_registered( 'core/navigation' ),
			)
		);
	}

	/**
	 * Register Admin Page
	 *
	 * @since   1.2.0
	 * @access  public
	 */
	public function menu_callback() {
		echo '<div id="otter"></div>';
	}

	/**
	 * Maybe redirect to dashboard page.
	 *
	 * @since   1.2.0
	 * @access  public
	 */
	public function maybe_redirect() {
		if ( ! get_option( 'themeisle_blocks_settings_redirect' ) ) {
			return;
		}

		if ( defined( 'DOING_AJAX' ) && DOING_AJAX ) {
			return;
		}

		if ( is_network_admin() || isset( $_GET['activate-multi'] ) ) { //phpcs:ignore WordPress.VIP.SuperGlobalInputUsage.AccessDetected,WordPress.Security.NonceVerification.NoNonceVerification
			return;
		}

		if ( ! get_option( 'themeisle_blocks_settings_tour' ) ) {
			return;
		}

		update_option( 'themeisle_blocks_settings_redirect', false );
		wp_safe_redirect( admin_url( 'options-general.php?page=otter' ) );
		exit;
	}

	/**
	 * Register REST API route
	 *
	 * @since   1.5.3
	 * @access  public
	 */
	public function register_routes() {
		$namespace = $this->namespace . $this->version;

		register_rest_route(
			$namespace,
			'/regenerate_styles',
			array(
				array(
					'methods'             => \WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'regenerate_styles' ),
					'permission_callback' => function () {
						return current_user_can( 'manage_options' );
					},
				),
			)
		);
	}

	/**
	 * Function to delete Otter generated styles.
	 *
	 * @param \WP_REST_Request $request Rest request.
	 *
	 * @return mixed
	 * @since   1.5.3
	 * @access  public
	 */
	public function regenerate_styles( \WP_REST_Request $request ) {
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

		if ( ! is_dir( $basedir ) ) {
			return rest_ensure_response(
				array(
					'success' => false,
					'data'    => array(
						'message' => __( 'Sorry, the directory doesn\'t exist.', 'otter-blocks' ),
					),
				)
			);
		}

		$this->delete_files( $basedir );

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
	public function delete_files( $target ) {
		global $wp_filesystem;

		require_once ABSPATH . '/wp-admin/includes/file.php';
		WP_Filesystem();

		if ( is_dir( $target ) ) {
			$files = glob( $target . '*', GLOB_MARK );

			foreach ( $files as $file ) {
				$this->delete_files( $file );
			}

			$wp_filesystem->delete( $target, true );
		} elseif ( is_file( $target ) ) {
			$wp_filesystem->delete( $target, true );
		}
	}

	/**
	 * Instance Otter Blocks class.
	 *
	 * @static
	 * @since 1.0.0
	 * @access public
	 * @return Otter_Blocks
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
