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
 * Class Font_Awesome_Icons_CSS
 */
class Font_Awesome_Icons_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'font-awesome-icons';

	/**
	 * Generate Font Awesome Icons CSS
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
						'property' => '--align',
						'value'    => 'align',
					),
					array(
						'property' => '--border-color',
						'value'    => 'borderColor',
					),
					array(
						'property' => '--border-size',
						'value'    => 'borderSize',
						'unit'     => 'px',
					),
					array(
						'property' => '--border-radius',
						'value'    => 'borderRadius',
						'unit'     => '%',
					),
					array(
						'property' => '--margin',
						'value'    => 'margin',
						'default'  => 5,
						'unit'     => 'px',
						'hasSync'  => 'icon-margin',
					),
					array(
						'property' => '--padding',
						'value'    => 'padding',
						'default'  => 5,
						'unit'     => 'px',
						'hasSync'  => 'icon-padding',
					),
					array(
						'property' => '--font-size',
						'value'    => 'fontSize',
						'unit'     => 'px',
						'hasSync'  => 'icon-font-size',
					),
				),
			)
		);

		$padding = array();

		// This argument isn't used inside condition because of global defaults.
		if ( isset( $block['attrs']['library'] ) && 'themeisle-icons' === $this->get_attr_value( $block['attrs']['library'], 'fontawesome' ) ) {
			$padding = array(
				array(
					'property' => 'padding',
					'value'    => 'padding',
					'default'  => 5,
					'unit'     => 'px',
					'hasSync'  => 'icon-padding',
				),
			);
		}

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-font-awesome-icons-container',
				'properties' => array_merge(
					array(
						array(
							'property' => 'color',
							'value'    => 'textColor',
							'hasSync'  => 'icon-text-color',
						),
						array(
							'property' => 'background',
							'value'    => 'backgroundColor',
							'hasSync'  => 'icon-background-color',
						),
					),
					$padding
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-font-awesome-icons-container:hover',
				'properties' => array(
					array(
						'property'  => 'color',
						'value'     => 'textColorHover',
						'condition' => function( $attrs ) {
							return ! ( isset( $attrs['library'] ) && 'themeisle-icons' === $this->get_attr_value( $attrs['library'], 'fontawesome' ) );
						},
						'hasSync'   => 'icon-text-color-hover',
					),
					array(
						'property' => 'background',
						'value'    => 'backgroundColorHover',
						'hasSync'  => 'icon-background-color-hover',
					),
					array(
						'property' => 'border-color',
						'value'    => 'borderColorHover',
						'hasSync'  => 'iconBorderColorHover',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-font-awesome-icons-container a',
				'properties' => array(
					array(
						'property'  => 'color',
						'value'     => 'textColor',
						'condition' => function( $attrs ) {
							return ! ( isset( $attrs['library'] ) && 'themeisle-icons' === $this->get_attr_value( $attrs['library'], 'fontawesome' ) );
						},
						'hasSync'   => 'icon-text-color',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-font-awesome-icons-container i',
				'properties' => array(
					array(
						'property' => 'font-size',
						'value'    => 'fontSize',
						'unit'     => 'px',
						'hasSync'  => 'icon-font-size',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-font-awesome-icons-container svg',
				'properties' => array(
					array(
						'property'  => 'fill',
						'value'     => 'textColor',
						'condition' => function( $attrs ) {
							return isset( $attrs['library'] ) && 'themeisle-icons' === $this->get_attr_value( $attrs['library'], 'fontawesome' );
						},
						'hasSync'   => 'icon-text-color',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-font-awesome-icons-container:hover svg',
				'properties' => array(
					array(
						'property'  => 'fill',
						'value'     => 'textColorHover',
						'condition' => function( $attrs ) {
							return isset( $attrs['library'] ) && 'themeisle-icons' === $this->get_attr_value( $attrs['library'], 'fontawesome' );
						},
						'hasSync'   => 'icon-text-color-hover',
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
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
				'selector'   => '.wp-block-themeisle-blocks-font-awesome-icons',
				'properties' => array(
					array(
						'property' => '--icon-font-size',
						'value'    => 'fontSize',
						'unit'     => 'px',
					),
					array(
						'property' => '--icon-margin',
						'value'    => 'margin',
						'unit'     => 'px',
					),
					array(
						'property' => '--icon-padding',
						'value'    => 'padding',
						'unit'     => 'px',
					),
					array(
						'property' => '--icon-text-color-hover',
						'value'    => 'textColorHover',
					),
					array(
						'property' => '--icon-background-color-hover',
						'value'    => 'backgroundColorHover',
					),
					array(
						'property' => '--icon-text-color',
						'value'    => 'textColor',
					),
					array(
						'property' => '--icon-background-color',
						'value'    => 'backgroundColor',
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
