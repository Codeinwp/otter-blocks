<?php
/**
 * Otter Dashboard.
 *
 * @package ThemeIsle\GutenbergBlocks\Plugins
 */

namespace ThemeIsle\GutenbergBlocks\Plugins;

use ThemeIsle\GutenbergBlocks\Pro;

/**
 * Class Dashboard
 */
class Dashboard {

	/**
	 * The main instance var.
	 *
	 * @var Dashboard
	 */
	protected static $instance = null;

	/**
	 * Initialize the class
	 */
	public function init() {
		add_action( 'admin_menu', array( $this, 'register_menu_page' ) );
		add_action( 'admin_init', array( $this, 'maybe_redirect' ) );
	}

	/**
	 * Register Admin Page
	 *
	 * @since   1.7.1
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
	 * Register Admin Page
	 *
	 * @since   1.7.1
	 * @access  public
	 */
	public function menu_callback() {
		echo '<div id="otter"></div>';
	}

	/**
	 * Load assets for option page.
	 *
	 * @since   1.7.1
	 * @access  public
	 */
	public function enqueue_options_assets() {
		$wp_upload_dir = wp_upload_dir( null, false );
		$basedir       = $wp_upload_dir['basedir'] . '/themeisle-gutenberg/';
		$asset_file    = include OTTER_BLOCKS_PATH . '/build/dashboard/index.asset.php';

		wp_enqueue_style(
			'otter-blocks-styles',
			OTTER_BLOCKS_URL . 'build/dashboard/style-index.css',
			array( 'wp-components' ),
			$asset_file['version']
		);

		wp_enqueue_script(
			'otter-blocks-scripts',
			OTTER_BLOCKS_URL . 'build/dashboard/index.js',
			$asset_file['dependencies'],
			$asset_file['version'],
			true
		);

		wp_set_script_translations( 'otter-blocks-scripts', 'otter-blocks' );

		wp_localize_script(
			'otter-blocks-scripts',
			'otterObj',
			apply_filters(
				'otter_dashboard_data',
				array(
					'version'            => OTTER_BLOCKS_VERSION,
					'assetsPath'         => OTTER_BLOCKS_URL . 'assets/',
					'stylesExist'        => is_dir( $basedir ) || boolval( get_transient( 'otter_animations_parsed' ) ),
					'hasPro'             => Pro::is_pro_installed(),
					'upgradeLink'        => tsdk_utmify( Pro::get_url(), 'options', Pro::get_reference() ),
					'docsLink'           => Pro::get_docs_url(),
					'showFeedbackNotice' => $this->should_show_feedback_notice(),
				)
			)
		);
	}

	/**
	 * Maybe redirect to dashboard page.
	 *
	 * @since   1.7.1
	 * @access  public
	 */
	public function maybe_redirect() {
		if ( ! get_option( 'themeisle_blocks_settings_redirect' ) ) {
			return;
		}

		if ( defined( 'DOING_AJAX' ) && DOING_AJAX ) {
			return;
		}

		if ( is_network_admin() || isset( $_GET['activate-multi'] ) ) { // phpcs:ignore WordPress.VIP.SuperGlobalInputUsage.AccessDetected,WordPress.Security.NonceVerification.NoNonceVerification
			return;
		}

		update_option( 'themeisle_blocks_settings_redirect', false );
		wp_safe_redirect( admin_url( 'options-general.php?page=otter' ) );
		exit;
	}

	/**
	 * Whether to show the feedback notice or not.
	 *
	 * @return bool
	 */
	private function should_show_feedback_notice() {
		$installed = get_option( 'otter_blocks_install' );

		return ! empty( $installed ) && $installed < strtotime( '-5 days' );
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.7.1
	 * @access public
	 * @return Dashboard
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
	 * @since 1.7.1
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
	 * @since 1.7.1
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}
}
