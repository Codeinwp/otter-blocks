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
				'selector'   => ' .o-inner',
				'properties' => array(
					array(
						'property' => 'width',
						'value'    => 'width',
						'unit'     => 'px',
					),
					array(
						'property' => 'height',
						'value'    => 'height',
						'unit'     => 'px',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .o-front:hover, .o-back',
				'properties' => array(
					array(
						'property'       => 'box-shadow',
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
							return isset( $attrs['boxShadow'] ) && ( ! isset( $attrs['isInverted'] ) || ( isset( $attrs['isInverted'] ) && false === $attrs['isInverted'] ) );
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .o-front, .o-back:hover',
				'properties' => array(
					array(
						'property'       => 'box-shadow',
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
							return isset( $attrs['boxShadow'] ) && ( isset( $attrs['isInverted'] ) && $attrs['isInverted'] );
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .o-front',
				'properties' => array(
					array(
						'property' => 'border-color',
						'value'    => 'borderColor',
					),
					array(
						'property' => 'border-width',
						'value'    => 'borderWidth',
						'unit'     => 'px',
					),
					array(
						'property' => 'border-radius',
						'value'    => 'borderRadius',
						'unit'     => 'px',
					),
					array(
						'property' => 'background-color',
						'value'    => 'frontBackgroundColor',
					),
					array(
						'property' => 'background-image',
						'value'    => 'frontBackgroundGradient',
						'condition' => function( $attrs ) {
							return isset( $attrs['frontBackgroundType'] ) && 'gradient' == $attrs['frontBackgroundType'] ;
						},
					),
					array(
						'property' => 'background-image',
						'value'    => 'frontImg',
						'format'   => function( $value, $attrs ) {
							return "url({$value['url']})";
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['frontBackgroundType'] ) && 'image' == $attrs['frontBackgroundType'] ;
						},
					),
					array(
						'property' => 'background-position',
						'value'    => 'frontImgFocalpoint',
						'format'   => function( $value, $attrs ) {
							return( $value['x'] * 100 ) . '% ' . ( $value['y'] * 100 ) . '%';
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['frontBackgroundType'] ) && 'image' == $attrs['frontBackgroundType'] ;
						},
					),
					array(
						'property' => 'background-repeat',
						'value'    => 'frontBackgroundRepeat',
						'condition' => function( $attrs ) {
							return isset( $attrs['frontBackgroundType'] ) && 'image' == $attrs['frontBackgroundType'] ;
						},
					),
					array(
						'property' => 'background-size',
						'value'    => 'frontBackgroundSize',
						'condition' => function( $attrs ) {
							return isset( $attrs['frontBackgroundType'] ) && 'image' == $attrs['frontBackgroundType'] ;
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .o-front .o-content',
				'properties' => array(
					array(
						'property' => 'padding',
						'value'    => 'padding',
						'unit'     => 'px',
					),
					array(
						'property' => 'justify-content',
						'value'    => 'verticalAlign',
					),
					array(
						'property' => 'align-items',
						'value'    => 'horizontalAlign',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .o-front .o-content h2',
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
				'selector'   => ' .o-front .o-content p',
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

		$css->add_item(
			array(
				'selector'   => ' .o-back',
				'properties' => array(
					array(
						'property' => 'border-color',
						'value'    => 'borderColor',
					),
					array(
						'property' => 'border-width',
						'value'    => 'borderWidth',
						'unit'     => 'px',
					),
					array(
						'property' => 'padding',
						'value'    => 'padding',
						'unit'     => 'px',
					),
					array(
						'property' => 'border-radius',
						'value'    => 'borderRadius',
						'unit'     => 'px',
					),
					array(
						'property' => 'justify-content',
						'value'    => 'backVerticalAlign',
					),
					array(
						'property' => 'background-color',
						'value'    => 'backBackgroundColor',
					),
					array(
						'property' => 'background-image',
						'value'    => 'backBackgroundGradient',
						'condition' => function( $attrs ) {
							return isset( $attrs['backBackgroundType'] ) && 'gradient' == $attrs['backBackgroundType'] ;
						},
					),
					array(
						'property' => 'background-image',
						'value'    => 'backImg',
						'format'   => function( $value, $attrs ) {
							return "url({$value['url']})";
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['backBackgroundType'] ) && 'image' == $attrs['backBackgroundType'] ;
						},
					),
					array(
						'property' => 'background-position',
						'value'    => 'backImgFocalpoint',
						'format'   => function( $value, $attrs ) {
							return( $value['x'] * 100 ) . '% ' . ( $value['y'] * 100 ) . '%';
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['backBackgroundType'] ) && 'image' == $attrs['backBackgroundType'] ;
						},
					),
					array(
						'property' => 'background-repeat',
						'value'    => 'backBackgroundRepeat',
						'condition' => function( $attrs ) {
							return isset( $attrs['backBackgroundType'] ) && 'image' == $attrs['backBackgroundType'] ;
						},
					),
					array(
						'property' => 'background-size',
						'value'    => 'backBackgroundSize',
						'condition' => function( $attrs ) {
							return isset( $attrs['backBackgroundType'] ) && 'image' == $attrs['backBackgroundType'] ;
						},
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
