<?php
/**
 * Css handling logic for blocks.
 *
 * @package ThemeIsle\GutenbergBlocks\CSS\Blocks
 */

namespace ThemeIsle\GutenbergBlocks\CSS\Blocks;

use ThemeIsle\GutenbergBlocks\Base_CSS;

use ThemeIsle\GutenbergBlocks\CSS\CSS_Utility;

/**
 * Class Review_CSS
 */
class Review_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'review';

	/**
	 * Generate Review CSS
	 *
	 * @param mixed $block Block data.
	 * @return string
	 * @since   1.3.0
	 * @access  public
	 */
	public function render_css( $block ) {
		$css = new CSS_Utility( $block );

		$css->add_item(
			array(
				'properties' => array(
					array(
						'property' => '--background-color',
						'value'    => 'backgroundColor',
						'hasSync'  => 'review-background-color',
					),
					array(
						'property' => '--primary-color',
						'value'    => 'primaryColor',
						'hasSync'  => 'review-primary-color',
					),
					array(
						'property' => '--text-color',
						'value'    => 'textColor',
						'hasSync'  => 'review-text-color',
					),
					array(
						'property' => '--button-text-color',
						'value'    => 'buttonTextColor',
						'hasSync'  => 'review-button-text-color',
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}

	/**
	 * Generate Review Global CSS
	 *
	 * @return string
	 * @since   2.0.0
	 * @access  public
	 */
	public function render_global_css() {
		$defaults = get_option( 'themeisle_blocks_settings_global_defaults' );
		$block    = $this->library_prefix . '/' . $this->block_prefix;

		if ( empty( $defaults ) ) {
			return;
		}

		$defaults = json_decode( $defaults, true );

		if ( ! isset( $defaults[ $block ] ) ) {
			return;
		}

		$block = array(
			'attrs' => $defaults[ $block ],
		);

		$css = new CSS_Utility( $block );

		$css->add_item(
			array(
				'selector'   => '.wp-block-themeisle-blocks-review',
				'properties' => array(
					array(
						'property' => '--review-background-color',
						'value'    => 'backgroundColor',
					),
					array(
						'property' => '--review-primary-color',
						'value'    => 'primaryColor',
					),
					array(
						'property' => '--review-text-color',
						'value'    => 'textColor',
					),
					array(
						'property' => '--review-button-text-color',
						'value'    => 'buttonTextColor',
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
