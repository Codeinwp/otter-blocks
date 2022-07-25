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
