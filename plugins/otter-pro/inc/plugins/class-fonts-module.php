<?php
/**
 * Fonts Module.
 *
 * @package ThemeIsle\OtterPro\Plugins
 */

namespace ThemeIsle\OtterPro\Plugins;

use ThemeIsle\OtterPro\Plugins\License;

/**
 * Class Fonts_Module
 */
class Fonts_Module {

	/**
	 * The main instance var.
	 *
	 * @var Fonts_Module
	 */
	protected static $instance = null;

	/**
	 * Initialize the class
	 */
	public function init() {
		if ( License::has_active_license() ) {
			if ( true === boolval( get_option( 'otter_offload_fonts', false ) ) ) {
				add_filter( 'otter_blocks_google_fonts_url', array( $this, 'register_webfont_loader' ) );
			}

			add_action( 'update_option_otter_offload_fonts', array( $this, 'toggle_neve_option' ), 10, 2 );
			add_action( 'update_option_nv_pro_enable_local_fonts', array( $this, 'toggle_otter_option' ), 10, 2 );
		}
	}

	/**
	 * Register Webfont Loader.
	 *
	 * @param string $fonts_url Google Fonts URL.
	 * 
	 * @since   2.0.5
	 * @access  public
	 */
	public function register_webfont_loader( $fonts_url ) {
		$vendor_file = trailingslashit( OTTER_BLOCKS_PATH ) . 'vendor/wptt/webfont-loader/wptt-webfont-loader.php';
		require_once $vendor_file;
		$fonts_url = wptt_get_webfont_url( esc_url_raw( $fonts_url ) );
		return $fonts_url;
	}

	/**
	 * Toggle Neve option based on Otter.
	 *
	 * @param boolean $old_value Old Value.
	 * @param boolean $new_value New Value.
	 * 
	 * @since   2.0.5
	 * @access  public
	 */
	public function toggle_neve_option( $old_value, $new_value ) {
		if ( boolval( $new_value ) !== boolval( get_option( 'nv_pro_enable_local_fonts', false ) ) ) {
			update_option( 'nv_pro_enable_local_fonts', boolval( $new_value ) );
		}
	}

	/**
	 * Toggle Otter option based on Neve.
	 *
	 * @param boolean $old_value Old Value.
	 * @param boolean $new_value New Value.
	 * 
	 * @since   2.0.5
	 * @access  public
	 */
	public function toggle_otter_option( $old_value, $new_value ) {
		if ( boolval( $new_value ) !== boolval( get_option( 'otter_offload_fonts', false ) ) ) {
			update_option( 'otter_offload_fonts', boolval( $new_value ) );
		}
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 2.0.5
	 * @access public
	 * @return Fonts_Module
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
	 * @since 2.0.5
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
	 * @since 2.0.5
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}
}
