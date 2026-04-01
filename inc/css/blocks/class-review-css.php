<?php
/**
 * Css handling logic for blocks.
 *
 * @package ThemeIsle\GutenbergBlocks\CSS\Blocks
 */

namespace ThemeIsle\GutenbergBlocks\CSS\Blocks;

use ThemeIsle\GutenbergBlocks\Base_CSS;

use ThemeIsle\GutenbergBlocks\CSS\CSS_Utility;

/**
 * Class Review_CSS
 */
class Review_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'review';

	/**
	 * Generate Review CSS
	 *
	 * @param mixed $block Block data.
	 * @return string
	 * @since   1.3.0
	 * @access  public
	 */
	public function render_css( $block ) {
		$css     = new CSS_Utility( $block );
		$padding = array(
			'padding'       => array(
				'prefix' => '--padding-desktop-',
			),
			'paddingTablet' => array(
				'prefix' => '--padding-tablet-',
			),
			'paddingMobile' => array(
				'prefix' => '--padding-mobile-',
			),
		);

		$padding_sides = array(
			'top',
			'bottom',
			'left',
			'right',
		);

		$padding_css = array();

		foreach ( $padding as $key => $item ) {
			foreach ( $padding_sides as $side ) {
				array_push(
					$padding_css,
					array(
						'property'  => $item['prefix'] . $side,
						'value'     => $key,
						'format'    => function ( $value, $attrs ) use ( $side ) {
							return $value[ $side ];
						},
						'condition' => function ( $attrs ) use ( $key, $side ) {
							return isset( $attrs[ $key ] ) && isset( $attrs[ $key ][ $side ] );
						},
					)
				);
			}
		}

		$css->add_item(
			array(
				'properties' => array_merge(
					array(
						array(
							'property' => '--background-color',
							'value'    => 'backgroundColor',
							'format'   => function ( $value ) {
								return Base_CSS::resolve_color_value( $value );
							},
							'hasSync'  => 'review-background-color',
						),
						array(
							'property' => '--primary-color',
							'value'    => 'primaryColor',
							'format'   => function ( $value ) {
								return Base_CSS::resolve_color_value( $value );
							},
							'hasSync'  => 'review-primary-color',
						),
						array(
							'property' => '--text-color',
							'value'    => 'textColor',
							'format'   => function ( $value ) {
								return Base_CSS::resolve_color_value( $value );
							},
							'hasSync'  => 'review-text-color',
						),
						array(
							'property' => '--button-text-color',
							'value'    => 'buttonTextColor',
							'format'   => function ( $value ) {
								return Base_CSS::resolve_color_value( $value );
							},
							'hasSync'  => 'review-button-text-color',
						),
						array(
							'property' => '--border-color',
							'value'    => 'borderColor',
							'format'   => function ( $value ) {
								return Base_CSS::resolve_color_value( $value );
							},
							'hasSync'  => 'review-border-color',
						),
						array(
							'property' => '--stars-color',
							'value'    => 'starsColor',
							'format'   => function ( $value ) {
								return Base_CSS::resolve_color_value( $value );
							},
							'hasSync'  => 'review-stars-color',
						),
						array(
							'property' => '--pros-color',
							'value'    => 'prosColor',
							'format'   => function ( $value ) {
								return Base_CSS::resolve_color_value( $value );
							},
							'hasSync'  => 'review-pros-color',
						),
						array(
							'property' => '--cons-color',
							'value'    => 'consColor',
							'format'   => function ( $value ) {
								return Base_CSS::resolve_color_value( $value );
							},
							'hasSync'  => 'review-cons-color',
						),
						array(
							'property' => '--content-font-size',
							'value'    => 'contentFontSize',
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
							'property'       => '--box-shadow',
							'pattern'        => 'horizontal vertical blur spread color',
							'pattern_values' => array(
								'horizontal' => array(
									'value'   => 'boxShadow',
									'unit'    => 'px',
									'default' => 0,
									'format'  => function ( $value ) {
										return $value['horizontal'];
									},
								),
								'vertical'   => array(
									'value'   => 'boxShadow',
									'unit'    => 'px',
									'default' => 0,
									'format'  => function ( $value ) {
										return $value['vertical'];
									},
								),
								'blur'       => array(
									'value'   => 'boxShadow',
									'unit'    => 'px',
									'default' => 5,
									'format'  => function ( $value ) {
										return $value['blur'];
									},
								),
								'spread'     => array(
									'value'   => 'boxShadow',
									'unit'    => 'px',
									'default' => 1,
									'format'  => function ( $value ) {
										return $value['spread'];
									},
								),
								'color'      => array(
									'value'   => 'boxShadow',
									'default' => '#000',
									'format'  => function ( $value ) {
										$opacity = $value['colorOpacity'];
										$color   = isset( $value['color'] ) ? $value['color'] : '#000000';
										return ( strpos( $color, '#' ) !== false && $opacity < 100 ) ? Base_CSS::hex2rgba( $color, $opacity / 100 ) : $color;
									},
								),
							),
							'condition'      => function ( $attrs ) {
								return isset( $attrs['boxShadow'] ) && true === $attrs['boxShadow']['active'];
							},
						),
					),
					$padding_css
				),
			)
		);

		$style = $css->generate();

		return $style;
	}

	/**
	 * Generate Review Global CSS
	 *
	 * @return  string|void
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
				'selector'   => '.wp-block-themeisle-blocks-review',
				'properties' => array(
					array(
						'property' => '--review-background-color',
						'value'    => 'backgroundColor',
						'format'   => function ( $value ) {
							return Base_CSS::resolve_color_value( $value );
						},
					),
					array(
						'property' => '--review-primary-color',
						'value'    => 'primaryColor',
						'format'   => function ( $value ) {
							return Base_CSS::resolve_color_value( $value );
						},
					),
					array(
						'property' => '--review-text-color',
						'value'    => 'textColor',
						'format'   => function ( $value ) {
							return Base_CSS::resolve_color_value( $value );
						},
					),
					array(
						'property' => '--review-button-text-color',
						'value'    => 'buttonTextColor',
						'format'   => function ( $value ) {
							return Base_CSS::resolve_color_value( $value );
						},
					),
					array(
						'property' => '--review-stars-color',
						'value'    => 'starsColor',
						'format'   => function ( $value ) {
							return Base_CSS::resolve_color_value( $value );
						},
					),
					array(
						'property' => '--review-border-color',
						'value'    => 'borderColor',
						'format'   => function ( $value ) {
							return Base_CSS::resolve_color_value( $value );
						},
					),
					array(
						'property' => '--review-pros-color',
						'value'    => 'prosColor',
						'format'   => function ( $value ) {
							return Base_CSS::resolve_color_value( $value );
						},
					),
					array(
						'property' => '--review-cons-color',
						'value'    => 'consColor',
						'format'   => function ( $value ) {
							return Base_CSS::resolve_color_value( $value );
						},
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
