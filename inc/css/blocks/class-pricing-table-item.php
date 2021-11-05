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
 * Class Pricing_Table_Item_CSS
 */
class Pricing_Table_Item_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'pricing-table-item';

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
				'selector'   => ' .pricing-table-wrap',
				'properties' => array(
					array(
						'property' => 'border-width',
						'value'    => 'borderWidth',
						'unit'     => 'px',
					),
					array(
						'property'  => 'border-color',
						'value'     => 'borderColor',
					),
					array(
						'property'  => 'border-style',
						'value'     => 'borderStyle',
						'default'   => 'solid',
					),
					array(
						'property' => 'border-radius',
						'value'    => 'borderRadius',
						'unit'     => 'px',
					),
					array(
						'property' => 'background-color',
						'value'    => 'backgroundColor',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .o-pricing-header .featured-badge',
				'properties' => array(
					array(
						'property' => 'background-color',
						'value'    => 'ribbonColor',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .o-pricing-header .featured-badge:before',
				'properties' => array(
					array(
						'property' => 'background-color',
						'value'    => 'ribbonColor',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .o-pricing-header .featured-badge:after',
				'properties' => array(
					array(
						'property' => 'border-top-color',
						'value'    => 'ribbonColor',
					),
					array(
						'property' => 'border-bottom-color',
						'value'    => 'ribbonColor',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .o-pricing-header .o-pricing-title',
				'properties' => array(
					array(
						'property' => 'color',
						'value'    => 'titleColor',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .o-pricing-header .o-pricing-description',
				'properties' => array(
					array(
						'property' => 'color',
						'value'    => 'descriptionColor',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .o-pricing-price .full-price',
				'properties' => array(
					array(
						'property' => 'color',
						'value'    => 'oldPriceColor',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .o-pricing-price .price, .period',
				'properties' => array(
					array(
						'property' => 'color',
						'value'    => 'priceColor',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .o-pricing-action-wrap .o-pricing-action',
				'properties' => array(
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
