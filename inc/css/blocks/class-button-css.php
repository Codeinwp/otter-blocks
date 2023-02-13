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
						'property'  => 'border-width',
						'value'     => 'borderSize',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['borderSize'] ) && is_numeric( $attrs['borderSize'] );
						},
						'hasSync'   => 'gr-btn-border-width',
					),
					array(
						'property'  => 'border-width',
						'value'     => 'borderSize',
						'format'    => function( $value, $attrs ) {
							return CSS_Utility::box_values(
								$value,
								array(
									'left'   => '1px',
									'right'  => '1px',
									'top'    => '1px',
									'bottom' => '1px',
								)
							);
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['borderSize'] ) && is_array( $attrs['borderSize'] );
						},
						'hasSync'   => 'gr-btn-border-size',
					),
					array(
						'property'  => 'border-style',
						'default'   => 'solid',
						'hasSync'   => 'gr-btn-border-style',
						'condition' => function( $attrs ) {
							return isset( $attrs['border'] ) && ! empty( $attrs['border'] );
						},
					),
					array(
						'property'  => 'border-radius',
						'value'     => 'borderRadius',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['borderRadius'] ) && is_numeric( $attrs['borderRadius'] );
						},
						'hasSync'   => 'gr-btn-border-radius',
					),
					array(
						'property'  => 'border-radius',
						'value'     => 'borderRadius',
						'format'    => function( $value, $attrs ) {
							return CSS_Utility::box_values(
								$value,
								array(
									'left'   => '1px',
									'right'  => '1px',
									'top'    => '1px',
									'bottom' => '1px',
								)
							);
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['borderRadius'] ) && is_array( $attrs['borderRadius'] );
						},
						'hasSync'   => 'gr-btn-border-radius',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-button__link:not(:hover)',
				'properties' => array(
					array(
						'property' => 'color',
						'value'    => 'color',
						'hasSync'  => 'gr-btn-color',
					),
					array(
						'property' => 'background',
						'value'    => 'background',
						'hasSync'  => 'gr-btn-background',
					),
					array(
						'property' => 'background',
						'value'    => 'backgroundGradient',
						'hasSync'  => 'gr-btn-background',
					),
					array(
						'property' => 'border-color',
						'value'    => 'border',
						'hasSync'  => 'gr-btn-border-color',
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
						'hasSync'        => 'gr-btn-shadow',
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
						'hasSync'  => 'gr-btn-color-hover',
					),
					array(
						'property' => 'background',
						'value'    => 'hoverBackground',
						'hasSync'  => 'gr-btn-background-hover',
					),
					array(
						'property' => 'background',
						'value'    => 'hoverBackgroundGradient',
						'hasSync'  => 'gr-btn-background-hover',
					),
					array(
						'property' => 'border-color',
						'value'    => 'hoverBorder',
						'hasSync'  => 'gr-btn-border-color-hover',
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
						'hasSync'        => 'gr-btn-shadow-hover',
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}

	/**
	 * Generate Button Group Global CSS
	 * 
	 * @return string
	 * @since 2.2.3
	 * @access public
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
				'selector'   => ' .wp-block-themeisle-blocks-button .wp-block-button__link',
				'properties' => array(
					array(
						'property' => '--gr-btn-color',
						'value'    => 'color',
					),
					array(
						'property' => '--gr-btn-background',
						'value'    => 'background',
					),
					array(
						'property' => '--gr-btn-background',
						'value'    => 'backgroundGradient',
					),
					array(
						'property'  => '--gr-btn-border-size',
						'value'     => 'borderSize',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['borderSize'] ) && is_numeric( $attrs['borderSize'] );
						},
					),
					array(
						'property'  => '--gr-btn-border-size',
						'value'     => 'borderSize',
						'format'    => function( $value, $attrs ) {
							return CSS_Utility::box_values(
								$value,
								array(
									'left'   => '1px',
									'right'  => '1px',
									'top'    => '1px',
									'bottom' => '1px',
								)
							);
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['borderSize'] ) && is_array( $attrs['borderSize'] );
						},
					),
					array(
						'property'  => '--gr-btn-border-color',
						'value'     => 'border',
						'condition' => function( $attrs ) {
							return isset( $attrs['border'] ) && ! empty( $attrs['border'] );
						},
					),
					array(
						'property'  => '--gr-btn-border-style',
						'default'   => 'solid',
						'condition' => function( $attrs ) {
							return isset( $attrs['border'] ) && ! empty( $attrs['border'] );
						},
					),
					array(
						'property'  => '--gr-btn-border-radius',
						'value'     => 'borderRadius',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['borderRadius'] ) && is_numeric( $attrs['borderRadius'] );
						},
					),
					array(
						'property'  => '--gr-btn-border-radius',
						'value'     => 'borderRadius',
						'format'    => function( $value, $attrs ) {
							return CSS_Utility::box_values(
								$value,
								array(
									'left'   => '1px',
									'right'  => '1px',
									'top'    => '1px',
									'bottom' => '1px',
								)
							);
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['borderRadius'] ) && is_array( $attrs['borderRadius'] );
						},
					),
					array(
						'property'       => '--gr-btn-shadow',
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
				'selector'   => ' .wp-block-themeisle-blocks-button .wp-block-button__link:hover',
				'properties' => array(
					array(
						'property' => '--gr-btn-color-hover',
						'value'    => 'hoverColor',
					),
					array(
						'property' => '--gr-btn-background-hover',
						'value'    => 'hoverBackground',
					),
					array(
						'property' => '--gr-btn-background-hover',
						'value'    => 'hoverBackgroundGradient',
					),
					array(
						'property' => '--gr-btn-border-color-hover',
						'value'    => 'hoverBorder',
					),
					array(
						'property'       => '--gr-btn-shadow-hover',
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
