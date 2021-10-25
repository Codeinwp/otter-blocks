<?php
/**
 * Css handling logic for Column.
 *
 * @package ThemeIsle\GutenbergBlocks\CSS\Blocks
 */

namespace ThemeIsle\GutenbergBlocks\CSS\Blocks;

use ThemeIsle\GutenbergBlocks\Base_CSS;

use ThemeIsle\GutenbergBlocks\CSS\CSS_Utility;

/**
 * Class Advanced_Column_CSS
 */
class Advanced_Column_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'advanced-column';

	/**
	 * Generate Advanced Column CSS
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
						'property'  => 'padding',
						'value'     => 'padding',
						'unit'      => 'px',
						'default'   => 20,
						'condition' => function( $attrs ) {
							return ! ( isset( $attrs['paddingType'] ) && 'unlinked' === $attrs['paddingType'] );
						},
					),
					array(
						'property'  => 'padding-top',
						'value'     => 'paddingTop',
						'unit'      => 'px',
						'default'   => 20,
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingType'] ) && 'unlinked' === $attrs['paddingType'];
						},
					),
					array(
						'property'  => 'padding-right',
						'value'     => 'paddingRight',
						'unit'      => 'px',
						'default'   => 20,
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingType'] ) && 'unlinked' === $attrs['paddingType'];
						},
					),
					array(
						'property'  => 'padding-bottom',
						'value'     => 'paddingBottom',
						'unit'      => 'px',
						'default'   => 20,
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingType'] ) && 'unlinked' === $attrs['paddingType'];
						},
					),
					array(
						'property'  => 'padding-left',
						'value'     => 'paddingLeft',
						'unit'      => 'px',
						'default'   => 20,
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingType'] ) && 'unlinked' === $attrs['paddingType'];
						},
					),
					array(
						'property'  => 'margin',
						'value'     => 'margin',
						'unit'      => 'px',
						'default'   => 20,
						'condition' => function( $attrs ) {
							return isset( $attrs['marginType'] ) && 'linked' === $attrs['marginType'];
						},
					),
					array(
						'property'  => 'margin-top',
						'value'     => 'marginTop',
						'unit'      => 'px',
						'default'   => 20,
						'condition' => function( $attrs ) {
							return ! ( isset( $attrs['marginType'] ) && 'linked' === $attrs['marginType'] );
						},
					),
					array(
						'property'  => 'margin-right',
						'value'     => 'marginRight',
						'unit'      => 'px',
						'default'   => 0,
						'condition' => function( $attrs ) {
							return ! ( isset( $attrs['marginType'] ) && 'linked' === $attrs['marginType'] );
						},
					),
					array(
						'property'  => 'margin-bottom',
						'value'     => 'marginBottom',
						'unit'      => 'px',
						'default'   => 20,
						'condition' => function( $attrs ) {
							return ! ( isset( $attrs['marginType'] ) && 'linked' === $attrs['marginType'] );
						},
					),
					array(
						'property'  => 'margin-left',
						'value'     => 'marginLeft',
						'unit'      => 'px',
						'default'   => 0,
						'condition' => function( $attrs ) {
							return ! ( isset( $attrs['marginType'] ) && 'linked' === $attrs['marginType'] );
						},
					),
					array(
						'property'  => 'background',
						'value'     => 'backgroundColor',
						'condition' => function( $attrs ) {
							return ! ( isset( $attrs['backgroundType'] ) && 'color' !== $attrs['backgroundType'] );
						},
					),
					array(
						'property'       => 'background',
						'pattern'        => 'url( imageURL ) repeat attachment position/size',
						'pattern_values' => array(
							'imageURL'   => array(
								'value' => 'backgroundImageURL',
							),
							'repeat'     => array(
								'value'   => 'backgroundRepeat',
								'default' => 'repeat',
							),
							'attachment' => array(
								'value'   => 'backgroundAttachment',
								'default' => 'scroll',
							),
							'position'   => array(
								'value'   => 'backgroundPosition',
								'default' => 'top left',
							),
							'size'       => array(
								'value'   => 'backgroundSize',
								'default' => 'auto',
							),
						),
						'condition'      => function( $attrs ) {
							return isset( $attrs['backgroundType'] ) && 'image' === $attrs['backgroundType'] && isset( $attrs['backgroundImageURL'] );
						},
					),
					array(
						'property'  => 'background',
						'value'     => 'backgroundGradient',
						'default'   => 'linear-gradient(90deg,rgba(54,209,220,1) 0%,rgba(91,134,229,1) 100%)',
						'condition' => function( $attrs ) {
							return isset( $attrs['backgroundType'] ) && 'gradient' === $attrs['backgroundType'] && isset( $attrs['backgroundGradient'] );
						},
					),
					array(
						'property'       => 'background',
						'pattern'        => 'linear-gradient( angle, firstColor firstLocation, secondColor secondLocation )',
						'pattern_values' => array(
							'angle'          => array(
								'value'   => 'backgroundGradientAngle',
								'unit'    => 'deg',
								'default' => 90,
							),
							'firstColor'     => array(
								'value'   => 'backgroundGradientFirstColor',
								'default' => '#36d1dc',
							),
							'firstLocation'  => array(
								'value'   => 'backgroundGradientFirstLocation',
								'unit'    => '%',
								'default' => 0,
							),
							'secondColor'    => array(
								'value'   => 'backgroundGradientSecondColor',
								'default' => '#5b86e5',
							),
							'secondLocation' => array(
								'value'   => 'backgroundGradientSecondLocation',
								'unit'    => '%',
								'default' => 100,
							),
						),
						'condition'      => function( $attrs ) {
							return isset( $attrs['backgroundType'] ) && 'gradient' === $attrs['backgroundType'] && ! isset( $attrs['backgroundGradient'] );
						},
					),
					array(
						'property'       => 'background',
						'pattern'        => 'radial-gradient( at position, firstColor firstLocation, secondColor secondLocation )',
						'pattern_values' => array(
							'position'       => array(
								'value'   => 'backgroundGradientPosition',
								'default' => 'center center',
							),
							'firstColor'     => array(
								'value'   => 'backgroundGradientFirstColor',
								'default' => '#36d1dc',
							),
							'firstLocation'  => array(
								'value'   => 'backgroundGradientFirstLocation',
								'unit'    => '%',
								'default' => 0,
							),
							'secondColor'    => array(
								'value'   => 'backgroundGradientSecondColor',
								'default' => '#5b86e5',
							),
							'secondLocation' => array(
								'value'   => 'backgroundGradientSecondLocation',
								'unit'    => '%',
								'default' => 100,
							),
						),
						'condition'      => function( $attrs ) {
							return isset( $attrs['backgroundType'] ) && 'gradient' === $attrs['backgroundType'] && isset( $attrs['backgroundGradientType'] ) && 'radial' === $attrs['backgroundGradientType'];
						},
					),
					array(
						'property'       => 'border',
						'pattern'        => 'width solid color',
						'pattern_values' => array(
							'width' => array(
								'value'   => 'border',
								'unit'    => 'px',
								'default' => 0,
							),
							'color' => array(
								'value'   => 'borderColor',
								'default' => '#000000',
							),
						),
						'condition'      => function( $attrs ) {
							return ! ( isset( $attrs['borderType'] ) && 'unlinked' === $attrs['borderType'] );
						},
					),
					array(
						'property'       => 'border-width',
						'pattern'        => 'top right bottom left',
						'pattern_values' => array(
							'top'    => array(
								'value'   => 'borderTop',
								'unit'    => 'px',
								'default' => 0,
							),
							'right'  => array(
								'value'   => 'borderRight',
								'unit'    => 'px',
								'default' => 0,
							),
							'bottom' => array(
								'value'   => 'borderBottom',
								'unit'    => 'px',
								'default' => 0,
							),
							'left'   => array(
								'value'   => 'borderLeft',
								'unit'    => 'px',
								'default' => 0,
							),
						),
						'condition'      => function( $attrs ) {
							return isset( $attrs['borderType'] ) && 'unlinked' === $attrs['borderType'];
						},
					),
					array(
						'property'  => 'border-style',
						'default'   => 'solid',
						'condition' => function( $attrs ) {
							return isset( $attrs['borderType'] ) && 'unlinked' === $attrs['borderType'];
						},
					),
					array(
						'property'  => 'border-color',
						'value'     => 'borderColor',
						'default'   => '#000000',
						'condition' => function( $attrs ) {
							return isset( $attrs['borderType'] ) && 'unlinked' === $attrs['borderType'];
						},
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
								'value'   => 'borderRadiusTop',
								'unit'    => 'px',
								'default' => 0,
							),
							'top-right'    => array(
								'value'   => 'borderRadiusRight',
								'unit'    => 'px',
								'default' => 0,
							),
							'bottom-right' => array(
								'value'   => 'borderRadiusBottom',
								'unit'    => 'px',
								'default' => 0,
							),
							'bottom-left'  => array(
								'value'   => 'borderRadiusLeft',
								'unit'    => 'px',
								'default' => 0,
							),
						),
						'condition'      => function( $attrs ) {
							return isset( $attrs['borderRadiusType'] ) && 'unlinked' === $attrs['borderRadiusType'];
						},
					),
					array(
						'property'       => 'box-shadow',
						'pattern'        => 'horizontal vertical blur spread color',
						'pattern_values' => array(
							'horizontal' => array(
								'value'   => 'boxShadowHorizontal',
								'unit'    => 'px',
								'default' => 0,
							),
							'vertical'   => array(
								'value'   => 'boxShadowVertical',
								'unit'    => 'px',
								'default' => 0,
							),
							'blur'       => array(
								'value'   => 'boxShadowBlur',
								'unit'    => 'px',
								'default' => 5,
							),
							'spread'     => array(
								'value'   => 'boxShadowSpread',
								'unit'    => 'px',
								'default' => 1,
							),
							'color'      => array(
								'value'   => 'boxShadowColor',
								'default' => '#000',
								'format'  => function( $value, $attrs ) {
									$opacity = ( isset( $attrs['boxShadowColorOpacity'] ) ? $attrs['boxShadowColorOpacity'] : 50 ) / 100;
									return $this->hex2rgba( $value, $opacity );
								},
							),
						),
						'condition'      => function( $attrs ) {
							return isset( $attrs['boxShadow'] ) && true === $attrs['boxShadow'];
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'query'      => '@media ( min-width: 960px )',
				'properties' => array(
					array(
						'property' => 'flex-basis',
						'value'    => 'columnWidth',
						'unit'     => '%',
						'format'   => function( $value, $attrs ) {
							return floatval( $value );
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'query'      => '@media ( min-width: 600px ) and ( max-width: 960px )',
				'properties' => array(
					array(
						'property'  => 'padding',
						'value'     => 'paddingTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ! ( isset( $attrs['paddingTypeTablet'] ) && 'unlinked' === $attrs['paddingTypeTablet'] );
						},
					),
					array(
						'property'  => 'padding-top',
						'value'     => 'paddingTopTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingTypeTablet'] ) && 'unlinked' === $attrs['paddingTypeTablet'];
						},
					),
					array(
						'property'  => 'padding-right',
						'value'     => 'paddingRightTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingTypeTablet'] ) && 'unlinked' === $attrs['paddingTypeTablet'];
						},
					),
					array(
						'property'  => 'padding-bottom',
						'value'     => 'paddingBottomTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingTypeTablet'] ) && 'unlinked' === $attrs['paddingTypeTablet'];
						},
					),
					array(
						'property'  => 'padding-left',
						'value'     => 'paddingLeftTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingTypeTablet'] ) && 'unlinked' === $attrs['paddingTypeTablet'];
						},
					),
					array(
						'property'  => 'margin',
						'value'     => 'marginTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['marginTypeTablet'] ) && 'linked' === $attrs['marginTypeTablet'];
						},
					),
					array(
						'property'  => 'margin-top',
						'value'     => 'marginTopTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ! ( isset( $attrs['marginTypeTablet'] ) && 'linked' === $attrs['marginTypeTablet'] );
						},
					),
					array(
						'property'  => 'margin-right',
						'value'     => 'marginRightTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ! ( isset( $attrs['marginTypeTablet'] ) && 'linked' === $attrs['marginTypeTablet'] );
						},
					),
					array(
						'property'  => 'margin-bottom',
						'value'     => 'marginBottomTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ! ( isset( $attrs['marginTypeTablet'] ) && 'linked' === $attrs['marginTypeTablet'] );
						},
					),
					array(
						'property'  => 'margin-left',
						'value'     => 'marginLeftTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ! ( isset( $attrs['marginTypeTablet'] ) && 'linked' === $attrs['marginTypeTablet'] );
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'query'      => '@media ( max-width: 600px )',
				'properties' => array(
					array(
						'property'  => 'padding',
						'value'     => 'paddingMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ! ( isset( $attrs['paddingTypeMobile'] ) && 'unlinked' === $attrs['paddingTypeMobile'] );
						},
					),
					array(
						'property'  => 'padding-top',
						'value'     => 'paddingTopMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingTypeMobile'] ) && 'unlinked' === $attrs['paddingTypeMobile'];
						},
					),
					array(
						'property'  => 'padding-right',
						'value'     => 'paddingRightMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingTypeMobile'] ) && 'unlinked' === $attrs['paddingTypeMobile'];
						},
					),
					array(
						'property'  => 'padding-bottom',
						'value'     => 'paddingBottomMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingTypeMobile'] ) && 'unlinked' === $attrs['paddingTypeMobile'];
						},
					),
					array(
						'property'  => 'padding-left',
						'value'     => 'paddingLeftMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingTypeMobile'] ) && 'unlinked' === $attrs['paddingTypeMobile'];
						},
					),
					array(
						'property'  => 'margin',
						'value'     => 'marginMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['marginTypeMobile'] ) && 'linked' === $attrs['marginTypeMobile'];
						},
					),
					array(
						'property'  => 'margin-top',
						'value'     => 'marginTopMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ! ( isset( $attrs['marginTypeMobile'] ) && 'linked' === $attrs['marginTypeMobile'] );
						},
					),
					array(
						'property'  => 'margin-right',
						'value'     => 'marginRightMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ! ( isset( $attrs['marginTypeMobile'] ) && 'linked' === $attrs['marginTypeMobile'] );
						},
					),
					array(
						'property'  => 'margin-bottom',
						'value'     => 'marginBottomMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ! ( isset( $attrs['marginTypeMobile'] ) && 'linked' === $attrs['marginTypeMobile'] );
						},
					),
					array(
						'property'  => 'margin-left',
						'value'     => 'marginLeftMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ! ( isset( $attrs['marginTypeMobile'] ) && 'linked' === $attrs['marginTypeMobile'] );
						},
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
