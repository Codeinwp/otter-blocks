<?php
/**
 * Masonry Variation.
 *
 * @package ThemeIsle\GutenbergBlocks\Render
 */

namespace ThemeIsle\GutenbergBlocks\Render;

/**
 * Class Masonry_Variant
 */
class Masonry_Variant {
	/**
	 * The main instance var.
	 *
	 * @var Masonry_Variant
	 */
	public static $instance = null;

	/**
	 * Initialize the class
	 */
	public function init() {
		add_filter( 'render_block', array( $this, 'render_blocks' ), 10, 3 );
	}

	/**
	 * Block render function for server-side.
	 *
	 * @param array $block_content Blocks content.
	 * @param array $block Blocks data.
	 * @return mixed|string
	 */
	public function render_blocks( $block_content, $block ) {
		if ( ! is_admin() && 'core/gallery' === $block['blockName'] && isset( $block['attrs']['isMasonry'] ) ) {

			$asset_file = include OTTER_BLOCKS_PATH . '/build/blocks/masonry.asset.php';

			wp_enqueue_script(
				'macy',
				OTTER_BLOCKS_URL . 'assets/macy/macy.js',
				[],
				$asset_file['version'],
				true
			);

			wp_script_add_data( 'macy', 'async', true );

			wp_enqueue_script(
				'otter-masonry',
				OTTER_BLOCKS_URL . 'build/blocks/masonry.js',
				array_merge(
					$asset_file['dependencies'],
					array( 'macy' )
				),
				$asset_file['version'],
				true
			);

			wp_script_add_data( 'otter-masonry', 'defer', true );

			$margin = isset( $block['attrs']['margin'] ) ? $block['attrs']['margin'] : 10;

			$style = '<style type="text/css">.otter-masonry .blocks-gallery-grid .blocks-gallery-item img{ width:100% }</style>';

			$block_content = $style . '<div class="otter-masonry" data-margin="' . $margin . '">' . $block_content . '</div>';

			return $block_content;
		}

		return $block_content;
	}

	/**
	 * The instance method for the static class.
	 * Defines and returns the instance of the static class.
	 *
	 * @static
	 * @since 1.7.1
	 * @access public
	 * @return Masonry_Variant
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
