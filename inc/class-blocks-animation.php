<?php
/**
 * Class for Animation logic.
 *
 * @package ThemeIsle
 */

namespace ThemeIsle\GutenbergBlocks;

/**
 * Class Blocks_Animation
 */
class Blocks_Animation {

	/**
	 * The main instance var.
	 *
	 * @var Blocks_Animation
	 */
	public static $instance = null;

	/**
	 * Flag to mark that the scripts which have loaded.
	 *
	 * @var array
	 */
	public static $scripts_loaded = array(
		'animation'  => false,
		'count'      => false,
		'typing'     => false,
	);


	/**
	 * Initialize the class
	 */
	public function init() {
		if ( ! defined( 'BLOCKS_ANIMATION_URL' ) ) {
			define( 'BLOCKS_ANIMATION_URL', OTTER_BLOCKS_URL );
			define( 'BLOCKS_ANIMATION_PATH', OTTER_BLOCKS_PATH );
		}

		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_assets' ) );
		add_filter( 'render_block', array( $this, 'frontend_load' ), 800, 2 );
	}

	/**
	 * Load Gutenberg editor assets.
	 *
	 * @since   1.0.0
	 * @access  public
	 */
	public function enqueue_editor_assets() {
		$asset_file = include BLOCKS_ANIMATION_PATH . '/build/animation/index.asset.php';

		wp_enqueue_script(
			'otter-animation',
			BLOCKS_ANIMATION_URL . 'build/animation/index.js',
			$asset_file['dependencies'],
			$asset_file['version'],
			true
		);

		wp_set_script_translations( 'otter-animation', 'otter-blocks' );

		$asset_file = include BLOCKS_ANIMATION_PATH . '/build/animation/anim-count.asset.php';
		wp_enqueue_script(
			'otter-count',
			BLOCKS_ANIMATION_URL . 'build/animation/anim-count.js',
			$asset_file['dependencies'],
			$asset_file['version'],
			true
		);

		wp_script_add_data( 'otter-count', 'defer', true );
	}



	/**
	 * Load assets in frontend.
	 *
	 * @param string $block_content Content of block.
	 * @param array  $block Block Attributes.
	 * @return string
	 * @since 2.0.5
	 */
	public function frontend_load( $block_content, $block ) {

		if ( function_exists( 'is_amp_endpoint' ) && is_amp_endpoint() ) {
			return $block_content;
		}

		if( ! self::$scripts_loaded['animation'] && strpos( $block_content, 'animated' )) {
			$asset_file = include BLOCKS_ANIMATION_PATH . '/build/animation/frontend.asset.php';

			wp_enqueue_style(
				'animate-css',
				BLOCKS_ANIMATION_URL . 'assets/animate/animate.compact.css',
				array(),
				$asset_file['version']
			);

			wp_enqueue_style(
				'otter-animation',
				BLOCKS_ANIMATION_URL . 'build/animation/index.css',
				array(),
				$asset_file['version']
			);

			wp_script_add_data( 'otter-animation-frontend', 'async', true );
			self::$scripts_loaded['animation'] = true;
		}

		if( ! self::$scripts_loaded['count'] && strpos( $block_content, 'o-anim-count' )) {
			$asset_file = include BLOCKS_ANIMATION_PATH . '/build/animation/anim-count.asset.php';
			wp_enqueue_script(
				'otter-count',
				BLOCKS_ANIMATION_URL . 'build/animation/anim-count.js',
				$asset_file['dependencies'],
				$asset_file['version'],
				true
			);

			wp_script_add_data( 'otter-count', 'defer', true );
			self::$scripts_loaded['count'] = true;
		}

		if( ! self::$scripts_loaded['typing'] && strpos( $block_content, 'o-anim-typing' )) {
			$asset_file = include BLOCKS_ANIMATION_PATH . '/build/animation/anim-typing.asset.php';
			wp_enqueue_script(
				'otter-typing',
				BLOCKS_ANIMATION_URL . 'build/animation/anim-typing.js',
				$asset_file['dependencies'],
				$asset_file['version'],
				true
			);

			wp_script_add_data( 'otter-typing', 'defer', true );
			self::$scripts_loaded['typing'] = true;
		}

		return $block_content;
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.0.0
	 * @access public
	 * @return Blocks_Animation
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
