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
class Button_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'button';

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
				'selector'   => ' .wp-block-button__link',
				'properties' => array(
					array(
						'property'  => 'display',
						'default'   => 'inline-flex',
						'condition' => function( $attrs ) {
							return isset( $attrs['library'] ) && 'themeisle-icons' === $attrs['library'];
						},
					),
					array(
						'property'  => 'align-items',
						'default'   => 'center',
						'condition' => function( $attrs ) {
							return isset( $attrs['library'] ) && 'themeisle-icons' === $attrs['library'];
						},
					),
					array(
						'property'  => 'justify-content',
						'default'   => 'center',
						'condition' => function( $attrs ) {
							return isset( $attrs['library'] ) && 'themeisle-icons' === $attrs['library'];
						},
					),
					array(
						'property' => 'color',
						'value'    => 'color',
					),
					array(
						'property' => 'background',
						'value'    => 'background',
					),
					array(
						'property' => 'background',
						'value'    => 'backgroundGradient',
					),
					array(
						'property' => 'border-width',
						'value'    => 'borderSize',
						'unit'     => 'px',
					),
					array(
						'property'  => 'border-color',
						'value'     => 'border',
						'condition' => function( $attrs ) {
							return isset( $attrs['border'] ) && ! empty( $attrs['border'] );
						},
					),
					array(
						'property'  => 'border-style',
						'default'   => 'solid',
						'condition' => function( $attrs ) {
							return isset( $attrs['border'] ) && ! empty( $attrs['border'] );
						},
					),
					array(
						'property' => 'border-radius',
						'value'    => 'borderRadius',
						'unit'     => 'px',
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
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-button__link:hover',
				'properties' => array(
					array(
						'property' => 'color',
						'value'    => 'hoverColor',
					),
					array(
						'property' => 'background',
						'value'    => 'hoverBackground',
					),
					array(
						'property' => 'background',
						'value'    => 'hoverBackgroundGradient',
					),
					array(
						'property' => 'border-color',
						'value'    => 'hoverBorder',
					),
					array(
						'property'       => 'box-shadow',
						'pattern'        => 'horizontal vertical blur spread color',
						'pattern_values' => array(
							'horizontal' => array(
								'value'   => 'hoverBoxShadowHorizontal',
								'unit'    => 'px',
								'default' => 0,
							),
							'vertical'   => array(
								'value'   => 'hoverBoxShadowVertical',
								'unit'    => 'px',
								'default' => 0,
							),
							'blur'       => array(
								'value'   => 'hoverBoxShadowBlur',
								'unit'    => 'px',
								'default' => 5,
							),
							'spread'     => array(
								'value'   => 'hoverBoxShadowSpread',
								'unit'    => 'px',
								'default' => 1,
							),
							'color'      => array(
								'value'   => 'hoverBoxShadowColor',
								'default' => '#000',
								'format'  => function( $value, $attrs ) {
									$opacity = ( isset( $attrs['hoverBoxShadowColorOpacity'] ) ? $attrs['hoverBoxShadowColorOpacity'] : 50 ) / 100;
									return Base_CSS::hex2rgba( $value, $opacity );
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

		$style = $css->generate();

		return $style;
	}
}
