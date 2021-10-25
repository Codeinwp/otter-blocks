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
 * Class Review_Comparison_CSS
 */
class Review_Comparison_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'review-comparison';

	/**
	 * Generate Review Comparison CSS
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
				'selector'   => ' .otter-review-comparison__buttons a',
				'properties' => array(
					array(
						'property' => 'color',
						'value'    => 'buttonText',
					),
					array(
						'property' => 'background-color',
						'value'    => 'buttonColor',
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
