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
 * Class Leaflet_Map_CSS
 */
class Leaflet_Map_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'leaflet-map';

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

							// Check if the value is a number.
							if ( is_numeric( $value ) ) {
								$suffix = substr( $value, -2 );
								if ( 'px' !== $suffix ) {
									return $value . 'px';
								}
							}

							return $value;
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
