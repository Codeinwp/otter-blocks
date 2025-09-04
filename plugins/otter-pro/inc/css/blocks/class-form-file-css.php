<?php
/**
 * Css handling logic for blocks.
 *
 * @package ThemeIsle\OtterPro\CSS\Blocks
 */

namespace ThemeIsle\OtterPro\CSS\Blocks;

use ThemeIsle\GutenbergBlocks\Base_CSS;

use ThemeIsle\GutenbergBlocks\CSS\CSS_Utility;

/**
 * Class Form_File_CSS
 */
class Form_File_CSS extends Base_CSS {
	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'form-file';

	/**
	 * Generate Form Field CSS
	 *
	 * @param mixed $block Block data.
	 * @return string
	 * @since   2.3.0
	 * @access  public
	 */
	public function render_css( $block ) {
		$css = new CSS_Utility( $block );

		$css->add_item(
			array(
				'properties' => array(
					array(
						'property' => '--label-color',
						'value'    => 'labelColor',
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
