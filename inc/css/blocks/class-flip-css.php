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
		$css = new CSS_Utility( $block );

		$css->add_item(
			array(
				'properties' => array(
					array(
						'property' => '--width',
						'value'    => 'width',
						'unit'     => 'px',
					),
					array(
						'property' => '--height',
						'value'    => 'height',
						'unit'     => 'px',
					),
					array(
						'property' => '--border-color',
						'value'    => 'borderColor',
					),
					array(
						'property' => '--border-width',
						'value'    => 'borderWidth',
						'unit'     => 'px',
					),
					array(
						'property' => '--border-radius',
						'value'    => 'borderRadius',
						'unit'     => 'px',
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
						'property' => '--padding',
						'value'    => 'padding',
						'unit'     => 'px',
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
									return ( strpos( $value, '#' ) !== false && $opacity < 100 ) ? $this->hex2rgba( $value, $opacity / 100 ) : $value;
								},
							),
						),
						'condition'      => function( $attrs ) {
							return isset( $attrs['boxShadow'] );
						},
					),
					array(
						'property' => '--front-media-width',
						'value'    => 'frontMediaWidth',
						'unit'     => 'px',
					),
					array(
						'property' => '--front-media-height',
						'value'    => 'frontMediaHeight',
						'unit'     => 'px',
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
						'unit'     => 'px',
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
						'unit'     => 'px',
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
