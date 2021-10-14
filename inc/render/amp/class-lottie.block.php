<?php
/**
 * Lottie Block.
 *
 * @package ThemeIsle\GutenbergBlocks\Render\AMP
 */

namespace ThemeIsle\GutenbergBlocks\Render\AMP;

/**
 * Class Lottie_Block
 */
class Lottie_Block {
	/**
	 * The main instance var.
	 *
	 * @var Lottie_Block
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
		if ( 'themeisle-blocks/lottie' === $block['blockName'] && function_exists( 'is_amp_endpoint' ) && is_amp_endpoint() ) {
			if ( ! isset( $block['attrs']['file'] ) ) {
				return $block_content;
			}

			$file = $block['attrs']['file'];
			$size = isset( $block['attrs']['width'] ) ? $block['attrs']['width'] : 400;
			$loop = ( isset( $block['attrs']['loop'] ) && true === $block['attrs']['loop'] ) ? 'true' : 'false';
			if ( isset( $block['attrs']['count'] ) ) {
				$loop = intval( $block['attrs']['count'] );
			}

			$block_content = '<amp-bodymovin-animation layout="responsive" width="' . intval( $size ) . '" height="' . intval( $size ) . '" loop="' . $loop . '" src="' . esc_url( $file['url'] ) . '"></amp-bodymovin-animation>';
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
	 * @return Lottie_Block
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
