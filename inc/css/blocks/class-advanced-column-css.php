<?php
/**
 * Css handling logic for Column.
 *
 * @package ThemeIsle\GutenbergBlocks\CSS\Blocks
 */

namespace ThemeIsle\GutenbergBlocks\CSS\Blocks;

use ThemeIsle\GutenbergBlocks\Base_CSS;

use ThemeIsle\GutenbergBlocks\CSS\CSS_Utility;

use ThemeIsle\GutenbergBlocks\CSS\Blocks\Shared_CSS;

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
				'properties' => array_merge(
					array(
						array(
							'property'  => 'padding-top',
							'value'     => 'padding',
							'format'    => function( $value, $attrs ) {
								return $value['top'];
							},
							'condition' => function( $attrs ) {
								return isset( $attrs['padding'] ) && isset( $attrs['padding']['top'] );
							},
							'hasSync'   => 'column-padding-top',
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
							'hasSync'   => 'column-padding-bottom',
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
							'hasSync'   => 'column-padding-left',
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
							'hasSync'   => 'column-padding-right',
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
							'hasSync'   => 'column-margin-top',
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
							'hasSync'   => 'column-margin-bottom',
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
							'hasSync'   => 'column-margin-left',
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
							'hasSync'   => 'column-margin-right',
						),
						array(
							'property' => '--background-color-hover',
							'value'    => 'backgroundColorHover',
						),
						array(
							'property' => 'align-self',
							'value'    => 'verticalAlign',
							'format'   => function( $value, $attrs ) {
								$values = array(
									'top'    => 'flex-start',
									'center' => 'center',
									'bottom' => 'flex-end',
								);

								return $values[ $value ];
							},
						),
					),
					Shared_CSS::section_shared()
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ':hover',
				'properties' => array(
					array(
						'property'  => 'color',
						'default'   => 'var( --content-color-hover )',
						'condition' => function( $attrs ) {
							return isset( $attrs['colorHover'] );
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' a:not( .wp-block-button__link )',
				'properties' => array(
					array(
						'property'  => 'color',
						'default'   => 'var( --link-color )',
						'condition' => function( $attrs ) {
							return isset( $attrs['linkColor'] );
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' > .wp-block-themeisle-blocks-advanced-column-overlay',
				'properties' => Shared_CSS::section_overlay(),
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
				'query'      => '@media ( max-width: 960px )',
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
						'hasSync'   => 'column-padding-top-tablet',
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
						'hasSync'   => 'column-padding-bottom-tablet',
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
						'hasSync'   => 'column-padding-left-tablet',
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
						'hasSync'   => 'column-padding-right-tablet',
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
						'hasSync'   => 'column-margin-top-tablet',
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
						'hasSync'   => 'column-margin-bottom-tablet',
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
						'hasSync'   => 'column-margin-left-tablet',
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
						'hasSync'   => 'column-margin-right-tablet',
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
						'hasSync'   => 'column-padding-top-mobile',
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
						'hasSync'   => 'column-padding-bottom-mobile',
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
						'hasSync'   => 'column-padding-left-mobile',
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
						'hasSync'   => 'column-padding-right-mobile',
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
						'hasSync'   => 'column-margin-top-mobile',
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
						'hasSync'   => 'column-margin-bottom-mobile',
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
						'hasSync'   => 'column-margin-left-mobile',
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
						'hasSync'   => 'column-margin-right-mobile',
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

		if ( isset( $attrs['paddingType'] ) && 'unlinked' === $attrs['paddingType'] && ! isset( $attrs['padding'] ) ) {
			$padding['top']    = isset( $attrs['paddingTop'] ) ? $attrs['paddingTop'] . 'px' : '20px';
			$padding['bottom'] = isset( $attrs['paddingBottom'] ) ? $attrs['paddingBottom'] . 'px' : '20px';
			$padding['left']   = isset( $attrs['paddingLeft'] ) ? $attrs['paddingLeft'] . 'px' : '20px';
			$padding['right']  = isset( $attrs['paddingRight'] ) ? $attrs['paddingRight'] . 'px' : '20px';
		} elseif ( isset( $attrs['padding'] ) && ! is_array( $attrs['padding'] ) && ! isset( $attrs['paddingType'] ) ) {
			$padding['top']    = isset( $attrs['padding'] ) ? $attrs['padding'] . 'px' : '20px';
			$padding['bottom'] = isset( $attrs['padding'] ) ? $attrs['padding'] . 'px' : '20px';
			$padding['left']   = isset( $attrs['padding'] ) ? $attrs['padding'] . 'px' : '20px';
			$padding['right']  = isset( $attrs['padding'] ) ? $attrs['padding'] . 'px' : '20px';
		} else {
			$padding['top']    = isset( $attrs['paddingTop'] ) ? $attrs['paddingTop'] . 'px' : '20px';
			$padding['bottom'] = isset( $attrs['paddingBottom'] ) ? $attrs['paddingBottom'] . 'px' : '20px';
			$padding['left']   = isset( $attrs['paddingLeft'] ) ? $attrs['paddingLeft'] . 'px' : '20px';
			$padding['right']  = isset( $attrs['paddingRight'] ) ? $attrs['paddingRight'] . 'px' : '20px';
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

		if ( isset( $attrs['marginType'] ) && 'linked' === $attrs['marginType'] && ! isset( $attrs['margin'] ) ) {
			$margin['top']    = isset( $attrs['marginTop'] ) ? $attrs['marginTop'] . 'px' : '20px';
			$margin['bottom'] = isset( $attrs['marginBottom'] ) ? $attrs['marginBottom'] . 'px' : '20px';
			$margin['left']   = isset( $attrs['marginLeft'] ) ? $attrs['marginLeft'] . 'px' : '20px';
			$margin['right']  = isset( $attrs['marginRight'] ) ? $attrs['marginRight'] . 'px' : '20px';
		} elseif ( isset( $attrs['margin'] ) && ! is_array( $attrs['margin'] ) && ( ! isset( $attrs['marginType'] ) ) ) {
			$margin['top']    = isset( $attrs['marginTop'] ) ? $attrs['marginTop'] . 'px' : ( ( isset( $attrs['margin'] ) && is_numeric( $attrs['margin'] ) ) ? $attrs['margin'] . 'px' : '20px' );
			$margin['bottom'] = isset( $attrs['marginBottom'] ) ? $attrs['marginBottom'] . 'px' : ( ( isset( $attrs['margin'] ) && is_numeric( $attrs['margin'] ) ) ? $attrs['margin'] . 'px' : '20px' );
			$margin['left']   = isset( $attrs['marginLeft'] ) ? $attrs['marginLeft'] . 'px' : ( ( isset( $attrs['margin'] ) && is_numeric( $attrs['margin'] ) ) ? $attrs['margin'] . 'px' : '20px' );
			$margin['right']  = isset( $attrs['marginRight'] ) ? $attrs['marginRight'] . 'px' : ( ( isset( $attrs['margin'] ) && is_numeric( $attrs['margin'] ) ) ? $attrs['margin'] . 'px' : '20px' );
		} else {
			if ( isset( $attrs['marginType'] ) && 'linked' === $attrs['marginType'] ) {
				$margin['top']    = isset( $attrs['margin'] ) ? $attrs['margin'] . 'px' : ( isset( $attrs['marginTop'] ) ? $attrs['marginTop'] . 'px' : '0px' );
				$margin['bottom'] = isset( $attrs['margin'] ) ? $attrs['margin'] . 'px' : ( isset( $attrs['marginBottom'] ) ? $attrs['marginBottom'] . 'px' : '0px' );
				$margin['left']   = isset( $attrs['margin'] ) ? $attrs['margin'] . 'px' : ( isset( $attrs['marginLeft'] ) ? $attrs['marginLeft'] . 'px' : '0px' );
				$margin['right']  = isset( $attrs['margin'] ) ? $attrs['margin'] . 'px' : ( isset( $attrs['marginRight'] ) ? $attrs['marginRight'] . 'px' : '0px' );
			} else {
				if ( ! isset( $attrs['marginType'] ) && ! isset( $attrs['margin'] ) ) {
					$margin['top']    = isset( $attrs['marginTop'] ) ? $attrs['marginTop'] . 'px' : ( ( isset( $attrs['margin'] ) && is_numeric( $attrs['margin'] ) ) ? $attrs['margin'] . 'px' : '20px' );
					$margin['bottom'] = isset( $attrs['marginBottom'] ) ? $attrs['marginBottom'] . 'px' : ( ( isset( $attrs['margin'] ) && is_numeric( $attrs['margin'] ) ) ? $attrs['margin'] . 'px' : '20px' );
					$margin['left']   = isset( $attrs['marginLeft'] ) ? $attrs['marginLeft'] . 'px' : ( ( isset( $attrs['margin'] ) && is_numeric( $attrs['margin'] ) ) ? $attrs['margin'] . 'px' : '0px' );
					$margin['right']  = isset( $attrs['marginRight'] ) ? $attrs['marginRight'] . 'px' : ( ( isset( $attrs['margin'] ) && is_numeric( $attrs['margin'] ) ) ? $attrs['margin'] . 'px' : '0px' );
				}
			}
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

		if ( ! isset( $defaults[ $block ] ) ) {
			return;
		}

		$block = array(
			'attrs' => $defaults[ $block ],
		);

		$css = new CSS_Utility( $block );

		$css->add_item(
			array(
				'selector'   => '.wp-block-themeisle-blocks-advanced-column',
				'properties' => array(
					array(
						'property'  => '--column-padding-top',
						'value'     => 'padding',
						'format'    => function( $value, $attrs ) {
							return $value['top'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['padding'] ) && isset( $attrs['padding']['top'] );
						},
					),
					array(
						'property'  => '--column-padding-bottom',
						'value'     => 'padding',
						'format'    => function( $value, $attrs ) {
							return $value['bottom'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['padding'] ) && isset( $attrs['padding']['bottom'] );
						},
					),
					array(
						'property'  => '--column-padding-left',
						'value'     => 'padding',
						'format'    => function( $value, $attrs ) {
							return $value['left'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['padding'] ) && isset( $attrs['padding']['left'] );
						},
					),
					array(
						'property'  => '--column-padding-right',
						'value'     => 'padding',
						'format'    => function( $value, $attrs ) {
							return $value['right'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['padding'] ) && isset( $attrs['padding']['right'] );
						},
					),
					array(
						'property'  => '--column-margin-top',
						'value'     => 'margin',
						'format'    => function( $value, $attrs ) {
							return $value['top'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['margin'] ) && isset( $attrs['margin']['top'] );
						},
					),
					array(
						'property'  => '--column-margin-bottom',
						'value'     => 'margin',
						'format'    => function( $value, $attrs ) {
							return $value['bottom'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['margin'] ) && isset( $attrs['margin']['bottom'] );
						},
					),
					array(
						'property'  => '--column-margin-left',
						'value'     => 'margin',
						'format'    => function( $value, $attrs ) {
							return $value['left'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['margin'] ) && isset( $attrs['margin']['left'] );
						},
					),
					array(
						'property'  => '--column-margin-right',
						'value'     => 'margin',
						'format'    => function( $value, $attrs ) {
							return $value['right'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['margin'] ) && isset( $attrs['margin']['right'] );
						},
					),
					array(
						'property'  => '--column-padding-top-tablet',
						'value'     => 'paddingTablet',
						'format'    => function( $value, $attrs ) {
							return $value['top'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingTablet'] ) && isset( $attrs['paddingTablet']['top'] );
						},
					),
					array(
						'property'  => '--column-padding-bottom-tablet',
						'value'     => 'paddingTablet',
						'format'    => function( $value, $attrs ) {
							return $value['bottom'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingTablet'] ) && isset( $attrs['paddingTablet']['bottom'] );
						},
					),
					array(
						'property'  => '--column-padding-left-tablet',
						'value'     => 'paddingTablet',
						'format'    => function( $value, $attrs ) {
							return $value['left'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingTablet'] ) && isset( $attrs['paddingTablet']['left'] );
						},
					),
					array(
						'property'  => '--column-padding-right-tablet',
						'value'     => 'paddingTablet',
						'format'    => function( $value, $attrs ) {
							return $value['right'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingTablet'] ) && isset( $attrs['paddingTablet']['right'] );
						},
					),
					array(
						'property'  => '--column-margin-top-tablet',
						'value'     => 'marginTablet',
						'format'    => function( $value, $attrs ) {
							return $value['top'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['marginTablet'] ) && isset( $attrs['marginTablet']['top'] );
						},
					),
					array(
						'property'  => '--column-margin-bottom-tablet',
						'value'     => 'marginTablet',
						'format'    => function( $value, $attrs ) {
							return $value['bottom'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['marginTablet'] ) && isset( $attrs['marginTablet']['bottom'] );
						},
					),
					array(
						'property'  => '--column-margin-left-tablet',
						'value'     => 'marginTablet',
						'format'    => function( $value, $attrs ) {
							return $value['left'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['marginTablet'] ) && isset( $attrs['marginTablet']['left'] );
						},
					),
					array(
						'property'  => '--column-margin-right-tablet',
						'value'     => 'marginTablet',
						'format'    => function( $value, $attrs ) {
							return $value['right'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['marginTablet'] ) && isset( $attrs['marginTablet']['right'] );
						},
					),
					array(
						'property'  => '--column-padding-top-mobile',
						'value'     => 'paddingMobile',
						'format'    => function( $value, $attrs ) {
							return $value['top'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingMobile'] ) && isset( $attrs['paddingMobile']['top'] );
						},
					),
					array(
						'property'  => '--column-padding-bottom-mobile',
						'value'     => 'paddingMobile',
						'format'    => function( $value, $attrs ) {
							return $value['bottom'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingMobile'] ) && isset( $attrs['paddingMobile']['bottom'] );
						},
					),
					array(
						'property'  => '--column-padding-left-mobile',
						'value'     => 'paddingMobile',
						'format'    => function( $value, $attrs ) {
							return $value['left'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingMobile'] ) && isset( $attrs['paddingMobile']['left'] );
						},
					),
					array(
						'property'  => '--column-padding-right-mobile',
						'value'     => 'paddingMobile',
						'format'    => function( $value, $attrs ) {
							return $value['right'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingMobile'] ) && isset( $attrs['paddingMobile']['right'] );
						},
					),
					array(
						'property'  => '--column-margin-top-mobile',
						'value'     => 'marginMobile',
						'format'    => function( $value, $attrs ) {
							return $value['top'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['marMobilegMobilein'] ) && isset( $attrs['marginMobile']['top'] );
						},
					),
					array(
						'property'  => '--column-margin-bottom-mobile',
						'value'     => 'marginMobile',
						'format'    => function( $value, $attrs ) {
							return $value['bottom'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['marginMobile'] ) && isset( $attrs['marginMobile']['bottom'] );
						},
					),
					array(
						'property'  => '--column-margin-left-mobile',
						'value'     => 'marginMobile',
						'format'    => function( $value, $attrs ) {
							return $value['left'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['marginMobile'] ) && isset( $attrs['marginMobile']['left'] );
						},
					),
					array(
						'property'  => '--column-margin-right-mobile',
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
