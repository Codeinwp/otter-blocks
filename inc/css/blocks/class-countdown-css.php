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
 * Class Circular_Counter_CSS
 */
class Countdown_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'countdown';

	/**
	 * Generate Circle Counter CSS
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
						'property' => '--backgroundColor',
						'value'    => 'backgroundColor',
					),
					array(
						'property' => '--borderColor',
						'value'    => 'borderColor',
					),
					array(
						'property'  => '--borderRadius',
						'value'     => 'borderRadius',
						'unit'      => 'px',
						'default'   => 0,
						'condition' => function( $attrs ) {
							return ! ( isset( $attrs['borderRadiusType'] ) && 'unlinked' === $attrs['borderRadiusType'] );
						},
					),
					array(
						'property'       => '--borderRadius',
						'pattern'        => 'top-left top-right bottom-right bottom-left',
						'pattern_values' => array(
							'top-left'     => array(
								'value'   => 'borderRadiusTopLeft',
								'unit'    => '%',
								'default' => 0,
							),
							'top-right'    => array(
								'value'   => 'borderRadiusTopRight',
								'unit'    => '%',
								'default' => 0,
							),
							'bottom-right' => array(
								'value'   => 'borderRadiusBottomRight',
								'unit'    => '%',
								'default' => 0,
							),
							'bottom-left'  => array(
								'value'   => 'borderRadiusBottomLeft',
								'unit'    => '%',
								'default' => 0,
							),
						),
						'condition'      => function( $attrs ) {
							return isset( $attrs['borderRadiusType'] ) && 'unlinked' === $attrs['borderRadiusType'];
						},
					),
					array(
						'property' => '--width',
						'value'    => 'width',
						'unit'     => 'px',
					),
					array(
						'property' => '--widthTablet',
						'value'    => 'widthTablet',
						'unit'     => 'px',
					),
					array(
						'property' => '--widthMobile',
						'value'    => 'widthMobile',
						'unit'     => 'px',
					),
					array(
						'property' => '--height',
						'value'    => 'height',
						'unit'     => 'px',
					),
					array(
						'property' => '--heightTablet',
						'value'    => 'heightTablet',
						'unit'     => 'px',
					),
					array(
						'property' => '--heightMobile',
						'value'    => 'heightMobile',
						'unit'     => 'px',
					),
					array(
						'property' => '--borderWidth',
						'value'    => 'borderWidth',
						'unit'     => 'px',
					),
					array(
						'property' => '--borderWidthTablet',
						'value'    => 'borderWidthTablet',
						'unit'     => 'px',
					),
					array(
						'property' => '--borderWidthMobile',
						'value'    => 'borderWidthMobile',
						'unit'     => 'px',
					),
					array(
						'property' => 'gap',
						'value'    => 'gap',
						'unit'     => 'px',
					),
					array(
						'property' => 'gap',
						'value'    => 'gapTablet',
						'unit'     => 'px',
					),
					array(
						'property' => 'gap',
						'value'    => 'gapMobile',
						'unit'     => 'px',
					),
					array(
						'property' => '--valueFontSize',
						'value'    => 'valueFontSize',
						'unit'     => 'px',
					),
					array(
						'property' => '--valueFontSizeTablet',
						'value'    => 'valueFontSizeTablet',
						'unit'     => 'px',
					),
					array(
						'property' => '--valueFontSizeMobile',
						'value'    => 'valueFontSizeMobile',
						'unit'     => 'px',
					),
					array(
						'property' => '--labelFontSize',
						'value'    => 'labelFontSize',
						'unit'     => 'px',
					),
					array(
						'property' => '--labelFontSizeTablet',
						'value'    => 'labelFontSizeTablet',
						'unit'     => 'px',
					),
					array(
						'property' => '--labelFontSizeMobile',
						'value'    => 'labelFontSizeMobile',
						'unit'     => 'px',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .otter-countdown__container .otter-countdown__display .otter-countdown__display-area .otter-countdown__value',
				'properties' => array(
					array(
						'property' => 'color',
						'value'    => 'valueColor',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .otter-countdown__container .otter-countdown__display .otter-countdown__display-area .otter-countdown__label',
				'properties' => array(
					array(
						'property' => 'color',
						'value'    => 'labelColor',
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
