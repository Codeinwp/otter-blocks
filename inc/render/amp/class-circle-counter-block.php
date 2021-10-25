<?php
/**
 * Circle Counter Block.
 *
 * @package ThemeIsle\GutenbergBlocks\Render\AMP
 */

namespace ThemeIsle\GutenbergBlocks\Render\AMP;

/**
 * Class Circle_Counter_Block
 */
class Circle_Counter_Block {
	/**
	 * The main instance var.
	 *
	 * @var Circle_Counter_Block
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
		if ( 'themeisle-blocks/circle-counter' === $block['blockName'] && function_exists( 'is_amp_endpoint' ) && is_amp_endpoint() ) {
			$id            = $block['attrs']['id'];
			$block_content = '<div id="' . $id . '" class="wp-block-themeisle-blocks-circle-counter">';

			if ( 'default' === ( isset( $block['attrs']['titleStyle'] ) ? $block['attrs']['titleStyle'] : 'default' ) ) {
				$block_content .= '<div class="wp-block-themeisle-blocks-circle-counter-title__area">';
				$block_content .= '<span class="wp-block-themeisle-blocks-circle-counter-title__value">';
				$block_content .= esc_html( isset( $block['attrs']['title'] ) ? $block['attrs']['title'] : __( 'Skill', 'otter-blocks' ) );
				$block_content .= '</span>';
				$block_content .= '</div>';
			}

			$block_content .= '<div class="wp-block-themeisle-blocks-circle-counter__bar">';
			$block_content .= '<div class="wp-block-themeisle-blocks-circle-counter-container">';
			$block_content .= '<span class="wp-block-themeisle-blocks-circle-counter-text">' . intval( isset( $block['attrs']['percentage'] ) ? $block['attrs']['percentage'] : 50 ) . '%</span>';
			$block_content .= '<div class="wp-block-themeisle-blocks-circle-counter-overlay"></div>';
			$block_content .= '<div class="wp-block-themeisle-blocks-circle-counter-status"></div>';
			$block_content .= '<div class="wp-block-themeisle-blocks-circle-counter-status"></div>';
			$block_content .= '</div>';
			$block_content .= '</div>';

			if ( 'bottom' === ( isset( $block['attrs']['titleStyle'] ) ? $block['attrs']['titleStyle'] : 'default' ) ) {
				$block_content .= '<div class="wp-block-themeisle-blocks-circle-counter-title__area">';
				$block_content .= '<span class="wp-block-themeisle-blocks-circle-counter-title__value">';
				$block_content .= esc_html( isset( $block['attrs']['title'] ) ? $block['attrs']['title'] : __( 'Skill', 'otter-blocks' ) );
				$block_content .= '</span>';
				$block_content .= '</div>';
			}

			$block_content .= '</div>';

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
	 * @return Circle_Counter_Block
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
