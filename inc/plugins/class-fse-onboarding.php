<?php
/**
 * Otter FSE_Onboarding.
 *
 * @package ThemeIsle\GutenbergBlocks\Plugins
 */

namespace ThemeIsle\GutenbergBlocks\Plugins;

use ThemeIsle\GutenbergBlocks\Pro;

/**
 * Class FSE_Onboarding
 */
class FSE_Onboarding {

	const OPTION_KEY  = 'otter_onboarding_status';
	const SUPPORT_KEY = 'otter-onboarding';

	/**
	 * The main instance var.
	 *
	 * @var FSE_Onboarding|null
	 */
	protected static $instance = null;

	/**
	 * Initialize the class
	 */
	public function init() {
		add_action( 'after_switch_theme', array( $this, 'on_switch_theme' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_options_assets' ) );
		add_action( 'admin_menu', array( $this, 'register_menu_page' ) );
	}

	/**
	 * Register menu page
	 * 
	 * @access public
	 * @return void
	 */
	public function register_menu_page() {
		$has_support = get_theme_support( self::SUPPORT_KEY );

		if ( false === $has_support || ! current_user_can( 'manage_options' ) || true !== boolval( get_option( 'themeisle_blocks_settings_onboarding_wizard', true ) ) ) {
			return;
		}

		add_submenu_page(
			'themes.php',
			esc_html__( 'Theme Setup', 'otter-blocks' ),
			esc_html__( 'Theme Setup', 'otter-blocks' ),
			'manage_options',
			'otter-onboarding',
			function() {
				$redirect = add_query_arg(
					array(
						'onboarding' => 'true',
					),
					admin_url( 'site-editor.php' )
				);

				echo '<p>Redirecting...</p>
				<script>document.location.href = "' . esc_url( $redirect ) . '";</script>';
			}
		);
	}

	/**
	 * On switch theme
	 * 
	 * @access public
	 * @return void
	 */
	public function on_switch_theme() {
		// Check if the theme has support for FSE.
		$support = get_theme_support( self::SUPPORT_KEY );

		if ( false === $support ) {
			return;
		}

		$status = get_option( self::OPTION_KEY, array() );
		$slug   = get_stylesheet();

		if ( ! empty( $status[ $slug ] ) ) {
			return;
		}

		// Flag onboarding status in case being run from a theme.
		self::set_onboarding_status();

		// Run the onboarding.
		$redirect = add_query_arg(
			array(
				'onboarding' => 'true',
			),
			admin_url( 'site-editor.php' )
		);

		// Redirect to the onboarding.
		wp_safe_redirect( $redirect );
		exit;
	}

	/**
	 * Set Onboarding Status
	 * 
	 * @access public
	 * @return void
	 */
	public static function set_onboarding_status() {
		$status = get_option( self::OPTION_KEY, array() );
		$slug   = get_stylesheet();

		if ( ! empty( $status[ $slug ] ) ) {
			return;
		}

		$status[ $slug ] = true;
		update_option( self::OPTION_KEY, $status );
	}

	/**
	 * Get Theme Templates
	 * 
	 * @access public
	 * @return array|false
	 */
	public function get_templates() {
		$support = get_theme_support( self::SUPPORT_KEY );

		if ( false === $support || ! is_array( $support ) || ( ! isset( $support[0]['templates'] ) && ! isset( $support[0]['page_templates'] ) ) ) {
			return false;
		}

		$templates = array();

		if ( isset( $support[0]['templates'] ) ) {
			$templates = $support[0]['templates'];
		}

		if ( isset( $support[0]['page_templates'] ) ) {
			$templates['page_templates'] = $support[0]['page_templates'];
		}

		if ( ! $templates ) {
			return false;
		}

		foreach ( $templates as $key => $categories ) {
			foreach ( $categories as $i => $template ) {
				if ( file_exists( $template['file'] ) ) {
					if ( 'php' === pathinfo( $template['file'], PATHINFO_EXTENSION ) ) {
						$content                                   = include $template['file'];
						$templates[ $key ][ $i ]['content']['raw'] = $content;
					} else {
						$templates[ $key ][ $i ]['content']['raw'] = file_get_contents( $template['file'] );
					}

					unset( $templates[ $key ][ $i ]['file'] );
				} else {
					unset( $templates[ $key ][ $i ] );
				}
			}
		}

		return apply_filters( 'otter_fse_onboarding_templates', $templates );
	}

	/**
	 * Get Theme Logo
	 * 
	 * @access public
	 * @return string|false
	 */
	public function get_theme_logo() {
		$support = get_theme_support( self::SUPPORT_KEY );

		if ( false === $support || ! is_array( $support ) || ( ! isset( $support[0]['logo'] ) ) ) {
			return false;
		}

		$logo = esc_url( $support[0]['logo'] );

		if ( ! $logo ) {
			return false;
		}

		return $logo;
	}

	/**
	 * Get Templates Types
	 * 
	 * @access public
	 * @return array
	 */
	public function get_templates_types() {
		$templates = $this->get_templates();

		if ( ! $templates ) {
			return array();
		}

		return array_keys( $templates );
	}

	/**
	 * Enqueue options assets.
	 * 
	 * @access public
	 * @return void
	 */
	public function enqueue_options_assets() {
		$current_screen = get_current_screen();
		$has_support    = get_theme_support( self::SUPPORT_KEY );

		if (
			false === $has_support ||
			! current_user_can( 'manage_options' ) ||
			! isset( $current_screen->id ) ||
			'site-editor' !== $current_screen->id
		) {
			return;
		}

		// Flag onboarding status in case being run from a theme.
		self::set_onboarding_status();

		$asset_file = include OTTER_BLOCKS_PATH . '/build/onboarding/index.asset.php';

		wp_enqueue_media();

		wp_enqueue_style(
			'otter-onboarding-styles',
			OTTER_BLOCKS_URL . 'build/onboarding/style-index.css',
			array( 'wp-components' ),
			$asset_file['version']
		);

		wp_enqueue_script(
			'otter-onboarding-scripts',
			OTTER_BLOCKS_URL . 'build/onboarding/index.js',
			$asset_file['dependencies'],
			$asset_file['version'],
			true
		);

		wp_set_script_translations( 'otter-onboarding-scripts', 'otter-blocks' );

		wp_localize_script(
			'otter-onboarding-scripts',
			'otterOnboardingData',
			apply_filters(
				'otter_onboarding_data',
				array(
					'version'        => OTTER_BLOCKS_VERSION,
					'assetsPath'     => OTTER_BLOCKS_URL . 'assets/',
					'supportedSteps' => $this->get_templates_types(),
					'logo'           => $this->get_theme_logo(),
					'license'        => apply_filters( 'product_otter_license_key', 'free' ),
					'rootUrl'        => get_site_url(),
					'dashboardUrl'   => get_admin_url(),
					'isDev'          => defined( 'ENABLE_OTTER_PRO_DEV' ),
					'userEmail'      => wp_get_current_user()->user_email,
				)
			)
		);
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.7.1
	 * @access public
	 * @return FSE_Onboarding
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
