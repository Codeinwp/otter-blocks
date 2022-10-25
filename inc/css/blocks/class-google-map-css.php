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
 * Class Google_Map_CSS
 */
class Google_Map_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'google-map';

	/**
	 * Generate Google Map CSS
	 *
	 * @param mixed $block Block data.
	 * @return string
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
				),
			)
		);

		return $css->generate();
	}
}
