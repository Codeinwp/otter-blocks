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
						'property'  => '--border-radius',
						'value'     => 'borderRadius',
						'unit'      => '%',
						'default'   => 0,
						'condition' => function( $attrs ) {
							return ( ! isset( $attrs['borderRadiusBox'] ) ) && ! ( isset( $attrs['borderRadiusType'] ) && 'unlinked' === $attrs['borderRadiusType'] ) && isset( $attrs['borderRadius'] ) && is_numeric( $attrs['borderRadius'] );
						},
					),
					array(
						'property'       => '--border-radius',
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
							return ( ! isset( $attrs['borderRadiusBox'] ) ) && isset( $attrs['borderRadiusType'] ) && 'unlinked' === $attrs['borderRadiusType'] && isset( $attrs['borderRadius'] ) && is_numeric( $attrs['borderRadius'] );
						},
					),
					array(
						'property' => '--background-color',
						'value'    => 'backgroundColor',
					),
					array(
						'property' => '--border-color',
						'value'    => 'borderColor',
					),
					array(
						'property' => '--border-style',
						'value'    => 'borderStyle',
					),
					array(
						'property' => '--border-radius',
						'value'    => 'borderRadiusBox',
						'format'   => function( $value, $attrs ) {
							return CSS_Utility::box_values(
								$value,
								array(
									'left'   => '0px',
									'right'  => '0px',
									'top'    => '0px',
									'bottom' => '0px',
								)
							);
						},
					),
					array(
						'property' => '--container-width',
						'value'    => 'containerWidth',
					),
					array(
						'property' => '--container-width-tablet',
						'value'    => 'containerWidthTablet',
					),
					array(
						'property' => '--container-width-mobile',
						'value'    => 'containerWidthMobile',
					),
					array(
						'property' => '--height',
						'value'    => 'height',
						'unit'     => 'px',
					),
					array(
						'property' => '--height-tablet',
						'value'    => 'heightTablet',
						'unit'     => 'px',
					),
					array(
						'property' => '--height-mobile',
						'value'    => 'heightMobile',
						'unit'     => 'px',
					),
					array(
						'property' => '--border-width',
						'value'    => 'borderWidth',
						'unit'     => 'px',
					),
					array(
						'property' => '--border-width-tablet',
						'value'    => 'borderWidthTablet',
						'unit'     => 'px',
					),
					array(
						'property' => '--border-width-mobile',
						'value'    => 'borderWidthMobile',
						'unit'     => 'px',
					),
					array(
						'property' => '--gap',
						'value'    => 'gap',
						'unit'     => 'px',
					),
					array(
						'property' => '--gap-tablet',
						'value'    => 'gapTablet',
						'unit'     => 'px',
					),
					array(
						'property' => '--gap-mobile',
						'value'    => 'gapMobile',
						'unit'     => 'px',
					),
					array(
						'property' => '--alignment',
						'value'    => 'alignment',
					),
					array(
						'property' => '--value-font-size',
						'value'    => 'valueFontSize',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
					),
					array(
						'property' => '--value-font-size-tablet',
						'value'    => 'valueFontSizeTablet',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
					),
					array(
						'property' => '--value-font-size-mobile',
						'value'    => 'valueFontSizeMobile',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
					),
					array(
						'property' => '--label-font-size',
						'value'    => 'labelFontSize',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
					),
					array(
						'property' => '--label-font-size-tablet',
						'value'    => 'labelFontSizeTablet',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
					),
					array(
						'property' => '--label-font-size-mobile',
						'value'    => 'labelFontSizeMobile',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
					),
					array(
						'property' => '--value-font-weight',
						'value'    => 'valueFontWeight',
					),
					array(
						'property' => '--label-font-weight',
						'value'    => 'labelFontWeight',
					),
					array(
						'property' => '--padding',
						'value'    => 'padding',
						'format'   => function( $value, $attrs ) {
							return CSS_Utility::box_values(
								$value,
								array(
									'left'   => '0px',
									'right'  => '0px',
									'top'    => '0px',
									'bottom' => '0px',
								)
							);
						},
					),
					array(
						'property' => '--padding-tablet',
						'value'    => 'paddingTablet',
						'format'   => function( $value, $attrs ) {
							return CSS_Utility::box_values(
								$value,
								array(
									'left'   => '0px',
									'right'  => '0px',
									'top'    => '0px',
									'bottom' => '0px',
								)
							);
						},
					),
					array(
						'property' => '--padding-mobile',
						'value'    => 'paddingMobile',
						'format'   => function( $value, $attrs ) {
							return CSS_Utility::box_values(
								$value,
								array(
									'left'   => '0px',
									'right'  => '0px',
									'top'    => '0px',
									'bottom' => '0px',
								)
							);
						},
					),
					array(
						'property'  => 'display',
						'value'     => 'exclude',
						'format'    => function( $value, $attrs ) {
							return 'none';
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['exclude'] ) && is_array( $attrs['exclude'] ) && 4 === count( $attrs['exclude'] );
						}, 
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

		$css->add_item(
			array(
				'selector'   => ' .otter-countdown__container .otter-countdown__display .otter-countdown__display-area[name="separator"] .otter-countdown__value',
				'properties' => array(
					array(
						'property' => 'color',
						'value'    => 'separatorColor',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .otter-countdown__container .otter-countdown__display .otter-countdown__display-area[name="separator"] .otter-countdown__label',
				'properties' => array(
					array(
						'property'  => 'display',
						'default'   => 'none',
						'condition' => function( $attrs ) {
							return isset( $attrs['separatorAlignment'] ) && 'center' === $attrs['separatorAlignment'];
						},
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
