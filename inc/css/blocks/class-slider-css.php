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
 * Class Slider_CSS
 */
class Slider_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'slider';

	/**
	 * Generate Slider CSS
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
						'property' => '--height',
						'value'    => 'height',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
					),
					array(
						'property' => '--height-tablet',
						'value'    => 'heightTablet',
					),
					array(
						'property' => '--height-mobile',
						'value'    => 'heightMobile',
					),
					array(
						'property' => '--width',
						'value'    => 'width',
					),
					array(
						'property' => '--arrows-color',
						'value'    => 'arrowsColor',
					),
					array(
						'property' => '--arrows-background-color',
						'value'    => 'arrowsBackgroundColor',
					),
					array(
						'property' => '--pagination-color',
						'value'    => 'paginationColor',
					),
					array(
						'property' => '--pagination-active-color',
						'value'    => 'paginationActiveColor',
					),
					array(
						'property' => '--border-color',
						'value'    => 'borderColor',
					),
					array(
						'property' => '--border-width',
						'value'    => 'borderWidth',
					),
					array(
						'property' => '--border-radius',
						'value'    => 'borderRadius',
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
