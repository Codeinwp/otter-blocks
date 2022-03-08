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
 * Class Progress_Bar_CSS
 */
class Tabs_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'tabs';

	/**
	 * Generate Progress Bar CSS
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
						'property' => '--borderWidth',
						'value'    => 'borderWidth',
						'unit'     => 'px',
					),
					array(
						'property' => '--borderColor',
						'value'    => 'borderColor',
					),
					array(
						'property' => '--activeTitleColor',
						'value'    => 'activeTitleColor',
					),
					array(
						'property' => '--tabColor',
						'value'    => 'tabColor',
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
