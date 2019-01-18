<?php

/**
 * Class Otter_Blocks
 *
 * Otter Blocks class to initilize Guterberg Blocks.
 */
class Otter_Blocks {

	/**
	 * Otter_Blocks class instance.
	 *
	 * @var Otter_Blocks
	 */
	public static $instance = null;

	/**
	 * Otter_Blocks constructor.
	 *
	 * @since   1.0.0
	 * @access  public
	 */
	public function __construct() {
		$this->name           = __( 'Otter', 'otter-blocks' );
		$this->description    = __( 'Blocks for Gutenberg', 'otter-blocks' );
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
	}

	/**
	 * Load assets for our blocks.
	 */
	function enqueue_block_assets() {
		wp_enqueue_style( 'font-awesome-5', plugins_url( 'assets/fontawesome/css/all.min.css', __FILE__ ) );
		wp_enqueue_style( 'font-awesome-4-shims', plugins_url( 'assets/fontawesome/css/v4-shims.min.css', __FILE__ ) );
	}

	/**
	 * Load Gutenberg Blocks
	 */
	function load_gutenberg_blocks() {
		if ( class_exists( '\ThemeIsle\GutenbergBlocks' ) ) {
			\ThemeIsle\GutenbergBlocks::instance( $this->name );
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
