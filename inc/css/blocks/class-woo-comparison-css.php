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
 * Class Woo_Comparison_CSS
 */
class Woo_Comparison_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'woo-comparison';

	/**
	 * Generate Woo Comparison CSS
	 *
	 * @param mixed $block Block data.
	 * @return string
	 * @since   1.7.0
	 * @access  public
	 */
	public function render_css( $block ) {
		$css = new CSS_Utility( $block );

		$css->add_item(
			array(
				'selector'   => ' .nv-ct-container',
				'properties' => array(
					array(
						'property' => '--bgColor',
						'value'    => 'rowColor',
					),
					array(
						'property' => '--headerColor',
						'value'    => 'headerColor',
					),
					array(
						'property' => '--color',
						'value'    => 'textColor',
					),
					array(
						'property' => '--borderColor',
						'value'    => 'borderColor',
					),
					array(
						'property' => '--alternateBg',
						'value'    => 'altRowColor',
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
