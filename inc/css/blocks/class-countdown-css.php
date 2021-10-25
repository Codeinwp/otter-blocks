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
				'selector'   => ' .otter-countdown__container .otter-countdown__display .otter-countdown__display-area.is-main-component',
				'properties' => array(
					array(
						'property' => 'background-color',
						'value'    => 'backgroundColor',
					),
					array(
						'property' => 'border-color',
						'value'    => 'borderColor',
					),
					array(
						'property'  => 'border-radius',
						'value'     => 'borderRadius',
						'unit'      => 'px',
						'default'   => 0,
						'condition' => function( $attrs ) {
							return ! ( isset( $attrs['borderRadiusType'] ) && 'unlinked' === $attrs['borderRadiusType'] );
						},
					),
					array(
						'property'       => 'border-radius',
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
				),
			)
		);

		$css->add_item(
			array(
				'query'      => '@media ( min-width: 961px )',
				'selector'   => ' .otter-countdown__container .otter-countdown__display .otter-countdown__display-area.is-main-component',
				'properties' => array(
					array(
						'property' => 'width',
						'value'    => 'width',
						'unit'     => 'px',
					),
					array(
						'property' => 'border-width',
						'value'    => 'borderWidth',
						'unit'     => 'px',
					),
				),
			)
		);

		$css->add_item(
			array(
				'query'      => '@media ( min-width: 600px ) and ( max-width: 960px )',
				'selector'   => ' .otter-countdown__container .otter-countdown__display .otter-countdown__display-area.is-main-component',
				'properties' => array(
					array(
						'property' => 'width',
						'value'    => 'widthTablet',
						'unit'     => 'px',
					),
					array(
						'property' => 'border-width',
						'value'    => 'borderWidthTablet',
						'unit'     => 'px',
					),
				),
			)
		);

		$css->add_item(
			array(
				'query'      => '@media ( max-width: 600px )',
				'selector'   => ' .otter-countdown__container .otter-countdown__display .otter-countdown__display-area.is-main-component',
				'properties' => array(
					array(
						'property' => 'width',
						'value'    => 'widthMobile',
						'unit'     => 'px',
					),
					array(
						'property' => 'border-width',
						'value'    => 'borderWidthMobile',
						'unit'     => 'px',
					),
				),
			)
		);

		$css->add_item(
			array(
				'query'      => '@media ( min-width: 961px )',
				'selector'   => ' .otter-countdown__container .otter-countdown__display .otter-countdown__display-area',
				'properties' => array(
					array(
						'property' => 'height',
						'value'    => 'height',
						'unit'     => 'px',
					),
				),
			)
		);

		$css->add_item(
			array(
				'query'      => '@media ( min-width: 600px ) and ( max-width: 960px )',
				'selector'   => ' .otter-countdown__container .otter-countdown__display .otter-countdown__display-area',
				'properties' => array(
					array(
						'property' => 'height',
						'value'    => 'heightTablet',
						'unit'     => 'px',
					),
				),
			)
		);

		$css->add_item(
			array(
				'query'      => '@media ( max-width: 600px )',
				'selector'   => ' .otter-countdown__container .otter-countdown__display .otter-countdown__display-area',
				'properties' => array(
					array(
						'property' => 'height',
						'value'    => 'heightMobile',
						'unit'     => 'px',
					),
				),
			)
		);

		$css->add_item(
			array(
				'query'      => '@media ( min-width: 961px )',
				'selector'   => ' .otter-countdown__container .otter-countdown__display',
				'properties' => array(
					array(
						'property' => 'gap',
						'value'    => 'gap',
						'unit'     => 'px',
					),
				),
			)
		);

		$css->add_item(
			array(
				'query'      => '@media ( min-width: 600px ) and ( max-width: 960px )',
				'selector'   => ' .otter-countdown__container .otter-countdown__display',
				'properties' => array(
					array(
						'property' => 'gap',
						'value'    => 'gapTablet',
						'unit'     => 'px',
					),
				),
			)
		);

		$css->add_item(
			array(
				'query'      => '@media ( max-width: 600px )',
				'selector'   => ' .otter-countdown__container .otter-countdown__display',
				'properties' => array(
					array(
						'property' => 'gap',
						'value'    => 'gapMobile',
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
				'query'      => '@media ( min-width: 961px )',
				'selector'   => ' .otter-countdown__container .otter-countdown__display .otter-countdown__display-area .otter-countdown__value',
				'properties' => array(
					array(
						'property' => 'font-size',
						'value'    => 'valueFontSize',
						'unit'     => 'px',
					),
				),
			)
		);

		$css->add_item(
			array(
				'query'      => '@media ( min-width: 600px ) and ( max-width: 960px )',
				'selector'   => ' .otter-countdown__container .otter-countdown__display .otter-countdown__display-area .otter-countdown__value',
				'properties' => array(
					array(
						'property' => 'font-size',
						'value'    => 'valueFontSizeTablet',
						'unit'     => 'px',
					),
				),
			)
		);

		$css->add_item(
			array(
				'query'      => '@media ( max-width: 600px )',
				'selector'   => ' .otter-countdown__container .otter-countdown__display .otter-countdown__display-area .otter-countdown__value',
				'properties' => array(
					array(
						'property' => 'font-size',
						'value'    => 'valueFontSizeMobile',
						'unit'     => 'px',
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

		$css->add_item(
			array(
				'query'      => '@media ( min-width: 961px )',
				'selector'   => ' .otter-countdown__container .otter-countdown__display .otter-countdown__display-area .otter-countdown__label',
				'properties' => array(
					array(
						'property' => 'font-size',
						'value'    => 'labelFontSize',
						'unit'     => 'px',
					),
				),
			)
		);

		$css->add_item(
			array(
				'query'      => '@media ( min-width: 600px ) and ( max-width: 960px )',
				'selector'   => ' .otter-countdown__container .otter-countdown__display .otter-countdown__display-area .otter-countdown__label',
				'properties' => array(
					array(
						'property' => 'font-size',
						'value'    => 'labelFontSizeTablet',
						'unit'     => 'px',
					),
				),
			)
		);

		$css->add_item(
			array(
				'query'      => '@media ( max-width: 600px )',
				'selector'   => ' .otter-countdown__container .otter-countdown__display .otter-countdown__display-area .otter-countdown__label',
				'properties' => array(
					array(
						'property' => 'font-size',
						'value'    => 'labelFontSizeMobile',
						'unit'     => 'px',
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
