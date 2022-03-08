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
			'marginRight',
			'marginRightTablet',
			'marginRightMobile',
			'marginBottom',
			'marginBottomTablet',
			'marginBottomMobile',
			'marginLeft',
			'marginLeftTablet',
			'marginLeftMobile',
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
			function( $value ) use ( $block ) {
				return isset( $block['attrs'][ $value ] ) && is_numeric( $block['attrs'][ $value ] );
			}
		);

		if ( true === $uses_old_sizing ) {
			$block['attrs'] = $this->merge_old_attributes( $block['attrs'] );
		}

		$css   = new CSS_Utility( $block );
		$attrs = $block['attrs'];

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
						'hasSync'   => 'columnPaddingTop',
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
						'hasSync'   => 'columnPaddingBottom',
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
						'hasSync'   => 'columnPaddingLeft',
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
						'hasSync'   => 'columnPaddingRight',
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
						'hasSync'   => 'columnMarginTop',
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
						'hasSync'   => 'columnMarginBottom',
					),
					array(
						'property'  => 'margin-left',
						'value'     => 'margin',
						'format'    => function( $value, $attrs ) {
							return $value['left'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['margin'] ) && isset( $attrs['margin']['left'] );
						},
						'hasSync'   => 'columnMarginLeft',
					),
					array(
						'property'  => 'margin-right',
						'value'     => 'margin',
						'format'    => function( $value, $attrs ) {
							return $value['right'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['margin'] ) && isset( $attrs['margin']['right'] );
						},
						'hasSync'   => 'columnMarginRight',
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
								'value'   => 'backgroundImage',
								'default' => 'none',
								'format'  => function( $value, $attrs ) {
									if ( isset( $attrs['backgroundImageURL'] ) ) {
										return $attrs['backgroundImageURL'];
									}

									return $attrs['backgroundImage']['url'];
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
							return isset( $attrs['backgroundType'] ) && 'image' === $attrs['backgroundType'] && ( isset( $attrs['backgroundImageURL'] ) && $this->is_image_url( $attrs['backgroundImageURL'] ) || isset( $attrs['backgroundImage'] ) && $this->is_image_url( $attrs['backgroundImage']['url'] ) );
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
						'property'  => 'padding-top',
						'value'     => 'paddingTablet',
						'format'    => function( $value, $attrs ) {
							return $value['top'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingTablet'] ) && isset( $attrs['paddingTablet']['top'] );
						},
						'hasSync'   => 'columnPaddingTopTablet',
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
						'hasSync'   => 'columnPaddingBottomTablet',
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
						'hasSync'   => 'columnPaddingLeftTablet',
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
						'hasSync'   => 'columnPaddingRightTablet',
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
						'hasSync'   => 'columnMarginTopTablet',
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
						'hasSync'   => 'columnMarginBottomTablet',
					),
					array(
						'property'  => 'margin-left',
						'value'     => 'marginTablet',
						'format'    => function( $value, $attrs ) {
							return $value['left'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['marginTablet'] ) && isset( $attrs['marginTablet']['left'] );
						},
						'hasSync'   => 'columnMarginLeftTablet',
					),
					array(
						'property'  => 'margin-right',
						'value'     => 'marginTablet',
						'format'    => function( $value, $attrs ) {
							return $value['right'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['marginTablet'] ) && isset( $attrs['marginTablet']['right'] );
						},
						'hasSync'   => 'columnMarginRightTablet',
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
						'hasSync'   => 'columnPaddingTopMobile',
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
						'hasSync'   => 'columnPaddingBottomMobile',
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
						'hasSync'   => 'columnPaddingLeftMobile',
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
						'hasSync'   => 'columnPaddingRightMobile',
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
						'hasSync'   => 'columnMarginTopMobile',
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
						'hasSync'   => 'columnMarginBottomMobile',
					),
					array(
						'property'  => 'margin-left',
						'value'     => 'marginMobile',
						'format'    => function( $value, $attrs ) {
							return $value['left'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['marginMobile'] ) && isset( $attrs['marginMobile']['left'] );
						},
						'hasSync'   => 'columnMarginLeftMobile',
					),
					array(
						'property'  => 'margin-right',
						'value'     => 'marginMobile',
						'format'    => function( $value, $attrs ) {
							return $value['right'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['marginMobile'] ) && isset( $attrs['marginMobile']['right'] );
						},
						'hasSync'   => 'columnMarginRightMobile',
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}

	/**
	 * Merge old attribibutes that were deprecated in 2.0.
	 *
	 * @param array $attrs Block Attributes.
	 * @return array
	 * @since   2.0.0
	 * @access  public
	 */
	public function merge_old_attributes( $attrs ) {
		$padding        = array();
		$padding_tablet = array();
		$padding_mobile = array();
		$margin         = array();
		$margin_tablet  = array();
		$margin_mobile  = array();
		$border         = array();
		$border_radius  = array();

		if ( isset( $attrs['paddingType'] ) && 'unlinked' === $attrs['paddingType'] ) {
			$padding['top']    = isset( $attrs['paddingTop'] ) ? $attrs['paddingTop'] . 'px' : '20px';
			$padding['bottom'] = isset( $attrs['paddingBottom'] ) ? $attrs['paddingBottom'] . 'px' : '20px';
			$padding['left']   = isset( $attrs['paddingLeft'] ) ? $attrs['paddingLeft'] . 'px' : '20px';
			$padding['right']  = isset( $attrs['paddingRight'] ) ? $attrs['paddingRight'] . 'px' : '20px';
		} elseif ( isset( $attrs['padding'] ) && ! is_array( $attrs['padding'] ) ) {
			$padding['top']    = isset( $attrs['padding'] ) ? $attrs['padding'] . 'px' : '20px';
			$padding['bottom'] = isset( $attrs['padding'] ) ? $attrs['padding'] . 'px' : '20px';
			$padding['left']   = isset( $attrs['padding'] ) ? $attrs['padding'] . 'px' : '20px';
			$padding['right']  = isset( $attrs['padding'] ) ? $attrs['padding'] . 'px' : '20px';
		}

		if ( isset( $attrs['paddingTypeTablet'] ) && 'unlinked' === $attrs['paddingTypeTablet'] ) {
			if ( isset( $attrs['paddingTopTablet'] ) ) {
				$padding_tablet['top'] = $attrs['paddingTopTablet'] . 'px';
			}

			if ( isset( $attrs['paddingBottomTablet'] ) ) {
				$padding_tablet['bottom'] = $attrs['paddingBottomTablet'] . 'px';
			}

			if ( isset( $attrs['paddingLeftTablet'] ) ) {
				$padding_tablet['left'] = $attrs['paddingLeftTablet'] . 'px';
			}

			if ( isset( $attrs['paddingRightTablet'] ) ) {
				$padding_tablet['right'] = $attrs['paddingRightTablet'] . 'px';
			}
		} elseif ( isset( $attrs['paddingTablet'] ) && ! is_array( $attrs['paddingTablet'] ) ) {
			if ( isset( $attrs['paddingTablet'] ) ) {
				$padding_tablet['top'] = $attrs['paddingTablet'] . 'px';
			}

			if ( isset( $attrs['paddingTablet'] ) ) {
				$padding_tablet['bottom'] = $attrs['paddingTablet'] . 'px';
			}

			if ( isset( $attrs['paddingTablet'] ) ) {
				$padding_tablet['left'] = $attrs['paddingTablet'] . 'px';
			}

			if ( isset( $attrs['paddingTablet'] ) ) {
				$padding_tablet['right'] = $attrs['paddingTablet'] . 'px';
			}
		}

		if ( isset( $attrs['paddingTypeMobile'] ) && 'unlinked' === $attrs['paddingTypeMobile'] ) {
			if ( isset( $attrs['paddingTopMobile'] ) ) {
				$padding_mobile['top'] = $attrs['paddingTopMobile'] . 'px';
			}

			if ( isset( $attrs['paddingBottomMobile'] ) ) {
				$padding_mobile['bottom'] = $attrs['paddingBottomMobile'] . 'px';
			}

			if ( isset( $attrs['paddingLeftMobile'] ) ) {
				$padding_mobile['left'] = $attrs['paddingLeftMobile'] . 'px';
			}

			if ( isset( $attrs['paddingRightMobile'] ) ) {
				$padding_mobile['right'] = $attrs['paddingRightMobile'] . 'px';
			}
		} elseif ( isset( $attrs['paddingMobile'] ) && ! is_array( $attrs['paddingMobile'] ) ) {
			if ( isset( $attrs['paddingMobile'] ) ) {
				$padding_mobile['top'] = $attrs['paddingMobile'] . 'px';
			}

			if ( isset( $attrs['paddingMobile'] ) ) {
				$padding_mobile['bottom'] = $attrs['paddingMobile'] . 'px';
			}

			if ( isset( $attrs['paddingMobile'] ) ) {
				$padding_mobile['left'] = $attrs['paddingMobile'] . 'px';
			}

			if ( isset( $attrs['paddingMobile'] ) ) {
				$padding_mobile['right'] = $attrs['paddingMobile'] . 'px';
			}
		}

		if ( isset( $attrs['marginType'] ) && 'linked' === $attrs['marginType'] ) {
			$margin['top']    = isset( $attrs['marginTop'] ) ? $attrs['marginTop'] . 'px' : '20px';
			$margin['bottom'] = isset( $attrs['marginBottom'] ) ? $attrs['marginBottom'] . 'px' : '20px';
			$margin['left']   = isset( $attrs['marginLeft'] ) ? $attrs['marginLeft'] . 'px' : '20px';
			$margin['right']  = isset( $attrs['marginRight'] ) ? $attrs['marginRight'] . 'px' : '20px';
		} elseif ( isset( $attrs['margin'] ) && ! is_array( $attrs['margin'] ) ) {
			$margin['top']    = isset( $attrs['margin'] ) ? $attrs['margin'] . 'px' : '20px';
			$margin['bottom'] = isset( $attrs['margin'] ) ? $attrs['margin'] . 'px' : '20px';
			$margin['left']   = isset( $attrs['margin'] ) ? $attrs['margin'] . 'px' : '20px';
			$margin['right']  = isset( $attrs['margin'] ) ? $attrs['margin'] . 'px' : '20px';
		}

		if ( isset( $attrs['marginTypeTablet'] ) && 'linked' === $attrs['marginTypeTablet'] ) {
			if ( isset( $attrs['marginTopTablet'] ) ) {
				$margin_tablet['top'] = $attrs['marginTopTablet'] . 'px';
			}

			if ( isset( $attrs['marginBottomTablet'] ) ) {
				$margin_tablet['bottom'] = $attrs['marginBottomTablet'] . 'px';
			}

			if ( isset( $attrs['marginLeftTablet'] ) ) {
				$margin_tablet['left'] = $attrs['marginLeftTablet'] . 'px';
			}

			if ( isset( $attrs['marginRightTablet'] ) ) {
				$margin_tablet['right'] = $attrs['marginRightTablet'] . 'px';
			}
		} elseif ( isset( $attrs['marginTablet'] ) && ! is_array( $attrs['marginTablet'] ) ) {
			if ( isset( $attrs['marginTablet'] ) ) {
				$margin_tablet['top'] = $attrs['marginTablet'] . 'px';
			}

			if ( isset( $attrs['marginTablet'] ) ) {
				$margin_tablet['bottom'] = $attrs['marginTablet'] . 'px';
			}

			if ( isset( $attrs['marginTablet'] ) ) {
				$margin_tablet['left'] = $attrs['marginTablet'] . 'px';
			}

			if ( isset( $attrs['marginTablet'] ) ) {
				$margin_tablet['right'] = $attrs['marginTablet'] . 'px';
			}
		}

		if ( isset( $attrs['marginTypeMobile'] ) && 'linked' === $attrs['marginTypeMobile'] ) {
			if ( isset( $attrs['marginTopMobile'] ) ) {
				$margin_mobile['top'] = $attrs['marginTopMobile'] . 'px';
			}

			if ( isset( $attrs['marginBottomMobile'] ) ) {
				$margin_mobile['bottom'] = $attrs['marginBottomMobile'] . 'px';
			}

			if ( isset( $attrs['marginLeftMobile'] ) ) {
				$margin_mobile['left'] = $attrs['marginLeftMobile'] . 'px';
			}

			if ( isset( $attrs['marginRightMobile'] ) ) {
				$margin_mobile['right'] = $attrs['marginRightMobile'] . 'px';
			}
		} elseif ( isset( $attrs['marginMobile'] ) && ! is_array( $attrs['marginMobile'] ) ) {
			if ( isset( $attrs['marginMobile'] ) ) {
				$margin_mobile['top'] = $attrs['marginMobile'] . 'px';
			}

			if ( isset( $attrs['marginMobile'] ) ) {
				$margin_mobile['bottom'] = $attrs['marginMobile'] . 'px';
			}

			if ( isset( $attrs['marginMobile'] ) ) {
				$margin_mobile['left'] = $attrs['marginMobile'] . 'px';
			}

			if ( isset( $attrs['marginMobile'] ) ) {
				$margin_mobile['right'] = $attrs['marginMobile'] . 'px';
			}
		}

		if ( isset( $attrs['borderType'] ) && 'unlinked' === $attrs['borderType'] ) {
			if ( isset( $attrs['borderTop'] ) ) {
				$border['top'] = $attrs['borderTop'] . 'px';
			}

			if ( isset( $attrs['borderBottom'] ) ) {
				$border['bottom'] = $attrs['borderBottom'] . 'px';
			}

			if ( isset( $attrs['borderLeft'] ) ) {
				$border['left'] = $attrs['borderLeft'] . 'px';
			}

			if ( isset( $attrs['borderRight'] ) ) {
				$border['right'] = $attrs['borderRight'] . 'px';
			}
		} elseif ( isset( $attrs['border'] ) && ! is_array( $attrs['border'] ) ) {
			if ( isset( $attrs['border'] ) ) {
				$border['top'] = $attrs['border'] . 'px';
			}

			if ( isset( $attrs['border'] ) ) {
				$border['bottom'] = $attrs['border'] . 'px';
			}

			if ( isset( $attrs['border'] ) ) {
				$border['left'] = $attrs['border'] . 'px';
			}

			if ( isset( $attrs['border'] ) ) {
				$border['right'] = $attrs['border'] . 'px';
			}
		}

		if ( isset( $attrs['borderRadiusType'] ) && 'unlinked' === $attrs['borderRadiusType'] ) {
			if ( isset( $attrs['borderRadiusTop'] ) ) {
				$border_radius['top'] = $attrs['borderRadiusTop'] . 'px';
			}

			if ( isset( $attrs['borderRadiusBottom'] ) ) {
				$border_radius['bottom'] = $attrs['borderRadiusBottom'] . 'px';
			}

			if ( isset( $attrs['borderRadiusLeft'] ) ) {
				$border_radius['left'] = $attrs['borderRadiusLeft'] . 'px';
			}

			if ( isset( $attrs['borderRadiusRight'] ) ) {
				$border_radius['right'] = $attrs['borderRadiusRight'] . 'px';
			}
		} elseif ( isset( $attrs['borderRadius'] ) && ! is_array( $attrs['borderRadius'] ) ) {
			if ( isset( $attrs['borderRadius'] ) ) {
				$border_radius['top'] = $attrs['borderRadius'] . 'px';
			}

			if ( isset( $attrs['borderRadius'] ) ) {
				$border_radius['bottom'] = $attrs['borderRadius'] . 'px';
			}

			if ( isset( $attrs['borderRadius'] ) ) {
				$border_radius['left'] = $attrs['borderRadius'] . 'px';
			}

			if ( isset( $attrs['borderRadius'] ) ) {
				$border_radius['right'] = $attrs['borderRadius'] . 'px';
			}
		}

		$attrs_clone = array(
			'padding'       => $padding,
			'paddingTablet' => $padding_tablet,
			'paddingMobile' => $padding_mobile,
			'margin'        => $margin,
			'marginTablet'  => $margin_tablet,
			'marginMobile'  => $margin_mobile,
			'border'        => $border,
			'borderRadius'  => $border_radius,
		);

		foreach ( $attrs_clone as $key => $value ) {
			if ( count( $value ) ) {
				$attrs[ $key ] = $value;
			}
		}

		return $attrs;
	}

	/**
	 * Generate Advanced Column Global CSS
	 *
	 * @return string
	 * @since   2.0.0
	 * @access  public
	 */
	public function render_global_css() {
		$defaults = get_option( 'themeisle_blocks_settings_global_defaults' );
		$block    = $this->library_prefix . '/' . $this->block_prefix;

		if ( empty( $defaults ) ) {
			return;
		}

		$defaults = json_decode( $defaults, true );

		$block = array(
			'attrs' => $defaults[ $block ],
		);

		$css = new CSS_Utility( $block );

		$css->add_item(
			array(
				'selector'   => '.wp-block-themeisle-blocks-advanced-column',
				'properties' => array(
					array(
						'property'  => '--columnPaddingTop',
						'value'     => 'padding',
						'format'    => function( $value, $attrs ) {
							return $value['top'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['padding'] ) && isset( $attrs['padding']['top'] );
						},
					),
					array(
						'property'  => '--columnPaddingBottom',
						'value'     => 'padding',
						'format'    => function( $value, $attrs ) {
							return $value['bottom'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['padding'] ) && isset( $attrs['padding']['bottom'] );
						},
					),
					array(
						'property'  => '--columnPaddingLeft',
						'value'     => 'padding',
						'format'    => function( $value, $attrs ) {
							return $value['left'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['padding'] ) && isset( $attrs['padding']['left'] );
						},
					),
					array(
						'property'  => '--columnPaddingRight',
						'value'     => 'padding',
						'format'    => function( $value, $attrs ) {
							return $value['right'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['padding'] ) && isset( $attrs['padding']['right'] );
						},
					),
					array(
						'property'  => '--columnMarginTop',
						'value'     => 'margin',
						'format'    => function( $value, $attrs ) {
							return $value['top'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['margin'] ) && isset( $attrs['margin']['top'] );
						},
					),
					array(
						'property'  => '--columnMarginBottom',
						'value'     => 'margin',
						'format'    => function( $value, $attrs ) {
							return $value['bottom'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['margin'] ) && isset( $attrs['margin']['bottom'] );
						},
					),
					array(
						'property'  => '--columnMarginLeft',
						'value'     => 'margin',
						'format'    => function( $value, $attrs ) {
							return $value['left'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['margin'] ) && isset( $attrs['margin']['left'] );
						},
					),
					array(
						'property'  => '--columnMarginRight',
						'value'     => 'margin',
						'format'    => function( $value, $attrs ) {
							return $value['right'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['margin'] ) && isset( $attrs['margin']['right'] );
						},
					),
					array(
						'property'  => '--columnPaddingTopTablet',
						'value'     => 'paddingTablet',
						'format'    => function( $value, $attrs ) {
							return $value['top'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingTablet'] ) && isset( $attrs['paddingTablet']['top'] );
						},
					),
					array(
						'property'  => '--columnPaddingBottomTablet',
						'value'     => 'paddingTablet',
						'format'    => function( $value, $attrs ) {
							return $value['bottom'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingTablet'] ) && isset( $attrs['paddingTablet']['bottom'] );
						},
					),
					array(
						'property'  => '--columnPaddingLeftTablet',
						'value'     => 'paddingTablet',
						'format'    => function( $value, $attrs ) {
							return $value['left'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingTablet'] ) && isset( $attrs['paddingTablet']['left'] );
						},
					),
					array(
						'property'  => '--columnPaddingRightTablet',
						'value'     => 'paddingTablet',
						'format'    => function( $value, $attrs ) {
							return $value['right'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingTablet'] ) && isset( $attrs['paddingTablet']['right'] );
						},
					),
					array(
						'property'  => '--columnMarginTopTablet',
						'value'     => 'marginTablet',
						'format'    => function( $value, $attrs ) {
							return $value['top'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['marginTablet'] ) && isset( $attrs['marginTablet']['top'] );
						},
					),
					array(
						'property'  => '--columnMarginBottomTablet',
						'value'     => 'marginTablet',
						'format'    => function( $value, $attrs ) {
							return $value['bottom'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['marginTablet'] ) && isset( $attrs['marginTablet']['bottom'] );
						},
					),
					array(
						'property'  => '--columnMarginLeftTablet',
						'value'     => 'marginTablet',
						'format'    => function( $value, $attrs ) {
							return $value['left'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['marginTablet'] ) && isset( $attrs['marginTablet']['left'] );
						},
					),
					array(
						'property'  => '--columnMarginRightTablet',
						'value'     => 'marginTablet',
						'format'    => function( $value, $attrs ) {
							return $value['right'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['marginTablet'] ) && isset( $attrs['marginTablet']['right'] );
						},
					),
					array(
						'property'  => '--columnPaddingTopMobile',
						'value'     => 'paddingMobile',
						'format'    => function( $value, $attrs ) {
							return $value['top'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingMobile'] ) && isset( $attrs['paddingMobile']['top'] );
						},
					),
					array(
						'property'  => '--columnPaddingBottomMobile',
						'value'     => 'paddingMobile',
						'format'    => function( $value, $attrs ) {
							return $value['bottom'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingMobile'] ) && isset( $attrs['paddingMobile']['bottom'] );
						},
					),
					array(
						'property'  => '--columnPaddingLeftMobile',
						'value'     => 'paddingMobile',
						'format'    => function( $value, $attrs ) {
							return $value['left'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingMobile'] ) && isset( $attrs['paddingMobile']['left'] );
						},
					),
					array(
						'property'  => '--columnPaddingRightMobile',
						'value'     => 'paddingMobile',
						'format'    => function( $value, $attrs ) {
							return $value['right'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingMobile'] ) && isset( $attrs['paddingMobile']['right'] );
						},
					),
					array(
						'property'  => '--columnMarginTopMobile',
						'value'     => 'marginMobile',
						'format'    => function( $value, $attrs ) {
							return $value['top'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['marMobilegMobilein'] ) && isset( $attrs['marginMobile']['top'] );
						},
					),
					array(
						'property'  => '--columnMarginBottomMobile',
						'value'     => 'marginMobile',
						'format'    => function( $value, $attrs ) {
							return $value['bottom'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['marginMobile'] ) && isset( $attrs['marginMobile']['bottom'] );
						},
					),
					array(
						'property'  => '--columnMarginLeftMobile',
						'value'     => 'marginMobile',
						'format'    => function( $value, $attrs ) {
							return $value['left'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['marginMobile'] ) && isset( $attrs['marginMobile']['left'] );
						},
					),
					array(
						'property'  => '--columnMarginRightMobile',
						'value'     => 'marginMobile',
						'format'    => function( $value, $attrs ) {
							return $value['right'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['marginMobile'] ) && isset( $attrs['marginMobile']['right'] );
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
