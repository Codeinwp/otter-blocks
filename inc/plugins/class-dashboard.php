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
		$otter_icon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyOSAzMiIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZjBmNmZjIj4KPHBhdGggZD0iTTE5LjgzMSA3Ljg3N2MwLjAwMS0wLjAwMyAwLjAwMS0wLjAwNSAwLjAwMS0wLjAwOXMtMC0wLjAwNi0wLjAwMS0wLjAwOWwwIDBjLTAuMDQ3LTAuMDgxLTAuMDkyLTAuMTY0LTAuMTMyLTAuMjQ3bC0wLjA1Ny0wLjExNWMtMC4yNzctMC40OTgtMC4zODEtMC45OS0xLjAzMy0xLjA2NGgtMC4wNDVjLTAuMDAxIDAtMC4wMDIgMC0wLjAwMyAwLTAuNDg2IDAtMC44ODMgMC4zODItMC45MDggMC44NjJsLTAgMC4wMDJjMC42NzQgMC4xMjYgMS4yNTIgMC4yNzggMS44MTMgMC40NjhsLTAuMDkyLTAuMDI3IDAuMjgzIDAuMDk2IDAuMTQ3IDAuMDUzczAuMDI4IDAgMC4wMjgtMC4wMTF6IiAvPgo8cGF0aCBkPSJNMjMuOTgyIDEzLjU3NGMtMC4wMDgtMi40MS0wLjE0LTQuNzc4LTAuMzktNy4xMTJsMC4wMjYgMC4yOTkgMC4wNzAtMC4wMTljMC40NTktMC4xMzkgMC43ODctMC41NTggMC43ODctMS4wNTMgMC0wLjQ3OS0wLjMwNy0wLjg4Ny0wLjczNS0xLjAzN2wtMC4wMDgtMC4wMDJoLTAuMDI2Yy0wLjQ3OS0wLjE2NC0wLjg3NC0wLjQ2OC0xLjE0OS0wLjg2MWwtMC4wMDUtMC4wMDdjLTIuNy0zLjk2LTguMjUyLTMuNzgxLTguMjUyLTMuNzgxcy01LjU1LTAuMTc5LTguMjUgMy43ODFjLTAuMjggMC40MDEtMC42NzYgMC43MDQtMS4xNCAwLjg2MmwtMC4wMTYgMC4wMDVjLTAuNDQxIDAuMTQ4LTAuNzU0IDAuNTU3LTAuNzU0IDEuMDQwIDAgMC4wMDkgMCAwLjAxNyAwIDAuMDI2bC0wLTAuMDAxYy0wIDAuMDEwLTAuMDAxIDAuMDIyLTAuMDAxIDAuMDM0IDAgMC40OTMgMC4zMzUgMC45MDcgMC43ODkgMS4wMjlsMC4wMDcgMC4wMDIgMC4wNDUgMC4wMTFjLTAuMjI0IDIuMDM0LTAuMzU2IDQuNDAzLTAuMzY0IDYuODAxbC0wIDAuMDEycy05LjQ5MyAxMy4wMTItMS4yNzcgMTcuNTE1YzQuNzMzIDIuNDMxIDYuODgxLTAuNzY5IDYuODgxLTAuNzY5czEuMzk3LTEuNjYxLTEuNzg0LTMuMzU1di00LjYwOWMwLjAwNi0wLjM0NCAwLjI4Mi0wLjYyMSAwLjYyNS0wLjYyOGgxLjIxMnYtMC41OWMwLTAuMjc1IDAuMjIzLTAuNDk4IDAuNDk4LTAuNDk4djBoMS42NjVjMC4yNzQgMC4wMDEgMC40OTYgMC4yMjQgMC40OTYgMC40OTggMCAwIDAgMCAwIDB2MCAwLjU5aDIuNzIxdi0wLjU5YzAtMC4yNzUgMC4yMjMtMC40OTggMC40OTgtMC40OTh2MGgxLjY2NWMwLjI3MSAwLjAwNSAwLjQ5IDAuMjI2IDAuNDkgMC40OTggMCAwIDAgMCAwIDB2MCAwLjU5aDEuMjA5YzAgMCAwIDAgMCAwIDAuMzQ5IDAgMC42MzMgMC4yOCAwLjYzOSAwLjYyN3Y0LjU4NGMtMy4xOTMgMS43MDMtMS43ODQgMy4zNTUtMS43ODQgMy4zNTVzMi4xNDggMy4xOTMgNi44NzkgMC43NjljOC4yMjItNC41MDMtMS4yNjktMTcuNTE1LTEuMjY5LTE3LjUxNXpNMjIuNTg2IDEwLjI2MWMtMC4wOTcgMS40NjEtMC42NyAyLjc3Mi0xLjU2MyAzLjc5N2wwLjAwNy0wLjAwOGMtMS43MDMgMi4wMTAtNC40MDcgMy4yNDktNi43MjEgNC40MzJ2MGMtMi4zMjUtMS4xNzctNS4wMjYtMi40MTYtNi43MzYtNC40MzItMC44ODMtMS4wMTktMS40NTUtMi4zMjktMS41NTUtMy43NjlsLTAuMDAxLTAuMDIwYy0wLjEyNi0yLjIyIDAuNTgzLTUuOTI5IDMuMDQ0LTYuNzQgMi40MTYtMC43ODggMy45NDcgMS4yODggNC40OTQgMi4yMjcgMC4xNTIgMC4yNTggMC40MjkgMC40MjggMC43NDUgMC40MjhzMC41OTMtMC4xNyAwLjc0My0wLjQyNGwwLjAwMi0wLjAwNGMwLjU1MS0wLjkzMiAyLjA4MC0zLjAwOCA0LjQ5NC0yLjIyIDIuNDc0IDAuODA1IDMuMTc0IDQuNTEzIDMuMDQ2IDYuNzM0eiIgLz4KPHBhdGggZD0iTTE5LjQ2MyAxMC4wODdoLTAuMDI4Yy0wLjE5MiAwLjAyNi0wLjEyMSAwLjI1MS0wLjA0NyAwLjM1NiAwLjI1NCAwLjM0OSAwLjQwNyAwLjc4NyAwLjQwNyAxLjI2IDAgMC4wMDYtMCAwLjAxMi0wIDAuMDE4di0wLjAwMWMtMC4wMDEgMC40NjktMC4yNTUgMC44NzgtMC42MzMgMS4xbC0wLjAwNiAwLjAwM2MtMC43MzkgMC40MjYtMS4zNzctMC4xNDUtMi4wNTQtMC4zOTgtMC43Mi0wLjI2OS0xLjU1Mi0wLjQzNC0yLjQyLTAuNDU1bC0wLjAwOS0wdi0xLjAzM2MxLjAyMC0wLjIzMyAxLjg5NC0wLjc2IDIuNTUxLTEuNDg2bDAuMDA0LTAuMDA0YzAuMTUxLTAuMTYzIDAuMjQ0LTAuMzgzIDAuMjQ0LTAuNjIzIDAtMC4zMTYtMC4xNTktMC41OTUtMC40MDItMC43NmwtMC4wMDMtMC4wMDJjLTAuNzY4LTAuNTUxLTEuNzI4LTAuODgxLTIuNzY0LTAuODgxLTEuMDU0IDAtMi4wMjkgMC4zNDEtMi44MTkgMC45MmwwLjAxMy0wLjAwOWMtMC4yMjQgMC4xNjYtMC4zNjcgMC40MjktMC4zNjcgMC43MjYgMCAwLjIyNiAwLjA4MyAwLjQzMyAwLjIyMSAwLjU5MWwtMC4wMDEtMC4wMDFjMC42NjUgMC43NTEgMS41NSAxLjI5NSAyLjU1MyAxLjUzbDAuMDMzIDAuMDA3djEuMDUwYy0wLjc0MiAwLjAyMS0xLjQ0OCAwLjE0LTIuMTE4IDAuMzQzbDAuMDU3LTAuMDE1Yy0wLjM0MSAwLjEwMy0wLjYzMSAwLjIxOS0wLjkwOCAwLjM1OGwwLjAzMy0wLjAxNWMtMC41MTkgMC4yNi0xLjAzNyAwLjQzNi0xLjU4IDAuMTIxLTAuMzcxLTAuMjEzLTAuNjE3LTAuNjA3LTAuNjE3LTEuMDU4IDAtMC4wMDIgMC0wLjAwNCAwLTAuMDA3djBjMC0wLjAwMiAwLTAuMDA0IDAtMC4wMDcgMC0wLjQ3IDAuMTUzLTAuOTA1IDAuNDExLTEuMjU3bC0wLjAwNCAwLjAwNmMwLjA0Ny0wLjA2OCAwLjA4OS0wLjE3IDAuMDI2LTAuMjQxcy0wLjE4OSAwLTAuMjcgMC4wMzBjLTAuMTg5IDAuMDk5LTAuMzQ4IDAuMjI3LTAuNDc5IDAuMzgxbC0wLjAwMiAwLjAwMmMtMC4yNDUgMC4yOTYtMC4zOTQgMC42NzktMC4zOTQgMS4wOTcgMCAwLjAwNCAwIDAuMDA3IDAgMC4wMTF2LTAuMDAxYzAuMDA4IDAuNzA2IDAuMzkzIDEuMzIxIDAuOTY0IDEuNjUxbDAuMDA5IDAuMDA1YzAuMjk2IDAuMTc4IDAuNjU0IDAuMjgzIDEuMDM2IDAuMjgzIDAuMzY0IDAgMC43MDYtMC4wOTUgMS4wMDEtMC4yNjNsLTAuMDEwIDAuMDA1YzAuODc3LTAuNDYxIDEuOTE3LTAuNzMxIDMuMDE5LTAuNzMxIDAuMDY5IDAgMC4xMzcgMC4wMDEgMC4yMDYgMC4wMDNsLTAuMDEwLTBoMC4wMzBjMS4yNzcgMCAyLjM4MiAwLjI2NiAzLjI2NiAwLjc3NSAwLjI3IDAuMTU5IDAuNTk0IDAuMjUzIDAuOTQgMC4yNTMgMC4wMDEgMCAwLjAwMiAwIDAuMDAzIDBoLTBjMC4zNTUtMC4wMDIgMC42ODgtMC4wOTggMC45NzQtMC4yNjVsLTAuMDA5IDAuMDA1YzAuNjA2LTAuMzU3IDEuMDA3LTEuMDA3IDEuMDA3LTEuNzUgMC0wLjAwMSAwLTAuMDAzIDAtMC4wMDR2MGMwLjAwMS0wLjAyNiAwLjAwMi0wLjA1NiAwLjAwMi0wLjA4NiAwLTAuNjI1LTAuMzQtMS4xNzEtMC44NDYtMS40NjJsLTAuMDA4LTAuMDA0Yy0wLjA1Ni0wLjA0MC0wLjEyNS0wLjA2NS0wLjE5OS0wLjA3MGwtMC4wMDEtMHpNMTMuMTAxIDguODMxYy0wLjIzOCAwLjIxMy0wLjQ2OCAwLjU4MS0wLjgzMiAwLjM0NS0wLjA2MS0wLjA0MS0wLjExNC0wLjA4Ni0wLjE2MS0wLjEzNmwtMC0wYy0wLjA2My0wLjA2My0wLjEwMS0wLjE1LTAuMTAxLTAuMjQ3IDAtMC4xMzMgMC4wNzQtMC4yNDggMC4xODItMC4zMDhsMC4wMDItMC4wMDFjMC41OTQtMC4zMDkgMS4yMDMtMC41NDMgMS44ODQtMC40OS0wLjMyNCAwLjI4MS0wLjY0OSAwLjU2LTAuOTczIDAuODM3eiIgLz4KPHBhdGggZD0iTTE1Ljg5IDEzLjU3OGMtMC4zNjcgMC40ODMtMC45NDEgMC43OTItMS41ODggMC43OTJzLTEuMjIxLTAuMzA5LTEuNTg1LTAuNzg3bC0wLjAwNC0wLjAwNWMtMC4wNjQtMC4xMDMtMC4xNzctMC4xNzEtMC4zMDYtMC4xNzEtMC4xOTkgMC0wLjM2IDAuMTYxLTAuMzYgMC4zNiAwIDAuMDkxIDAuMDM0IDAuMTc0IDAuMDkwIDAuMjM4bC0wLTBjMC40OTkgMC42NTkgMS4yODMgMS4wODAgMi4xNjQgMS4wODBzMS42NjUtMC40MjEgMi4xNTktMS4wNzNsMC4wMDUtMC4wMDdjMC4wNDMtMC4wNTkgMC4wNjgtMC4xMzIgMC4wNjgtMC4yMTIgMC0wLjExNi0wLjA1NS0wLjIyLTAuMTQtMC4yODZsLTAuMDAxLTAuMDAxYy0wLjA1OS0wLjA0NS0wLjEzNC0wLjA3Mi0wLjIxNS0wLjA3Mi0wLjExNyAwLTAuMjIxIDAuMDU2LTAuMjg2IDAuMTQzbC0wLjAwMSAwLjAwMXoiIC8+CjxwYXRoIGQ9Ik0xOC41MDcgMTEuNzA3YzAgMC4xOTQtMC4xNTcgMC4zNTEtMC4zNTEgMC4zNTFzLTAuMzUxLTAuMTU3LTAuMzUxLTAuMzUxYzAtMC4xOTQgMC4xNTctMC4zNTEgMC4zNTEtMC4zNTFzMC4zNTEgMC4xNTcgMC4zNTEgMC4zNTF6IiAvPgo8cGF0aCBkPSJNMTcuMzg5IDExLjA0OWMwIDAuMTk0LTAuMTU3IDAuMzUxLTAuMzUxIDAuMzUxcy0wLjM1MS0wLjE1Ny0wLjM1MS0wLjM1MWMwLTAuMTk0IDAuMTU3LTAuMzUxIDAuMzUxLTAuMzUxczAuMzUxIDAuMTU3IDAuMzUxIDAuMzUxeiIgLz4KPHBhdGggZD0iTTEwLjc5OCAxMS43MDdjMCAwLjE5NC0wLjE1NyAwLjM1MS0wLjM1MSAwLjM1MXMtMC4zNTEtMC4xNTctMC4zNTEtMC4zNTFjMC0wLjE5NCAwLjE1Ny0wLjM1MSAwLjM1MS0wLjM1MXMwLjM1MSAwLjE1NyAwLjM1MSAwLjM1MXoiIC8+CjxwYXRoIGQ9Ik0xMS45MTggMTEuMDQ5YzAgMC4xOTQtMC4xNTcgMC4zNTEtMC4zNTEgMC4zNTFzLTAuMzUxLTAuMTU3LTAuMzUxLTAuMzUxYzAtMC4xOTQgMC4xNTctMC4zNTEgMC4zNTEtMC4zNTFzMC4zNTEgMC4xNTcgMC4zNTEgMC4zNTF6IiAvPgo8cGF0aCBkPSJNOC43NzMgNy44NzdjLTAuMDAxLTAuMDAzLTAuMDAyLTAuMDA1LTAuMDAyLTAuMDA5czAuMDAxLTAuMDA2IDAuMDAyLTAuMDA5bC0wIDBjMC4wNDctMC4wODEgMC4wODktMC4xNjQgMC4xMzItMC4yNDcgMC4wMTktMC4wMzggMC4wMzYtMC4wNzkgMC4wNTctMC4xMTUgMC4yNzUtMC40OTggMC4zNzktMC45OSAxLjAzMy0xLjA2NGgwLjA0NWMwIDAgMC4wMDEgMCAwLjAwMSAwIDAuNDg3IDAgMC44ODQgMC4zODIgMC45MSAwLjg2MmwwIDAuMDAyYy0wLjY3OCAwLjEyNC0xLjI2MSAwLjI3Ny0xLjgyNyAwLjQ2OGwwLjA5Mi0wLjAyNy0wLjI3NSAwLjA5Ni0wLjEgMC4wMzYtMC4wNDUgMC4wMTdzLTAuMDIzIDAtMC4wMjMtMC4wMTF6IiAvPgo8L3N2Zz4K';

		$page_hook_suffix = add_menu_page(
			__( 'Settings', 'otter-blocks' ),
			__( 'Otter', 'otter-blocks' ),
			'manage_options',
			'otter',
			array( $this, 'menu_callback' ),
			$otter_icon
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
