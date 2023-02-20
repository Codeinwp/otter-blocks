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
						'property' => '--content-background',
						'value'    => 'contentBackground',
						'hasSync'  => 'accordion-content-background',
					),
					array(
						'property' => '--border-color',
						'value'    => 'borderColor',
						'hasSync'  => 'accordion-border-color',
					),
					array(
						'property'  => '--border-width',
						'value'     => 'borderWidth',
						'format'    => function( $value ) {
							return $value;
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['borderWidth'] );
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
						'property' => '--gap',
						'value'    => 'gap',
						'format'   => function( $value, $attrs ) {
							return $value . 'px';
						},
					),
					array(
						'property' => '--padding',
						'value'    => 'padding',
						'format'   => function( $value, $attrs ) {
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
					),
					array(
						'property' => '--padding-tablet',
						'value'    => 'paddingTablet',
						'format'   => function( $value, $attrs ) {
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
					),
					array(
						'property' => '--padding-mobile',
						'value'    => 'paddingMobile',
						'format'   => function( $value, $attrs ) {
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
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' > .wp-block-themeisle-blocks-accordion-item[open]',
				'properties' => array(
					array(
						'property' => '--title-color',
						'value'    => 'activeTitleColor',
						'hasSync'  => 'accordion-title-color',
					),
					array(
						'property' => '--title-background',
						'value'    => 'activeTitleBackground',
						'hasSync'  => 'accordion-title-background',
					),
				),
			)
		);

		// Add typography attributes specifically to the title and without CSS variables so the title will
		// inherit theme styles when these attributes are not set.
		$css->add_item(
			array(
				'selector'   => ' > .wp-block-themeisle-blocks-accordion-item > .wp-block-themeisle-blocks-accordion-item__title > *',
				'properties' => array(
					array(
						'property' => 'font-size',
						'value'    => 'fontSize',
						'unit'     => 'px',
					),
					array(
						'property' => 'font-family',
						'value'    => 'fontFamily',
					),
					array(
						'property' => 'font-variant',
						'value'    => 'fontVariant',
					),
					array(
						'property' => 'font-style',
						'value'    => 'fontStyle',
					),
					array(
						'property' => 'text-transform',
						'value'    => 'textTransform',
					),
					array(
						'property' => 'letter-spacing',
						'value'    => 'letterSpacing',
						'unit'     => 'px',
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
				'selector'   => ' > .wp-block-themeisle-blocks-accordion-item:not([open]) > .wp-block-themeisle-blocks-accordion-item__title::after',
				'properties' => array(
					array(
						'property'  => 'content',
						'value'     => 'icon',
						'format'    => function( $value ) use ( $fa_icons ) {
							return '"\\\\' . $fa_icons[ $value['name'] ]['unicode'] . '"';
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
				'selector'   => ' > .wp-block-themeisle-blocks-accordion-item[open] > .wp-block-themeisle-blocks-accordion-item__title::after',
				'properties' => array(
					array(
						'property'  => 'content',
						'value'     => 'openItemIcon',
						'format'    => function( $value ) use ( $fa_icons ) {
							return '"\\\\' . $fa_icons[ $value['name'] ]['unicode'] . '"';
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
			return '';
		}

		$defaults = json_decode( $defaults, true );

		if ( ! isset( $defaults[ $block ] ) ) {
			return '';
		}

		$block = array(
			'attrs' => $defaults[ $block ],
		);

		$css = new CSS_Utility( $block );

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-accordion',
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
						'property' => '--accordion-content-background',
						'value'    => 'contentBackground',
					),
					array(
						'property' => '--accordion-border-color',
						'value'    => 'borderColor',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-accordion-item[open]',
				'properties' => array(
					array(
						'property' => '--accordion-title-color',
						'value'    => 'activeTitleColor',
					),
					array(
						'property' => '--accordion-title-background',
						'value'    => 'activeTitleBackground',
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
