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
 * Class Accordion_CSS
 */
class Accordion_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'accordion';

	/**
	 * Generate Accordion CSS
	 *
	 * @param mixed $block Block data.
	 * @return string
	 * @since   1.3.0
	 * @access  public
	 */
	public function render_css( $block ) {
		if ( isset( $block['attrs']['id'] ) ) {
			$this->get_google_fonts( $block['attrs'] );
		}

		$css = new CSS_Utility( $block );

		$css->add_item(
			array(
				'properties' => array(
					array(
						'property' => '--title-color',
						'value'    => 'titleColor',
						'hasSync'  => 'accordion-title-color',
					),
					array(
						'property' => '--title-background',
						'value'    => 'titleBackground',
						'hasSync'  => 'accordion-title-background',
					),
					array(
						'property' => '--border-color',
						'value'    => 'borderColor',
						'hasSync'  => 'accordion-border-color',
					),
					array(
						'property' => '--content-background',
						'value'    => 'contentBackground',
						'hasSync'  => 'accordion-content-background',
					),
					array(
						'property' => '--font-family',
						'value'    => 'fontFamily',
					),
					array(
						'property' => '--font-variant',
						'value'    => 'fontVariant',
					),
					array(
						'property' => '--font-style',
						'value'    => 'fontStyle',
					),
					array(
						'property' => '--text-transform',
						'value'    => 'textTransform',
					),
					array(
						'property' => '--letter-spacing',
						'value'    => 'letterSpacing',
						'unit'     => 'px',
					),
					array(
						'property' => '--font-size',
						'value'    => 'fontSize',
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
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-accordion-item__title',
				'properties' => array(
					array(
						'property'  => 'border-width',
						'value'     => 'headerBorder',
						'format'    => function( $value ) {
							return CSS_Utility::box_values(
								$value['width'],
								array(
									'top'    => '1px',
									'right'  => '1px',
									'bottom' => '1px',
									'left'   => '1px',
								)
							);
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['headerBorder'] ) && isset( $attrs['headerBorder']['width'] );
						},
					),
					array(
						'property'  => 'border-style',
						'value'     => 'headerBorder',
						'format'    => function( $value ) {
							return $value['style'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['headerBorder'] ) && isset( $attrs['headerBorder']['style'] );
						},
					),
					array(
						'property'  => 'border-color',
						'value'     => 'borderColor',
						'condition' => function( $attrs ) {
							return isset( $attrs['borderColor'] );
						},
					),
					array(
						'property'  => 'padding',
						'value'     => 'headerPadding',
						'format'    => function( $value ) {
							return CSS_Utility::box_values(
								$value,
								array(
									'top'    => '18px',
									'right'  => '24px',
									'bottom' => '18px',
									'left'   => '24px',
								)
							);
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['headerPadding'] );
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-accordion-item__content',
				'properties' => array(
					array(
						'property'  => 'border-width',
						'value'     => 'contentBorder',
						'format'    => function( $value ) {
							return CSS_Utility::box_values(
								$value['width'],
								array(
									'top'    => '0',
									'right'  => '1px',
									'bottom' => '1px',
									'left'   => '1px',
								)
							);
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['contentBorder'] ) && isset( $attrs['contentBorder']['width'] );
						},
					),
					array(
						'property'  => 'border-style',
						'value'     => 'contentBorder',
						'format'    => function( $value ) {
							return $value['style'];
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['contentBorder'] ) && isset( $attrs['contentBorder']['style'] );
						},
					),
					array(
						'property'  => 'border-color',
						'value'     => 'borderColor',
						'condition' => function( $attrs ) {
							return isset( $attrs['borderColor'] );
						},
					),
					array(
						'property'  => 'padding',
						'value'     => 'contentPadding',
						'format'    => function( $value ) {
							return CSS_Utility::box_values(
								$value,
								array(
									'top'    => '18px',
									'right'  => '24px',
									'bottom' => '18px',
									'left'   => '24px',
								)
							);
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['contentPadding'] );
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-accordion-item[open]',
				'properties' => array(
					array(
						'property' => '--title-color',
						'value'    => 'activeTitleColor',
					),
					array(
						'property' => '--title-background',
						'value'    => 'activeTitleBackground',
					),
					array(
						'property' => '--content-background',
						'value'    => 'activeContentBackground',
					),
				),
			)
		);

		$css = $this->add_icon( $css );

		$style = $css->generate();

		return $style;
	}

	/**
	 * Adds the icon through CSS
	 *
	 * @param mixed $css The block CSS.
	 *
	 * @return mixed
	 */
	private function add_icon( $css ) {
		$json     = file_get_contents( OTTER_BLOCKS_PATH . '/assets/fontawesome/fa-icons.json' );
		$fa_icons = json_decode( $json, true );

		$prefix_to_family = array(
			'fas' => 'Font Awesome 5 Free',
			'far' => 'Font Awesome 5 Free',
			'fal' => 'Font Awesome 5 Free',
			'fab' => 'Font Awesome 5 Brands',
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-accordion-item:not([open]) .wp-block-themeisle-blocks-accordion-item__title::after',
				'properties' => array(
					array(
						'property'  => 'content',
						'value'     => 'icon',
						'format'    => function( $value ) use ( $fa_icons ) {
							return '"' . str_replace( 'f', '\\\f', $fa_icons[ $value['name'] ]['unicode'] ) . '"';
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['icon'] );
						},
					),
					array(
						'property'  => 'font-weight',
						'value'     => 'icon',
						'format'    => function( $value ) use ( $fa_icons ) {
							return 'fas' !== $value['prefix'] ? 400 : 900;
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['icon'] );
						},
					),
					array(
						'property'  => 'font-family',
						'value'     => 'icon',
						'format'    => function( $value ) use ( $prefix_to_family ) {
							return '"' . $prefix_to_family[ $value['prefix'] ] . '"';
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['icon'] );
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-accordion-item[open] .wp-block-themeisle-blocks-accordion-item__title::after',
				'properties' => array(
					array(
						'property'  => 'content',
						'value'     => 'openItemIcon',
						'format'    => function( $value ) use ( $fa_icons ) {
							return '"' . str_replace( 'f', '\\\f', $fa_icons[ $value['name'] ]['unicode'] ) . '"';
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['openItemIcon'] );
						},
					),
					array(
						'property'  => 'font-weight',
						'value'     => 'openItemIcon',
						'format'    => function( $value ) use ( $fa_icons ) {
							return 'fas' !== $value['prefix'] ? 400 : 900;
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['openItemIcon'] );
						},
					),
					array(
						'property'  => 'font-family',
						'value'     => 'openItemIcon',
						'format'    => function( $value ) use ( $prefix_to_family ) {
							return '"' . $prefix_to_family[ $value['prefix'] ] . '"';
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['openItemIcon'] );
						},
					),
				),
			)
		);

		return $css;
	}

	/**
	 * Generate Accordion Global CSS
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
				'selector'   => '.wp-block-themeisle-blocks-accordion',
				'properties' => array(
					array(
						'property' => '--accordion-title-color',
						'value'    => 'titleColor',
					),
					array(
						'property' => '--accordion-title-background',
						'value'    => 'titleBackground',
					),
					array(
						'property' => '--accordion-border-color',
						'value'    => 'borderColor',
					),
					array(
						'property' => '--accordion-content-background',
						'value'    => 'contentBackground',
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
