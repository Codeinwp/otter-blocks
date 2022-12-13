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
 * Class Flip_CSS
 */
class Flip_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'flip';

	/**
	 * Generate Button CSS
	 *
	 * @param mixed $block Block data.
	 * @return string
	 * @since   1.3.0
	 * @access  public
	 */
	public function render_css( $block ) {
		$css = new CSS_Utility(
			$block,
			array(
				'tablet' => '@media ( max-width: 960px )',
				'mobile' => '@media ( max-width: 600px )',
			)
		);

		$css->add_item(
			array(
				'properties' => array(
					array(
						'property'  => '--width',
						'value'     => 'width',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['width'] ) && is_numeric( $attrs['width'] );
						},
					),
					array(
						'property'  => '--width',
						'value'     => 'width',
						'condition' => function( $attrs ) {
							return isset( $attrs['width'] ) && is_string( $attrs['width'] );
						},
					),
					array(
						'property' => '--width',
						'value'    => 'widthTablet',
						'media'    => 'tablet',
					),
					array(
						'property' => '--width',
						'value'    => 'widthMobile',
						'media'    => 'mobile',
					),
					array(
						'property'  => '--height',
						'value'     => 'height',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['height'] ) && is_numeric( $attrs['height'] );
						},
					),
					array(
						'property'  => '--height',
						'value'     => 'height',
						'condition' => function( $attrs ) {
							return isset( $attrs['height'] ) && is_string( $attrs['height'] );
						},
					),
					array(
						'property' => '--height',
						'value'    => 'heightTablet',
						'media'    => 'tablet',
					),
					array(
						'property' => '--height',
						'value'    => 'heightMobile',
						'media'    => 'mobile',
					),
					array(
						'property' => '--border-color',
						'value'    => 'borderColor',
					),
					array(
						'property'  => '--border-width',
						'value'     => 'borderWidth',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['borderWidth'] ) && is_numeric( $attrs['borderWidth'] );
						},
					),
					array(
						'property'  => '--border-width',
						'value'     => 'borderWidth',
						'condition' => function( $attrs ) {
							return isset( $attrs['borderWidth'] ) && is_array( $attrs['borderWidth'] );
						},
						'format'    => function( $value, $attrs ) {
							return CSS_Utility::box_values( $value, CSS_Utility::make_box( '3px' ) );
						},
					),
					array(
						'property'  => '--border-radius',
						'value'     => 'borderRadius',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['borderRadius'] ) && is_numeric( $attrs['borderRadius'] );
						},
					),
					array(
						'property'  => '--border-radius',
						'value'     => 'borderRadius',
						'condition' => function( $attrs ) {
							return isset( $attrs['borderRadius'] ) && is_array( $attrs['borderRadius'] );
						},
						'format'    => function( $value, $attrs ) {
							return CSS_Utility::box_values( $value, CSS_Utility::make_box( '10px' ) );
						},
					),
					array(
						'property'  => '--front-background',
						'value'     => 'frontBackgroundColor',
						'condition' => function( $attrs ) {
							return ! isset( $attrs['frontBackgroundType'] );
						},
					),
					array(
						'property'  => '--front-background',
						'value'     => 'frontBackgroundGradient',
						'condition' => function( $attrs ) {
							return isset( $attrs['frontBackgroundType'] ) && 'gradient' === $attrs['frontBackgroundType'];
						},
					),
					array(
						'property'       => '--front-background',
						'pattern'        => 'url( imageURL ) repeat attachment position/size',
						'pattern_values' => array(
							'imageURL'   => array(
								'value'  => 'frontBackgroundImage',
								'format' => function( $value, $attrs ) {
									return apply_filters( 'otter_apply_dynamic_image', $value['url'] );
								},
							),
							'repeat'     => array(
								'value'   => 'frontBackgroundRepeat',
								'default' => 'repeat',
							),
							'attachment' => array(
								'value'   => 'frontBackgroundAttachment',
								'default' => 'scroll',
							),
							'position'   => array(
								'value'   => 'frontBackgroundPosition',
								'default' => array(
									'x' => 0.5,
									'y' => 0.5,
								),
								'format'  => function( $value, $attrs ) {
									if ( isset( $value['x'] ) && isset( $value['y'] ) ) {
										return ( $value['x'] * 100 ) . '% ' . ( $value['y'] * 100 ) . '%';
									}
									return '50% 50%';
								},
							),
							'size'       => array(
								'value'   => 'backgroundSize',
								'default' => 'auto',
							),
						),
						'condition'      => function( $attrs ) {
							return isset( $attrs['frontBackgroundType'] ) && 'image' === $attrs['frontBackgroundType'] && isset( $attrs['frontBackgroundImage'] ) && isset( $attrs['frontBackgroundImage']['url'] );
						},
					),
					array(
						'property' => '--front-vertical-align',
						'value'    => 'frontVerticalAlign',
					),
					array(
						'property' => '--front-horizontal-align',
						'value'    => 'frontHorizontalAlign',
					),
					array(
						'property'  => '--back-background',
						'value'     => 'backBackgroundColor',
						'condition' => function( $attrs ) {
							return ! isset( $attrs['backBackgroundType'] );
						},
					),
					array(
						'property'  => '--back-background',
						'value'     => 'backBackgroundGradient',
						'condition' => function( $attrs ) {
							return isset( $attrs['backBackgroundType'] ) && 'gradient' === $attrs['backBackgroundType'];
						},
					),
					array(
						'property'       => '--back-background',
						'pattern'        => 'url( imageURL ) repeat attachment position/size',
						'pattern_values' => array(
							'imageURL'   => array(
								'value'  => 'backBackgroundImage',
								'format' => function( $value, $attrs ) {
									return apply_filters( 'otter_apply_dynamic_image', $value['url'] );
								},
							),
							'repeat'     => array(
								'value'   => 'backBackgroundRepeat',
								'default' => 'repeat',
							),
							'attachment' => array(
								'value'   => 'backBackgroundAttachment',
								'default' => 'scroll',
							),
							'position'   => array(
								'value'   => 'backBackgroundPosition',
								'default' => array(
									'x' => 0.5,
									'y' => 0.5,
								),
								'format'  => function( $value, $attrs ) {
									if ( isset( $value['x'] ) && isset( $value['y'] ) ) {
										return ( $value['x'] * 100 ) . '% ' . ( $value['y'] * 100 ) . '%';
									}
									return '50% 50%';
								},
							),
							'size'       => array(
								'value'   => 'backgroundSize',
								'default' => 'auto',
							),
						),
						'condition'      => function( $attrs ) {
							return isset( $attrs['backBackgroundType'] ) && 'image' === $attrs['backBackgroundType'] && isset( $attrs['backBackgroundImage'] ) && isset( $attrs['backBackgroundImage']['url'] );
						},
					),
					array(
						'property' => '--back-vertical-align',
						'value'    => 'backVerticalAlign',
					),
					array(
						'property'  => '--padding',
						'value'     => 'padding',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['padding'] ) && is_numeric( $attrs['padding'] );
						},
					),
					array(
						'property'  => '--padding',
						'value'     => 'padding',
						'condition' => function( $attrs ) {
							return isset( $attrs['padding'] ) && is_array( $attrs['padding'] );
						},
						'format'    => function( $value, $attrs ) {
							return CSS_Utility::box_values( $value, CSS_Utility::make_box( '20px' ) );
						},
					),
					array(
						'property' => '--padding',
						'value'    => 'paddingTablet',
						'format'   => function( $value, $attrs ) {
							return CSS_Utility::render_box(
								CSS_Utility::merge_views(
									CSS_Utility::make_box( '20px' ),
									isset( $attrs['padding'] ) && is_array( $attrs['padding'] ) ? $attrs['padding'] : array(),
									$value
								)
							);
						},
						'media'    => 'tablet',
					),
					array(
						'property' => '--padding',
						'value'    => 'paddingMobile',
						'format'   => function( $value, $attrs ) {
							return CSS_Utility::render_box(
								CSS_Utility::merge_views(
									CSS_Utility::make_box( '20px' ),
									isset( $attrs['padding'] ) && is_array( $attrs['padding'] ) ? $attrs['padding'] : array(),
									isset( $attrs['paddingTablet'] ) ? $attrs['paddingTablet'] : array(),
									$value
								)
							);
						},
						'media'    => 'mobile',
					),
					array(
						'property'       => '--box-shadow',
						'pattern'        => 'horizontal vertical blur color',
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
							'color'      => array(
								'value'   => 'boxShadowColor',
								'default' => '#000',
								'format'  => function( $value, $attrs ) {
									$opacity = ( isset( $attrs['boxShadowColorOpacity'] ) ? $attrs['boxShadowColorOpacity'] : 50 );
									return ( strpos( $value, '#' ) !== false && $opacity < 100 ) ? Base_CSS::hex2rgba( $value, $opacity / 100 ) : $value;
								},
							),
						),
						'condition'      => function( $attrs ) {
							return isset( $attrs['boxShadow'] );
						},
					),
					array(
						'property'  => '--front-media-width',
						'value'     => 'frontMediaWidth',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['--front-media-width'] ) && is_numeric( $attrs['--front-media-width'] );
						},
					),
					array(
						'property'  => '--front-media-height',
						'value'     => 'frontMediaHeight',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['--front-media-height'] ) && is_numeric( $attrs['--front-media-height'] );
						},
					),
					array(
						'property'  => '--front-media-width',
						'value'     => 'frontMediaWidth',
						'condition' => function( $attrs ) {
							return isset( $attrs['frontMediaWidth'] ) && is_string( $attrs['frontMediaWidth'] );
						},
					),
					array(
						'property'  => '--front-media-height',
						'value'     => 'frontMediaHeight',
						'condition' => function( $attrs ) {
							return isset( $attrs['frontMediaHeight'] ) && is_string( $attrs['frontMediaHeight'] );
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .o-flip-front .o-flip-content h3',
				'properties' => array(
					array(
						'property' => 'color',
						'value'    => 'titleColor',
					),
					array(
						'property' => 'font-size',
						'value'    => 'titleFontSize',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .o-flip-front .o-flip-content p',
				'properties' => array(
					array(
						'property' => 'color',
						'value'    => 'descriptionColor',
					),
					array(
						'property' => 'font-size',
						'value'    => 'descriptionFontSize',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
