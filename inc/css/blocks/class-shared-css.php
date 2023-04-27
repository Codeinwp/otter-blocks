<?php
/**
 * Shared CSS.
 *
 * @package ThemeIsle\GutenbergBlocks\CSS\Blocks
 */

namespace ThemeIsle\GutenbergBlocks\CSS\Blocks;

use ThemeIsle\GutenbergBlocks\Base_CSS;

/**
 * Class Shared_CSS
 */
class Shared_CSS {

	/**
	 * Section Shared CSS
	 */
	public static function section_shared() {
		$css = array(
			array(
				'property' => '--text-color',
				'value'    => 'color',
			),
			array(
				'property' => '--link-color',
				'value'    => 'linkColor',
			),
			array(
				'property' => '--content-color-hover',
				'value'    => 'colorHover',
			),
			array(
				'property'  => '--background',
				'value'     => 'backgroundColor',
				'condition' => function( $attrs ) {
					return ! ( isset( $attrs['backgroundType'] ) && 'color' !== $attrs['backgroundType'] );
				},
			),
			array(
				'property'       => '--background',
				'pattern'        => 'url( imageURL ) repeat attachment position/size',
				'pattern_values' => array(
					'imageURL'   => array(
						'value'   => 'backgroundImage',
						'default' => 'none',
						'format'  => function( $value, $attrs ) {
							if ( isset( $attrs['backgroundImageURL'] ) ) {
								return apply_filters( 'otter_apply_dynamic_image', $attrs['backgroundImageURL'] );
							}

							return apply_filters( 'otter_apply_dynamic_image', $attrs['backgroundImage']['url'] );
						},
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
						'default' => '50% 50%',
						'format'  => function( $value, $attrs ) {
							if ( is_array( $value ) && isset( $value['x'] ) ) {
								return ( $value['x'] * 100 ) . '% ' . ( $value['y'] * 100 ) . '%';
							}

							return $value;
						},
					),
					'size'       => array(
						'value'   => 'backgroundSize',
						'default' => 'auto',
					),
				),
				'condition'      => function( $attrs ) {
					return isset( $attrs['backgroundType'] ) && 'image' === $attrs['backgroundType'] && ( isset( $attrs['backgroundImageURL'] ) && Base_CSS::is_image_url( $attrs['backgroundImageURL'] ) || isset( $attrs['backgroundImage'] ) && Base_CSS::is_image_url( $attrs['backgroundImage']['url'] ) );
				},
			),
			array(
				'property'  => '--background',
				'value'     => 'backgroundGradient',
				'default'   => 'linear-gradient(90deg,rgba(54,209,220,1) 0%,rgba(91,134,229,1) 100%)',
				'condition' => function( $attrs ) {
					return isset( $attrs['backgroundType'] ) && 'gradient' === $attrs['backgroundType'] && isset( $attrs['backgroundGradient'] );
				},
			),
			array(
				'property'       => '--background',
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
				'property'       => '--background',
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
				'property'  => 'color',
				'default'   => 'var( --text-color )',
				'condition' => function( $attrs ) {
					return isset( $attrs['color'] );
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
							return isset( $value['top'] ) ? $value['top'] : 0;
						},
					),
					'right'  => array(
						'value'   => 'border',
						'default' => 0,
						'format'  => function( $value, $attrs ) {
							return isset( $value['right'] ) ? $value['right'] : 0;
						},
					),
					'bottom' => array(
						'value'   => 'border',
						'default' => 0,
						'format'  => function( $value, $attrs ) {
							return isset( $value['bottom'] ) ? $value['bottom'] : 0;
						},
					),
					'left'   => array(
						'value'   => 'border',
						'default' => 0,
						'format'  => function( $value, $attrs ) {
							return isset( $value['left'] ) ? $value['left'] : 0;
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
							return isset( $value['top'] ) ? $value['top'] : 0;
						},
					),
					'top-right'    => array(
						'value'   => 'borderRadius',
						'default' => 0,
						'format'  => function( $value, $attrs ) {
							return isset( $value['right'] ) ? $value['right'] : 0;
						},
					),
					'bottom-right' => array(
						'value'   => 'borderRadius',
						'default' => 0,
						'format'  => function( $value, $attrs ) {
							return isset( $value['bottom'] ) ? $value['bottom'] : 0;
						},
					),
					'bottom-left'  => array(
						'value'   => 'borderRadius',
						'default' => 0,
						'format'  => function( $value, $attrs ) {
							return isset( $value['left'] ) ? $value['left'] : 0;
						},
					),
				),
				'condition'      => function( $attrs ) {
					return isset( $attrs['borderRadius'] ) && is_array( $attrs['borderRadius'] );
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
							return Base_CSS::hex2rgba( $value, $opacity );
						},
					),
				),
				'condition'      => function( $attrs ) {
					return isset( $attrs['boxShadow'] ) && true === $attrs['boxShadow'];
				},
			),
		);

		return $css;
	}

	/**
	 * Section Overlay CSS
	 */
	public static function section_overlay() {
		$css = array(
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
						'value'   => 'backgroundOverlayImage',
						'default' => 'none',
						'format'  => function( $value, $attrs ) {
							if ( isset( $attrs['backgroundOverlayImageURL'] ) ) {
								return apply_filters( 'otter_apply_dynamic_image', $attrs['backgroundOverlayImageURL'] );
							}

							return apply_filters( 'otter_apply_dynamic_image', $attrs['backgroundOverlayImage']['url'] );
						},
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
						'default' => '50% 50%',
						'format'  => function( $value, $attrs ) {
							if ( is_array( $value ) && isset( $value['x'] ) ) {
								return ( $value['x'] * 100 ) . '% ' . ( $value['y'] * 100 ) . '%';
							}

							return $value;
						},
					),
					'size'       => array(
						'value'   => 'backgroundOverlaySize',
						'default' => 'auto',
					),
				),
				'condition'      => function( $attrs ) {
					return isset( $attrs['backgroundOverlayType'] ) && 'image' === $attrs['backgroundOverlayType'] && ( isset( $attrs['backgroundOverlayImageURL'] ) && Base_CSS::is_image_url( $attrs['backgroundOverlayImageURL'] ) || isset( $attrs['backgroundOverlayImage'] ) && Base_CSS::is_image_url( $attrs['backgroundOverlayImage']['url'] ) );
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
							return isset( $value['top'] ) ? $value['top'] : 0;
						},
					),
					'top-right'    => array(
						'value'   => 'borderRadius',
						'default' => 0,
						'format'  => function( $value, $attrs ) {
							return isset( $value['right'] ) ? $value['right'] : 0;
						},
					),
					'bottom-right' => array(
						'value'   => 'borderRadius',
						'default' => 0,
						'format'  => function( $value, $attrs ) {
							return isset( $value['bottom'] ) ? $value['bottom'] : 0;
						},
					),
					'bottom-left'  => array(
						'value'   => 'borderRadius',
						'default' => 0,
						'format'  => function( $value, $attrs ) {
							return isset( $value['left'] ) ? $value['left'] : 0;
						},
					),
				),
				'condition'      => function( $attrs ) {
					return isset( $attrs['borderRadius'] ) && is_array( $attrs['borderRadius'] );
				},
			),
		);

		return $css;
	}
}
