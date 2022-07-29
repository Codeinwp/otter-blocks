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
class Icon_List_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'icon-list';

	/**
	 * Generate Icon List CSS
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
						'property' => '--horizontal-align',
						'value'    => 'horizontalAlign',
					),
					array(
						'property' => '--gap',
						'value'    => 'gap',
						'unit'     => 'px',
					),
					array(
						'property' => '--content-color',
						'value'    => 'defaultContentColor',
					),
					array(
						'property' => '--icon-color',
						'value'    => 'defaultIconColor',
					),
					array(
						'property' => '--font-size',
						'value'    => 'defaultSize',
						'unit'     => 'px',
						'default'  => 20,
					),
					array(
						'property' => 'min-width',
						'value'    => 'defaultSize',
						'unit'     => 'px',
						'default'  => 20,
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
