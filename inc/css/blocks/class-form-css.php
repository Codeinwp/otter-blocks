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
 * Class Form_CSS
 */
class Form_CSS extends Base_CSS {
/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'form';

	/**
	 * Generate Accordion CSS
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
						'property' => '--labelColor',
						'value'    => 'labelColor',
					),
					array(
						'property' => '--borderRadius',
						'value'    => 'inputBorderRadius',
						'unit'     => 'px'
					),
					array(
						'property' => '--borderColor',
						'value'    => 'inputBorderColor',
					),
					array(
						'property' => '--borderWidth',
						'value'    => 'inputBorderWidth',
					),
					array(
						'property' => '--padding',
						'value'    => 'inputPadding',
						'unit'     => 'px'
					),
					array(
						'property' => '--inputWidth',
						'value'    => 'inputWidth',
						'unit'     => '%'
					),
					array(
						'property' => '--submitBackground',
						'value'    => 'submitBackgroundColor',
					),
					array(
						'property' => '--submitBackgroundHover',
						'value'    => 'submitBackgroundColorHover',
					),
					array(
						'property' => '--submitColor',
						'value'    => 'submitColor',
					),
					array(
						'property' => '--submitMsgColor',
						'value'    => 'submitMessageColor',
					),
					array(
						'property' => '--inputsGap',
						'value'    => 'inputsGap',
						'unit'     => 'px'
					),
					array(
						'property' => '--inputGap',
						'value'    => 'inputGap',
						'unit'     => 'px'
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}

}
