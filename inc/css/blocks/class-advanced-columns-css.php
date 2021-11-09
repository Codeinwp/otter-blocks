<?php
/**
 * Css handling logic for columns.
 *
 * @package ThemeIsle\GutenbergBlocks\CSS\Blocks
 */

namespace ThemeIsle\GutenbergBlocks\CSS\Blocks;

use ThemeIsle\GutenbergBlocks\Base_CSS;

use ThemeIsle\GutenbergBlocks\CSS\CSS_Utility;

/**
 * Class Advanced_Columns_CSS
 */
class Advanced_Columns_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'advanced-columns';

	/**
	 * Generate Advanced Columns CSS
	 *
	 * @param mixed $block Block data.
	 * @return string
	 * @since   1.3.0
	 * @access  public
	 */
	public function render_css( $block ) {
		$css   = new CSS_Utility( $block );
		$attrs = $block['attrs'];

		$old_attributes = array(
			'padding',
			'paddingTablet',
			'paddingMobile',
			'paddingTop',
			'paddingTopTablet',
			'paddingTopMobile',
			'paddingRight',
			'paddingRightTablet',
			'paddingRightMobile',
			'paddingBottom',
			'paddingBottomTablet',
			'paddingBottomMobile',
			'paddingLeft',
			'paddingLeftTablet',
			'paddingLeftMobile',
			'margin',
			'marginTablet',
			'marginMobile',
			'marginTop',
			'marginTopTablet',
			'marginTopMobile',
			'marginBottom',
			'marginBottomTablet',
			'marginBottomMobile',
			'borderType',
			'border',
			'borderTop',
			'borderRight',
			'borderBottom',
			'borderLeft',
			'borderRadiusType',
			'borderRadius',
			'borderRadiusTop',
			'borderRadiusRight',
			'borderRadiusBottom',
			'borderRadiusLeft',
		);

		$uses_old_sizing = $this->array_any(
			$old_attributes,
			function( $value ) use ( $attrs ) {
				return isset( $attrs[ $value ] ) && is_numeric( $attrs[ $value ] );
			} 
		);

		$css->add_item(
			array(
				'properties' => array(
					array(
						'property'  => 'padding-top',
						'value'     => 'padding',
						'format'    => function( $value, $attrs ) {
							return $value['top'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['padding'] ) && isset( $attrs['padding']['top'] );
						},
					),
					array(
						'property'  => 'padding-bottom',
						'value'     => 'padding',
						'format'    => function( $value, $attrs ) {
							return $value['bottom'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['padding'] ) && isset( $attrs['padding']['bottom'] );
						},
					),
					array(
						'property'  => 'padding-left',
						'value'     => 'padding',
						'format'    => function( $value, $attrs ) {
							return $value['left'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['padding'] ) && isset( $attrs['padding']['left'] );
						},
					),
					array(
						'property'  => 'padding-right',
						'value'     => 'padding',
						'format'    => function( $value, $attrs ) {
							return $value['right'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['padding'] ) && isset( $attrs['padding']['right'] );
						},
					),
					array(
						'property'  => 'margin-top',
						'value'     => 'margin',
						'format'    => function( $value, $attrs ) {
							return $value['top'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['margin'] ) && isset( $attrs['margin']['top'] );
						},
					),
					array(
						'property'  => 'margin-bottom',
						'value'     => 'margin',
						'format'    => function( $value, $attrs ) {
							return $value['bottom'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['margin'] ) && isset( $attrs['margin']['bottom'] );
						},
					),
					array(
						'property'  => 'padding-right',
						'value'     => 'paddingRight',
						'unit'      => 'px',
						'default'   => 20,
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return isset( $attrs['paddingType'] ) && 'unlinked' === $attrs['paddingType'] && true === $uses_old_sizing;
						},
					),
					array(
						'property'  => 'padding-bottom',
						'value'     => 'paddingBottom',
						'unit'      => 'px',
						'default'   => 20,
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return isset( $attrs['paddingType'] ) && 'unlinked' === $attrs['paddingType'] && true === $uses_old_sizing;
						},
					),
					array(
						'property'  => 'padding-left',
						'value'     => 'paddingLeft',
						'unit'      => 'px',
						'default'   => 20,
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return isset( $attrs['paddingType'] ) && 'unlinked' === $attrs['paddingType'] && true === $uses_old_sizing;
						},
					),
					array(
						'property'  => 'padding',
						'value'     => 'padding',
						'unit'      => 'px',
						'default'   => 20,
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return ! ( isset( $attrs['paddingType'] ) && 'unlinked' === $attrs['paddingType'] ) && true === $uses_old_sizing;
						},
					),
					array(
						'property'  => 'padding-top',
						'value'     => 'paddingTop',
						'unit'      => 'px',
						'default'   => 20,
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return isset( $attrs['paddingType'] ) && 'unlinked' === $attrs['paddingType'] && true === $uses_old_sizing;
						},
					),
					array(
						'property'  => 'padding-right',
						'value'     => 'paddingRight',
						'unit'      => 'px',
						'default'   => 20,
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return isset( $attrs['paddingType'] ) && 'unlinked' === $attrs['paddingType'] && true === $uses_old_sizing;
						},
					),
					array(
						'property'  => 'padding-bottom',
						'value'     => 'paddingBottom',
						'unit'      => 'px',
						'default'   => 20,
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return isset( $attrs['paddingType'] ) && 'unlinked' === $attrs['paddingType'] && true === $uses_old_sizing;
						},
					),
					array(
						'property'  => 'padding-left',
						'value'     => 'paddingLeft',
						'unit'      => 'px',
						'default'   => 20,
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return isset( $attrs['paddingType'] ) && 'unlinked' === $attrs['paddingType'] && true === $uses_old_sizing;
						},
					),
					array(
						'property'  => 'margin-top',
						'value'     => 'margin',
						'unit'      => 'px',
						'default'   => 20,
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return isset( $attrs['marginType'] ) && 'linked' === $attrs['marginType'] && true === $uses_old_sizing;
						},
					),
					array(
						'property'  => 'margin-bottom',
						'value'     => 'margin',
						'unit'      => 'px',
						'default'   => 20,
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return isset( $attrs['marginType'] ) && 'linked' === $attrs['marginType'] && true === $uses_old_sizing;
						},
					),
					array(
						'property'  => 'margin-top',
						'value'     => 'marginTop',
						'unit'      => 'px',
						'default'   => 20,
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return ! ( isset( $attrs['marginType'] ) && 'linked' === $attrs['marginType'] ) && true === $uses_old_sizing;
						},
					),
					array(
						'property'  => 'margin-bottom',
						'value'     => 'marginBottom',
						'unit'      => 'px',
						'default'   => 20,
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return ! ( isset( $attrs['marginType'] ) && 'linked' === $attrs['marginType'] ) && true === $uses_old_sizing;
						},
					),
					array(
						'property' => 'justify-content',
						'value'    => 'horizontalAlign',
						'default'  => 'unset',
					),
					array(
						'property'  => 'min-height',
						'value'     => 'columnsHeight',
						'default'   => 'auto',
						'condition' => function( $attrs ) {
							return ! isset( $attrs['columnsHeight'] ) || 'custom' !== $attrs['columnsHeight'];
						},
					),
					array(
						'property'  => 'min-height',
						'value'     => 'columnsHeightCustom',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['columnsHeight'] ) && 'custom' === $attrs['columnsHeight'];
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
						'property'       => 'border-width',
						'pattern'        => 'top right bottom left',
						'pattern_values' => array(
							'top'    => array(
								'value'   => 'border',
								'default' => 0,
								'format'  => function( $value, $attrs ) {
									return $value['top'];
								},
							),
							'right'  => array(
								'value'   => 'border',
								'default' => 0,
								'format'  => function( $value, $attrs ) {
									return $value['right'];
								},
							),
							'bottom' => array(
								'value'   => 'border',
								'default' => 0,
								'format'  => function( $value, $attrs ) {
									return $value['bottom'];
								},
							),
							'left'   => array(
								'value'   => 'border',
								'default' => 0,
								'format'  => function( $value, $attrs ) {
									return $value['left'];
								},
							),
						),
						'condition'      => function( $attrs ) {
							return isset( $attrs['border'] ) && is_array( $attrs['border'] );
						},
					),
					array(
						'property'  => 'border-style',
						'default'   => 'solid',
						'condition' => function( $attrs ) {
							return isset( $attrs['border'] ) && is_array( $attrs['border'] );
						},
					),
					array(
						'property'  => 'border-color',
						'value'     => 'borderColor',
						'default'   => '#000000',
						'condition' => function( $attrs ) {
							return isset( $attrs['border'] ) && is_array( $attrs['border'] );
						},
					),
					array(
						'property'       => 'border-radius',
						'pattern'        => 'top-left top-right bottom-right bottom-left',
						'pattern_values' => array(
							'top-left'     => array(
								'value'   => 'borderRadius',
								'default' => 0,
								'format'  => function( $value, $attrs ) {
									return $value['top'];
								},
							),
							'top-right'    => array(
								'value'   => 'borderRadius',
								'default' => 0,
								'format'  => function( $value, $attrs ) {
									return $value['right'];
								},
							),
							'bottom-right' => array(
								'value'   => 'borderRadius',
								'default' => 0,
								'format'  => function( $value, $attrs ) {
									return $value['bottom'];
								},
							),
							'bottom-left'  => array(
								'value'   => 'borderRadius',
								'default' => 0,
								'format'  => function( $value, $attrs ) {
									return $value['left'];
								},
							),
						),
						'condition'      => function( $attrs ) {
							return isset( $attrs['borderRadius'] ) && is_array( $attrs['borderRadius'] );
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
						'condition'      => function( $attrs ) use ( $uses_old_sizing ) {
							return ! ( isset( $attrs['borderType'] ) && 'unlinked' === $attrs['borderType'] ) && true === $uses_old_sizing;
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
						'condition'      => function( $attrs ) use ( $uses_old_sizing ) {
							return isset( $attrs['borderType'] ) && 'unlinked' === $attrs['borderType'] && true === $uses_old_sizing;
						},
					),
					array(
						'property'  => 'border-style',
						'default'   => 'solid',
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return isset( $attrs['borderType'] ) && 'unlinked' === $attrs['borderType'] && true === $uses_old_sizing;
						},
					),
					array(
						'property'  => 'border-color',
						'value'     => 'borderColor',
						'default'   => '#000000',
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return isset( $attrs['borderType'] ) && 'unlinked' === $attrs['borderType'] && true === $uses_old_sizing;
						},
					),
					array(
						'property'  => 'border-radius',
						'value'     => 'borderRadius',
						'unit'      => 'px',
						'default'   => 0,
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return ! ( isset( $attrs['borderRadiusType'] ) && 'unlinked' === $attrs['borderRadiusType'] ) && true === $uses_old_sizing;
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
						'condition'      => function( $attrs ) use ( $uses_old_sizing ) {
							return isset( $attrs['borderRadiusType'] ) && 'unlinked' === $attrs['borderRadiusType'] && true === $uses_old_sizing;
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
				'selector'   => ' > .wp-block-themeisle-blocks-advanced-columns-overlay',
				'properties' => array(
					array(
						'property'  => 'background',
						'value'     => 'backgroundOverlayColor',
						'condition' => function( $attrs ) {
							return ! ( isset( $attrs['backgroundOverlayType'] ) && 'color' !== $attrs['backgroundOverlayType'] );
						},
					),
					array(
						'property' => 'opacity',
						'value'    => 'backgroundOverlayOpacity',
						'default'  => 50,
						'format'   => function( $value, $attrs ) {
							return $value / 100;
						},
					),
					array(
						'property'       => 'background',
						'pattern'        => 'url( imageURL ) repeat attachment position/size',
						'pattern_values' => array(
							'imageURL'   => array(
								'value' => 'backgroundOverlayImageURL',
							),
							'repeat'     => array(
								'value'   => 'backgroundOverlayRepeat',
								'default' => 'repeat',
							),
							'attachment' => array(
								'value'   => 'backgroundOverlayAttachment',
								'default' => 'scroll',
							),
							'position'   => array(
								'value'   => 'backgroundOverlayPosition',
								'default' => 'top left',
							),
							'size'       => array(
								'value'   => 'backgroundOverlaySize',
								'default' => 'auto',
							),
						),
						'condition'      => function( $attrs ) {
							return isset( $attrs['backgroundOverlayType'] ) && 'image' === $attrs['backgroundOverlayType'] && isset( $attrs['backgroundOverlayImageURL'] );
						},
					),
					array(
						'property'  => 'background',
						'value'     => 'backgroundOverlayGradient',
						'default'   => 'linear-gradient(90deg,rgba(54,209,220,1) 0%,rgba(91,134,229,1) 100%)',
						'condition' => function( $attrs ) {
							return isset( $attrs['backgroundOverlayType'] ) && 'gradient' === $attrs['backgroundOverlayType'] && isset( $attrs['backgroundOverlayGradient'] );
						},
					),
					array(
						'property'       => 'background',
						'pattern'        => 'linear-gradient( angle, firstColor firstLocation, secondColor secondLocation )',
						'pattern_values' => array(
							'angle'          => array(
								'value'   => 'backgroundOverlayGradientAngle',
								'unit'    => 'deg',
								'default' => 90,
							),
							'firstColor'     => array(
								'value'   => 'backgroundOverlayGradientFirstColor',
								'default' => '#36d1dc',
							),
							'firstLocation'  => array(
								'value'   => 'backgroundOverlayGradientFirstLocation',
								'unit'    => '%',
								'default' => 0,
							),
							'secondColor'    => array(
								'value'   => 'backgroundOverlayGradientSecondColor',
								'default' => '#5b86e5',
							),
							'secondLocation' => array(
								'value'   => 'backgroundOverlayGradientSecondLocation',
								'unit'    => '%',
								'default' => 100,
							),
						),
						'condition'      => function( $attrs ) {
							return isset( $attrs['backgroundOverlayType'] ) && 'gradient' === $attrs['backgroundOverlayType'] && ! isset( $attrs['backgroundOverlayGradient'] );
						},
					),
					array(
						'property'       => 'background',
						'pattern'        => 'radial-gradient( at position, firstColor firstLocation, secondColor secondLocation )',
						'pattern_values' => array(
							'position'       => array(
								'value'   => 'backgroundOverlayGradientPosition',
								'default' => 'center center',
							),
							'firstColor'     => array(
								'value'   => 'backgroundOverlayGradientFirstColor',
								'default' => '#36d1dc',
							),
							'firstLocation'  => array(
								'value'   => 'backgroundOverlayGradientFirstLocation',
								'unit'    => '%',
								'default' => 0,
							),
							'secondColor'    => array(
								'value'   => 'backgroundOverlayGradientSecondColor',
								'default' => '#5b86e5',
							),
							'secondLocation' => array(
								'value'   => 'backgroundOverlayGradientSecondLocation',
								'unit'    => '%',
								'default' => 100,
							),
						),
						'condition'      => function( $attrs ) {
							return isset( $attrs['backgroundOverlayType'] ) && 'gradient' === $attrs['backgroundOverlayType'] && isset( $attrs['backgroundOverlayGradientType'] ) && 'radial' === $attrs['backgroundOverlayGradientType'];
						},
					),
					array(
						'property'       => 'filter',
						'pattern'        => 'blur( filterBlur ) brightness( filterBrightness ) contrast( filterContrast ) grayscale( filterGrayscale ) hue-rotate( filterHue ) saturate( filterSaturate )',
						'pattern_values' => array(
							'filterBlur'       => array(
								'value'   => 'backgroundOverlayFilterBlur',
								'unit'    => 'px',
								'default' => 0,
								'format'  => function( $value, $attrs ) {
									return $value / 10;
								},
							),
							'filterBrightness' => array(
								'value'   => 'backgroundOverlayFilterBrightness',
								'default' => 10,
								'format'  => function( $value, $attrs ) {
									return $value / 10;
								},
							),
							'filterContrast'   => array(
								'value'   => 'backgroundOverlayFilterContrast',
								'default' => 10,
								'format'  => function( $value, $attrs ) {
									return $value / 10;
								},
							),
							'filterGrayscale'  => array(
								'value'   => 'backgroundOverlayFilterGrayscale',
								'default' => 0,
								'format'  => function( $value, $attrs ) {
									return $value / 100;
								},
							),
							'filterHue'        => array(
								'value'   => 'backgroundOverlayFilterHue',
								'unit'    => 'deg',
								'default' => 0,
							),
							'filterSaturate'   => array(
								'value'   => 'backgroundOverlayFilterSaturate',
								'default' => 10,
								'format'  => function( $value, $attrs ) {
									return $value / 10;
								},
							),
						),
						'condition'      => function( $attrs ) {
							return isset( $attrs['backgroundOverlayFilterBlur'] );
						},
					),
					array(
						'property' => 'mix-blend-mode',
						'value'    => 'backgroundOverlayBlend',
						'default'  => 'normal',
					),
					array(
						'property'       => 'border-radius',
						'pattern'        => 'top-left top-right bottom-right bottom-left',
						'pattern_values' => array(
							'top-left'     => array(
								'value'   => 'borderRadius',
								'default' => 0,
								'format'  => function( $value, $attrs ) {
									return $value['top'];
								},
							),
							'top-right'    => array(
								'value'   => 'borderRadius',
								'default' => 0,
								'format'  => function( $value, $attrs ) {
									return $value['right'];
								},
							),
							'bottom-right' => array(
								'value'   => 'borderRadius',
								'default' => 0,
								'format'  => function( $value, $attrs ) {
									return $value['bottom'];
								},
							),
							'bottom-left'  => array(
								'value'   => 'borderRadius',
								'default' => 0,
								'format'  => function( $value, $attrs ) {
									return $value['left'];
								},
							),
						),
						'condition'      => function( $attrs ) {
							return isset( $attrs['borderRadius'] ) && is_array( $attrs['borderRadius'] );
						},
					),
					array(
						'property'  => 'border-radius',
						'value'     => 'borderRadius',
						'unit'      => 'px',
						'default'   => 0,
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return ! ( isset( $attrs['borderRadiusType'] ) && 'unlinked' === $attrs['borderRadiusType'] ) && true === $uses_old_sizing;
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
						'condition'      => function( $attrs ) use ( $uses_old_sizing ) {
							return isset( $attrs['borderRadiusType'] ) && 'unlinked' === $attrs['borderRadiusType'] && true === $uses_old_sizing;
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-advanced-columns-separators.top svg',
				'properties' => array(
					array(
						'property' => 'height',
						'value'    => 'dividerTopHeight',
						'unit'     => 'px',
					),
					array(
						'property'       => 'transform',
						'pattern'        => 'scaleX( width )',
						'pattern_values' => array(
							'width' => array(
								'value'  => 'dividerTopWidth',
								'format' => function( $value, $attrs ) {
									return $value / 100;
								},
							),
						),
						'condition'      => function( $attrs ) {
							return isset( $attrs['dividerTopWidth'] );
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-advanced-columns-separators.bottom svg',
				'properties' => array(
					array(
						'property' => 'height',
						'value'    => 'dividerBottomHeight',
						'unit'     => 'px',
					),
					array(
						'property'       => 'transform',
						'pattern'        => 'scaleX( width )',
						'pattern_values' => array(
							'width' => array(
								'value'  => 'dividerBottomWidth',
								'format' => function( $value, $attrs ) {
									return $value / 100;
								},
							),
						),
						'condition'      => function( $attrs ) {
							return isset( $attrs['dividerBottomWidth'] );
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .innerblocks-wrap',
				'properties' => array(
					array(
						'property' => 'max-width',
						'value'    => 'columnsWidth',
						'unit'     => 'px',
					),
				),
			)
		);

		$css->add_item(
			array(
				'query'      => '@media ( min-width: 600px ) and ( max-width: 960px )',
				'properties' => array(
					array(
						'property'  => 'padding-top',
						'value'     => 'paddingTablet',
						'format'    => function( $value, $attrs ) {
							return $value['top'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingTablet'] ) && isset( $attrs['paddingTablet']['top'] );
						},
					),
					array(
						'property'  => 'padding-bottom',
						'value'     => 'paddingTablet',
						'format'    => function( $value, $attrs ) {
							return $value['bottom'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingTablet'] ) && isset( $attrs['paddingTablet']['bottom'] );
						},
					),
					array(
						'property'  => 'padding-left',
						'value'     => 'paddingTablet',
						'format'    => function( $value, $attrs ) {
							return $value['left'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingTablet'] ) && isset( $attrs['paddingTablet']['left'] );
						},
					),
					array(
						'property'  => 'padding-right',
						'value'     => 'paddingTablet',
						'format'    => function( $value, $attrs ) {
							return $value['right'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingTablet'] ) && isset( $attrs['paddingTablet']['right'] );
						},
					),
					array(
						'property'  => 'margin-top',
						'value'     => 'marginTablet',
						'format'    => function( $value, $attrs ) {
							return $value['top'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['marginTablet'] ) && isset( $attrs['marginTablet']['top'] );
						},
					),
					array(
						'property'  => 'margin-bottom',
						'value'     => 'marginTablet',
						'format'    => function( $value, $attrs ) {
							return $value['bottom'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['marginTablet'] ) && isset( $attrs['marginTablet']['bottom'] );
						},
					),
					array(
						'property'  => 'padding',
						'value'     => 'paddingTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return ! ( isset( $attrs['paddingTypeTablet'] ) && 'unlinked' === $attrs['paddingTypeTablet'] ) && true === $uses_old_sizing;
						},
					),
					array(
						'property'  => 'padding-top',
						'value'     => 'paddingTopTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return isset( $attrs['paddingTypeTablet'] ) && 'unlinked' === $attrs['paddingTypeTablet'] && true === $uses_old_sizing;
						},
					),
					array(
						'property'  => 'padding-right',
						'value'     => 'paddingRightTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return isset( $attrs['paddingTypeTablet'] ) && 'unlinked' === $attrs['paddingTypeTablet'] && true === $uses_old_sizing;
						},
					),
					array(
						'property'  => 'padding-bottom',
						'value'     => 'paddingBottomTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return isset( $attrs['paddingTypeTablet'] ) && 'unlinked' === $attrs['paddingTypeTablet'] && true === $uses_old_sizing;
						},
					),
					array(
						'property'  => 'padding-left',
						'value'     => 'paddingLeftTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return isset( $attrs['paddingTypeTablet'] ) && 'unlinked' === $attrs['paddingTypeTablet'] && true === $uses_old_sizing;
						},
					),
					array(
						'property'  => 'margin-top',
						'value'     => 'marginTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return isset( $attrs['marginTypeTablet'] ) && 'linked' === $attrs['marginTypeTablet'] && true === $uses_old_sizing;
						},
					),
					array(
						'property'  => 'margin-bottom',
						'value'     => 'marginTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return isset( $attrs['marginTypeTablet'] ) && 'linked' === $attrs['marginTypeTablet'] && true === $uses_old_sizing;
						},
					),
					array(
						'property'  => 'margin-top',
						'value'     => 'marginTopTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return ! ( isset( $attrs['marginTypeTablet'] ) && 'linked' === $attrs['marginTypeTablet'] ) && true === $uses_old_sizing;
						},
					),
					array(
						'property'  => 'margin-bottom',
						'value'     => 'marginBottomTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return ! ( isset( $attrs['marginTypeTablet'] ) && 'linked' === $attrs['marginTypeTablet'] ) && true === $uses_old_sizing;
						},
					),
					array(
						'property'  => 'min-height',
						'value'     => 'columnsHeightCustomTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['columnsHeight'] ) && 'custom' === $attrs['columnsHeight'];
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'query'      => '@media ( min-width: 600px ) and ( max-width: 960px )',
				'selector'   => ' .wp-block-themeisle-blocks-advanced-columns-separators.top svg',
				'properties' => array(
					array(
						'property' => 'height',
						'value'    => 'dividerTopHeightTablet',
						'unit'     => 'px',
					),
					array(
						'property'       => 'transform',
						'pattern'        => 'scaleX( width )',
						'pattern_values' => array(
							'width' => array(
								'value'  => 'dividerTopWidthTablet',
								'format' => function( $value, $attrs ) {
									return $value / 100;
								},
							),
						),
						'condition'      => function( $attrs ) {
							return isset( $attrs['dividerTopWidthTablet'] );
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'query'      => '@media ( min-width: 600px ) and ( max-width: 960px )',
				'selector'   => ' .wp-block-themeisle-blocks-advanced-columns-separators.bottom svg',
				'properties' => array(
					array(
						'property' => 'height',
						'value'    => 'dividerBottomHeightTablet',
						'unit'     => 'px',
					),
					array(
						'property'       => 'transform',
						'pattern'        => 'scaleX( width )',
						'pattern_values' => array(
							'width' => array(
								'value'  => 'dividerBottomWidthTablet',
								'format' => function( $value, $attrs ) {
									return $value / 100;
								},
							),
						),
						'condition'      => function( $attrs ) {
							return isset( $attrs['dividerBottomWidthTablet'] );
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
						'property'  => 'padding-top',
						'value'     => 'paddingMobile',
						'format'    => function( $value, $attrs ) {
							return $value['top'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingMobile'] ) && isset( $attrs['paddingMobile']['top'] );
						},
					),
					array(
						'property'  => 'padding-bottom',
						'value'     => 'paddingMobile',
						'format'    => function( $value, $attrs ) {
							return $value['bottom'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingMobile'] ) && isset( $attrs['paddingMobile']['bottom'] );
						},
					),
					array(
						'property'  => 'padding-left',
						'value'     => 'paddingMobile',
						'format'    => function( $value, $attrs ) {
							return $value['left'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingMobile'] ) && isset( $attrs['paddingMobile']['left'] );
						},
					),
					array(
						'property'  => 'padding-right',
						'value'     => 'paddingMobile',
						'format'    => function( $value, $attrs ) {
							return $value['right'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingMobile'] ) && isset( $attrs['paddingMobile']['right'] );
						},
					),
					array(
						'property'  => 'margin-top',
						'value'     => 'marginMobile',
						'format'    => function( $value, $attrs ) {
							return $value['top'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['marginMobile'] ) && isset( $attrs['marginMobile']['top'] );
						},
					),
					array(
						'property'  => 'margin-bottom',
						'value'     => 'marginMobile',
						'format'    => function( $value, $attrs ) {
							return $value['bottom'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['marginMobile'] ) && isset( $attrs['marginMobile']['bottom'] );
						},
					),
					array(
						'property'  => 'padding',
						'value'     => 'paddingMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return ! ( isset( $attrs['paddingTypeMobile'] ) && 'unlinked' === $attrs['paddingTypeMobile'] ) && true === $uses_old_sizing;
						},
					),
					array(
						'property'  => 'padding-top',
						'value'     => 'paddingTopMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return isset( $attrs['paddingTypeMobile'] ) && 'unlinked' === $attrs['paddingTypeMobile'] && true === $uses_old_sizing;
						},
					),
					array(
						'property'  => 'padding-right',
						'value'     => 'paddingRightMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return isset( $attrs['paddingTypeMobile'] ) && 'unlinked' === $attrs['paddingTypeMobile'] && true === $uses_old_sizing;
						},
					),
					array(
						'property'  => 'padding-bottom',
						'value'     => 'paddingBottomMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return isset( $attrs['paddingTypeMobile'] ) && 'unlinked' === $attrs['paddingTypeMobile'] && true === $uses_old_sizing;
						},
					),
					array(
						'property'  => 'padding-left',
						'value'     => 'paddingLeftMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return isset( $attrs['paddingTypeMobile'] ) && 'unlinked' === $attrs['paddingTypeMobile'] && true === $uses_old_sizing;
						},
					),
					array(
						'property'  => 'margin-top',
						'value'     => 'marginMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return isset( $attrs['marginTypeMobile'] ) && 'linked' === $attrs['marginTypeMobile'] && true === $uses_old_sizing;
						},
					),
					array(
						'property'  => 'margin-bottom',
						'value'     => 'marginMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return isset( $attrs['marginTypeMobile'] ) && 'linked' === $attrs['marginTypeMobile'] && true === $uses_old_sizing;
						},
					),
					array(
						'property'  => 'margin-top',
						'value'     => 'marginTopMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return ! ( isset( $attrs['marginTypeMobile'] ) && 'linked' === $attrs['marginTypeMobile'] ) && true === $uses_old_sizing;
						},
					),
					array(
						'property'  => 'margin-bottom',
						'value'     => 'marginBottomMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) use ( $uses_old_sizing ) {
							return ! ( isset( $attrs['marginTypeMobile'] ) && 'linked' === $attrs['marginTypeMobile'] ) && true === $uses_old_sizing;
						},
					),
					array(
						'property'  => 'min-height',
						'value'     => 'columnsHeightCustomMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['columnsHeight'] ) && 'custom' === $attrs['columnsHeight'];
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'query'      => '@media ( max-width: 600px )',
				'selector'   => ' .wp-block-themeisle-blocks-advanced-columns-separators.top svg',
				'properties' => array(
					array(
						'property' => 'height',
						'value'    => 'dividerTopHeightMobile',
						'unit'     => 'px',
					),
					array(
						'property'       => 'transform',
						'pattern'        => 'scaleX( width )',
						'pattern_values' => array(
							'width' => array(
								'value'  => 'dividerTopWidthMobile',
								'format' => function( $value, $attrs ) {
									return $value / 100;
								},
							),
						),
						'condition'      => function( $attrs ) {
							return isset( $attrs['dividerTopWidthMobile'] );
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'query'      => '@media ( max-width: 600px )',
				'selector'   => ' .wp-block-themeisle-blocks-advanced-columns-separators.bottom svg',
				'properties' => array(
					array(
						'property' => 'height',
						'value'    => 'dividerBottomHeightMobile',
						'unit'     => 'px',
					),
					array(
						'property'       => 'transform',
						'pattern'        => 'scaleX( width )',
						'pattern_values' => array(
							'width' => array(
								'value'  => 'dividerBottomWidthMobile',
								'format' => function( $value, $attrs ) {
									return $value / 100;
								},
							),
						),
						'condition'      => function( $attrs ) {
							return isset( $attrs['dividerBottomWidthMobile'] );
						},
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}

	/**
	 * A port of array.some for PHP.
	 *
	 * @param array    $array Haystack.
	 * @param callback $fn Callback function.
	 * @return boolean
	 * @since   2.0.0
	 * @access  public
	 */
	public function array_any( $array, $fn ) {
		foreach ( $array as $value ) {
			if ( $fn( $value ) ) {
				return true;
			}
		}
		return false;
	}
}
