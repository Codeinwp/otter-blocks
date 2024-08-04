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
 * Class Button_CSS
 */
class Posts_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'posts-grid';

	/**
	 * Generate Button CSS
	 *
	 * @param mixed $block Block data.
	 * @return string
	 * @since   1.3.0
	 * @access  public
	 */
	public function render_css( $block ) {
		$css = new CSS_Utility( $block );

		$vertical_value_mapping = array(
			'top'    => 'flex-start',
			'center' => 'center',
			'bottom' => 'flex-end',
		);

		$css->add_item(
			array(
				'properties' => array(
					array(
						'property' => '--text-align',
						'value'    => 'textAlign',
					),
					array(
						'property' => '--vert-align',
						'value'    => 'verticalAlign',
						'format'   => function( $value, $attrs ) use ( $vertical_value_mapping ) {
							return $vertical_value_mapping[ $value ];
						},
					),
					array(
						'property' => '--text-color',
						'value'    => 'textColor',
					),
					array(
						'property' => '--background-color',
						'value'    => 'backgroundColor',
					),
					array(
						'property' => '--background-overlay',
						'value'    => 'backgroundOverlay',
					),
					array(
						'property' => '--border-color',
						'value'    => 'borderColor',
					),
					array(
						'property' => '--title-text-size',
						'value'    => 'customTitleFontSize',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
					),
					array(
						'property' => '--title-text-size-tablet',
						'value'    => 'customTitleFontSizeTablet',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
					),
					array(
						'property' => '--title-text-size-mobile',
						'value'    => 'customTitleFontSizeMobile',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
					),
					array(
						'property' => '--description-text-size',
						'value'    => 'customDescriptionFontSize',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
					),
					array(
						'property' => '--description-text-size-tablet',
						'value'    => 'customDescriptionFontSizeTablet',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
					),
					array(
						'property' => '--description-text-size-mobile',
						'value'    => 'customDescriptionFontSizeMobile',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
					),
					array(
						'property' => '--meta-text-size',
						'value'    => 'customMetaFontSize',
					),
					array(
						'property' => '--meta-text-size-tablet',
						'value'    => 'customMetaFontSizeTablet',
					),
					array(
						'property' => '--meta-text-size-mobile',
						'value'    => 'customMetaFontSizeMobile',
					),
					array(
						'property' => '--img-width',
						'value'    => 'imageWidth',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
					),
					array(
						'property' => '--img-width-tablet',
						'value'    => 'imageWidthTablet',
					),
					array(
						'property' => '--img-width-mobile',
						'value'    => 'imageWidthMobile',
					),
					array(
						'property' => '--img-border-radius',
						'value'    => 'borderRadius',
						'format'   => function( $value, $attrs ) {
							if ( is_numeric( $value ) ) {
								return $value . 'px';
							}

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
						'property'       => '--img-box-shadow',
						'pattern'        => 'horizontal vertical blur spread color',
						'pattern_values' => array(
							'horizontal' => array(
								'value'   => 'imageBoxShadow',
								'unit'    => 'px',
								'default' => 0,
								'format'  => function( $value ) {
									return $value['horizontal'];
								},
							),
							'vertical'   => array(
								'value'   => 'imageBoxShadow',
								'unit'    => 'px',
								'default' => 0,
								'format'  => function( $value ) {
									return $value['vertical'];
								},
							),
							'blur'       => array(
								'value'   => 'imageBoxShadow',
								'unit'    => 'px',
								'default' => 5,
								'format'  => function( $value ) {
									return $value['blur'];
								},
							),
							'spread'     => array(
								'value'   => 'imageBoxShadow',
								'unit'    => 'px',
								'default' => 1,
								'format'  => function( $value ) {
									return $value['spread'];
								},
							),
							'color'      => array(
								'value'   => 'imageBoxShadow',
								'default' => '#000',
								'format'  => function( $value ) {
									$opacity = $value['colorOpacity'];
									$color   = isset( $value['color'] ) ? $value['color'] : '#000000';
									return ( strpos( $color, '#' ) !== false && $opacity < 100 ) ? Base_CSS::hex2rgba( $color, $opacity / 100 ) : $color;
								},
							),
						),
						'condition'      => function( $attrs ) {
							return isset( $attrs['imageBoxShadow'] ) && true === $attrs['imageBoxShadow']['active'];
						},
					),
					array(
						'property' => '--image-ratio',
						'value'    => 'imageRatio',
					),
					array(
						'property' => '--border-width',
						'value'    => 'borderWidth',
					),
					array(
						'property' => '--border-radius',
						'value'    => 'cardBorderRadius',
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
						'property'       => '--box-shadow',
						'pattern'        => 'horizontal vertical blur spread color',
						'pattern_values' => array(
							'horizontal' => array(
								'value'   => 'boxShadow',
								'unit'    => 'px',
								'default' => 0,
								'format'  => function( $value ) {
									return $value['horizontal'];
								},
							),
							'vertical'   => array(
								'value'   => 'boxShadow',
								'unit'    => 'px',
								'default' => 0,
								'format'  => function( $value ) {
									return $value['vertical'];
								},
							),
							'blur'       => array(
								'value'   => 'boxShadow',
								'unit'    => 'px',
								'default' => 5,
								'format'  => function( $value ) {
									return $value['blur'];
								},
							),
							'spread'     => array(
								'value'   => 'boxShadow',
								'unit'    => 'px',
								'default' => 1,
								'format'  => function( $value ) {
									return $value['spread'];
								},
							),
							'color'      => array(
								'value'   => 'boxShadow',
								'default' => '#000',
								'format'  => function( $value ) {
									$opacity = $value['colorOpacity'];
									$color   = isset( $value['color'] ) ? $value['color'] : '#000000';
									return ( strpos( $color, '#' ) !== false && $opacity < 100 ) ? Base_CSS::hex2rgba( $color, $opacity / 100 ) : $color;
								},
							),
						),
						'condition'      => function( $attrs ) {
							return isset( $attrs['boxShadow'] ) && true === $attrs['boxShadow']['active'];
						},
					),
					array(
						'property' => '--column-gap',
						'value'    => 'columnGap',
					),
					array(
						'property' => '--column-gap-tablet',
						'value'    => 'columnGapTablet',
					),
					array(
						'property' => '--column-gap-mobile',
						'value'    => 'columnGapMobile',
					),
					array(
						'property' => '--row-gap',
						'value'    => 'rowGap',
					),
					array(
						'property' => '--row-gap-tablet',
						'value'    => 'rowGapTablet',
					),
					array(
						'property' => '--row-gap-mobile',
						'value'    => 'rowGapMobile',
					),
					array(
						'property' => '--content-padding',
						'value'    => 'padding',
					),
					array(
						'property' => '--content-padding-tablet',
						'value'    => 'paddingTablet',
					),
					array(
						'property' => '--content-padding-mobile',
						'value'    => 'paddingMobile',
					),
					array(
						'property' => '--content-gap',
						'value'    => 'contentGap',
					),
					array(
						'property' => '--pag-gap',
						'value'    => 'pagGap',
					),
					array(
						'property' => '--pag-color',
						'value'    => 'pagColor',
					),
					array(
						'property' => '--pag-bg-color',
						'value'    => 'pagBgColor',
					),
					array(
						'property' => '--pag-color-hover',
						'value'    => 'pagColorHover',
					),
					array(
						'property' => '--pag-bg-color-hover',
						'value'    => 'pagBgColorHover',
					),
					array(
						'property' => '--pag-color-active',
						'value'    => 'pagColorActive',
					),
					array(
						'property' => '--pag-bg-color-active',
						'value'    => 'pagBgColorActive',
					),
					array(
						'property' => '--pag-border-color',
						'value'    => 'pagBorderColor',
					),
					array(
						'property' => '--pag-border-color-hover',
						'value'    => 'pagBorderColorHover',
					),
					array(
						'property' => '--pag-border-color-active',
						'value'    => 'pagBorderColorActive',
					),
					array(
						'property' => '--pag-size',
						'value'    => 'pagSize',
					),
					array(
						'property' => '--pag-border-radius',
						'value'    => 'pagBorderRadius',
						'format'   => function( $value, $attrs ) {
							return CSS_Utility::box_values( $value );
						},
					),
					array(
						'property' => '--pag-border-width',
						'value'    => 'pagBorderWidth',
						'format'   => function( $value, $attrs ) {
							return CSS_Utility::box_values( $value );
						},
					),
					array(
						'property' => '--pag-padding',
						'value'    => 'pagPadding',
						'format'   => function( $value, $attrs ) {
							return CSS_Utility::box_values( $value );
						},
					),
					array(
						'property' => '--pag-cont-margin',
						'value'    => 'pagContMargin',
						'format'   => function( $value, $attrs ) {
							return CSS_Utility::box_values(
								$value,
								array(
									'top'    => '10px',
									'bottom' => '30px',
								)
							);
						},
					),
				),
			)
		);

		if ( isset( $block['attrs']['cardBorderRadius'] ) && is_array( $block['attrs']['cardBorderRadius'] ) ) {
			$border_radius_properties = array(
				'top'    => '--border-radius-start-start',
				'right'  => '--border-radius-start-end',
				'bottom' => '--border-radius-end-start',
				'left'   => '--border-radius-end-end',
			);
		
			$properties = array_map(
				function( $position, $css_variable ) {
					return array(
						'property'  => $css_variable,
						'value'     => 'cardBorderRadius',
						'format'    => function( $value, $attrs ) use ( $position ) {
							return $value[ $position ];
						},
						'condition' => function( $attrs ) {
							// @phpstan-ignore-next-line
							return isset( $attrs['className'] ) && strpos( $attrs['className'], 'is-style-tiled' ) !== false;
						},
					);
				},
				array_keys( $border_radius_properties ),
				$border_radius_properties
			);
		
			$css->add_item(
				array(
					'properties' => $properties,
				)
			);
		}

		$style = $css->generate();

		return $style;
	}
}
