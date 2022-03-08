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
						'property' => '--titleColor',
						'value'    => 'titleColor',
						'hasSync'  => 'accordionTitleColor',
					),
					array(
						'property' => '--titleBackground',
						'value'    => 'titleBackground',
						'hasSync'  => 'accordionTitleBackground',
					),
					array(
						'property' => '--borderColor',
						'value'    => 'borderColor',
						'hasSync'  => 'accordionBorderColor',
					),
					array(
						'property' => '--contentBackground',
						'value'    => 'contentBackground',
						'hasSync'  => 'accordionContentBackground',
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

		$block = array(
			'attrs' => $defaults[ $block ],
		);

		$css = new CSS_Utility( $block );

		$css->add_item(
			array(
				'selector'   => '.wp-block-themeisle-blocks-accordion',
				'properties' => array(
					array(
						'property' => '--accordionTitleColor',
						'value'    => 'titleColor',
					),
					array(
						'property' => '--accordionTitleBackground',
						'value'    => 'titleBackground',
					),
					array(
						'property' => '--accordionBorderColor',
						'value'    => 'borderColor',
					),
					array(
						'property' => '--accordionContentBackground',
						'value'    => 'contentBackground',
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
