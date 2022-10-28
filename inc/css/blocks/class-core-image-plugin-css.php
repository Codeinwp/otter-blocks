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
 * Class Core_Image_Plugin_CSS
 */
class Core_Image_Plugin_CSS extends Base_CSS {

	/**
	 * The library under which the blocks are registered.
	 *
	 * @var string
	 */
	public $library_prefix = 'core';

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'image';

	/**
	 * Generate Icon Block CSS
	 *
	 * @param mixed $block Block data.
	 * @return string
	 * @since   1.7.0
	 * @access  public
	 */
	public function render_css( $block ) {
		$css   = new CSS_Utility( $block );
		$style = '';


		$re = '/<[figure\/div].*id="([^"]*?)".*>/m';
		preg_match_all( $re, $block['innerHTML'], $matches, PREG_SET_ORDER, 0 );

		if ( ! isset( $matches[0] ) || ! isset( $matches[0][1] ) ) {
			return $style;
		}

		$id = $matches[0][1];

		$css->set_id( $id );

		$css->add_item(
			array(
				'selector'   => ' img',
				'properties' => array(
					array(
						'property'       => 'box-shadow',
						'pattern'        => 'horizontal vertical blur color',
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
							'color'      => array(
								'value'   => 'boxShadowColor',
								'default' => '#000',
								'format'  => function( $value, $attrs ) {
									$opacity = ( isset( $attrs['boxShadowColorOpacity'] ) ? $attrs['boxShadowColorOpacity'] : 50 );
									return ( strpos( $value, '#' ) !== false && $opacity < 100 ) ? Base_CSS::hex2rgba( $value, $opacity / 100 ) : $value;
								},
							),
						),
						'condition'      => function( $attrs ) {
							return isset( $attrs['boxShadow'] );
						},
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
