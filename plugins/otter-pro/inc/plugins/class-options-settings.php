<?php
/**
 * Options.
 *
 * @package ThemeIsle\OtterPro\Plugins
 */

namespace ThemeIsle\OtterPro\Plugins;

/**
 * Class Options_Settings
 */
class Options_Settings {

	/**
	 * The main instance var.
	 *
	 * @var Options_Settings
	 */
	protected static $instance = null;

	/**
	 * Initialize the class
	 */
	public function init() {
		add_action( 'init', array( $this, 'register_settings' ), 99 );
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
			'otter_inherited_autoactivate',
			array(
				'type'         => 'boolean',
				'description'  => __( 'Inherit license from Neve Pro.', 'otter-blocks' ),
				'show_in_rest' => true,
				'default'      => false,
			)
		);

		register_setting(
			'themeisle_blocks_settings',
			'otter_offload_fonts',
			array(
				'type'         => 'boolean',
				'description'  => __( 'Store Google Fonts Offline.', 'otter-blocks' ),
				'show_in_rest' => true,
				'default'      => true === boolval( get_option( 'nv_pro_enable_local_fonts', false ) ) ? true : false,
			)
		);
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.2.0
	 * @access public
	 * @return Options_Settings
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
	 * @since 1.2.0
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
	 * @since 1.2.0
	 * @return void
	 */
	public function __wakeup() {
		// Unserializing instances of the class is forbidden.
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cheatin&#8217; huh?', 'otter-blocks' ), '1.0.0' );
	}
}
