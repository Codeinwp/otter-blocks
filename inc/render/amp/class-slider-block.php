<?php
/**
 * Slider Block.
 *
 * @package ThemeIsle\GutenbergBlocks\Render\AMP
 */

namespace ThemeIsle\GutenbergBlocks\Render\AMP;

use Masterminds\HTML5;

/**
 * Class Slider_Block
 */
class Slider_Block {
	/**
	 * The main instance var.
	 *
	 * @var Slider_Block
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
		if ( 'themeisle-blocks/slider' === $block['blockName'] && function_exists( 'is_amp_endpoint' ) && is_amp_endpoint() ) {
			$html5         = new HTML5();
			$dom           = $html5->loadHTML( $block['innerHTML'] );
			$id            = $block['attrs']['id'];
			$images        = $dom->getElementsByTagName( 'figure' );
			$block_content = '<amp-carousel id="' . $id . '" class="wp-block-themeisle-blocks-slider" width="400" height="300" layout="responsive" type="slides" autoplay delay="2000">';

			foreach ( $images as $image ) {
				$block_content .= $html5->saveHTML( $image );
			}

			$block_content .= '</amp-carousel>';

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
	 * @return Slider_Block
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
