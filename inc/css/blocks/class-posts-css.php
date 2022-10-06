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
						'property' => '--description-text-size',
						'value'    => 'customDescriptionFontSize',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
					),
					array(
						'property' => '--meta-text-size',
						'value'    => 'customMetaFontSize',
					),
					array(
						'property' => '--img-width',
						'value'    => 'imageWidth',
						'unit'     => 'px',
					),
					array(
						'property' => '--img-border-radius',
						'value'    => 'borderRadius',
						'unit'     => 'px',
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
									return ( strpos( $color, '#' ) !== false && $opacity < 100 ) ? $this->hex2rgba( $color, $opacity / 100 ) : $color;
								},
							),
						),
						'condition'      => function( $attrs ) {
							return isset( $attrs['imageBoxShadow'] ) && true === $attrs['imageBoxShadow']['active'];
						},
					),
					array(
						'property' => '--border-width',
						'value'    => 'borderWidth',
						'unit'     => 'px',
					),
					array(
						'property' => '--border-radius',
						'value'    => 'cardBorderRadius',
						'unit'     => 'px',
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
									return ( strpos( $color, '#' ) !== false && $opacity < 100 ) ? $this->hex2rgba( $color, $opacity / 100 ) : $color;
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
						'unit'     => 'px',
					),
					array(
						'property' => '--row-gap',
						'value'    => 'rowGap',
						'unit'     => 'px',
					),
					array(
						'property' => '--content-padding',
						'value'    => 'padding',
						'unit'     => 'px',
					),
				),
			)
		);

		$css->add_item(
			array(
				'query'      => '@media ( max-width: 960px )',
				'properties' => array(
					array(
						'property' => '--title-text-size',
						'value'    => 'customTitleFontSizeTablet',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
					),
					array(
						'property' => '--description-text-size',
						'value'    => 'customDescriptionFontSizeTablet',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
					),
					array(
						'property' => '--meta-text-size',
						'value'    => 'customMetaFontSizeTablet',
					),
					array(
						'property' => '--column-gap',
						'value'    => 'columnGapTablet',
						'unit'     => 'px',
					),
					array(
						'property' => '--row-gap',
						'value'    => 'rowGapTablet',
						'unit'     => 'px',
					),
					array(
						'property' => '--content-padding',
						'value'    => 'paddingTablet',
						'unit'     => 'px',
					),
				),
			)
		);

		$css->add_item(
			array(
				'query'      => '@media ( max-width: 600px )',
				'properties' => array(
					array(
						'property' => '--title-text-size',
						'value'    => 'customTitleFontSizeMobile',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
					),
					array(
						'property' => '--description-text-size',
						'value'    => 'customDescriptionFontSizeMobile',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
					),
					array(
						'property' => '--meta-text-size',
						'value'    => 'customMetaFontSizeMobile',
					),
					array(
						'property' => '--column-gap',
						'value'    => 'columnGapMobile',
						'unit'     => 'px',
					),
					array(
						'property' => '--row-gap',
						'value'    => 'rowGapMobile',
						'unit'     => 'px',
					),
					array(
						'property' => '--content-padding',
						'value'    => 'paddingMobile',
						'unit'     => 'px',
					),
				),
			)
		);


		$style = $css->generate();

		return $style;
	}
}
