<?php
/**
 * Css handling logic for group.
 *
 * @package ThemeIsle\GutenbergBlocks\CSS\Blocks
 */

namespace ThemeIsle\GutenbergBlocks\CSS\Blocks;

use ThemeIsle\GutenbergBlocks\Base_CSS;

use ThemeIsle\GutenbergBlocks\CSS\CSS_Utility;

/**
 * Class Pricing_Table_CSS
 */
class Pricing_Table_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'pricing-table';

	/**
	 * Generate Pricing Table Item CSS
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
						'property'       => 'grid-template-columns',
						'pattern'        => 'repeat(columns, 1fr)',
						'pattern_values' => array(
							'columns' => array(
								'value' => 'columns',
							),
						),
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .o-pricing-table-wrap',
				'properties' => array(
					array(
						'property' => 'width',
						'value'    => 'columnWidth',
						'unit'     => 'px',
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
