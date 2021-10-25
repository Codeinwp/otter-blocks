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
 * Class Icon_List_CSS
 */
class Icon_List_Item_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'icon-list-item';

	/**
	 * Generate Icon List Item CSS
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
				'selector'   => ' .wp-block-themeisle-blocks-icon-list-item-content-custom',
				'properties' => array(
					array(
						'property' => 'color',
						'value'    => 'contentColor',
					),
					array(
						'property' => 'fill',
						'value'    => 'contentColor',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-icon-list-item-icon-custom',
				'properties' => array(
					array(
						'property' => 'color',
						'value'    => 'iconColor',
					),
					array(
						'property' => 'fill',
						'value'    => 'iconColor',
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
