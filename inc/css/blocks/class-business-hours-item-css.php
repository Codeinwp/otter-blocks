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
 * Class Business_Hours_Item_CSS
 */
class Business_Hours_Item_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'business-hours-item';

	/**
	 * Generate Business Hours Item CSS
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
				'properties' => array(
					array(
						'property' => 'background-color',
						'value'    => 'backgroundColor',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .otter-business-hour-item__label',
				'properties' => array(
					array(
						'property' => 'color',
						'value'    => 'labelColor',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .otter-business-hour-item__time',
				'properties' => array(
					array(
						'property' => 'color',
						'value'    => 'timeColor',
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
