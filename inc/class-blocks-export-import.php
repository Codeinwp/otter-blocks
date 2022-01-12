<?php
/**
 * Class for Export/Import logic.
 *
 * @package ThemeIsle
 */

namespace ThemeIsle\GutenbergBlocks;

/**
 * Class Blocks_Export_Import.
 */
class Blocks_Export_Import {

	/**
	 * The main instance var.
	 *
	 * @var Blocks_Export_Import
	 */
	public static $instance = null;

	/**
	 * Initialize the class
	 */
	public function init() {
		if ( ! defined( 'BLOCKS_EXPORT_IMPORT_URL' ) ) {
			define( 'BLOCKS_EXPORT_IMPORT_URL', OTTER_BLOCKS_URL );
			define( 'BLOCKS_EXPORT_IMPORT_PATH', OTTER_BLOCKS_PATH );
		}

		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_assets' ), 1 );
	}

	/**
	 * Load Gutenberg assets.
	 *
	 * @since   1.0.0
	 * @access  public
	 */
	public function enqueue_editor_assets() {
		$current_screen = get_current_screen();

		if ( 'post' !== $current_screen->base ) {
			return;
		}

		$asset_file = include BLOCKS_EXPORT_IMPORT_PATH . '/build/export-import/index.asset.php';
	
		wp_enqueue_script(
			'blocks-export-import',
			BLOCKS_EXPORT_IMPORT_URL . 'build/export-import/index.js',
			$asset_file['dependencies'],
			$asset_file['version'],
			true
		);
	
		wp_set_script_translations( 'blocks-export-import', 'otter-blocks' );
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.0.0
	 * @access public
	 * @return Blocks_Export_Import
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
