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
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_options_assets' ) );
	}

    /**
     * Enqueue options assets.
     */
    public function enqueue_options_assets() {
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
			'otterObj',
			apply_filters(
				'otter_onboarding_data',
				array(
					'version'       => OTTER_BLOCKS_VERSION,
					'assetsPath'    => OTTER_BLOCKS_URL . 'assets/',
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
