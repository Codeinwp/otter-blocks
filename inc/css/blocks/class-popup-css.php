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
 * Class Popup_CSS
 */
class Popup_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'popup';

	/**
	 * Generate Popup CSS
	 *
	 * @param mixed $block Block data.
	 * @return string
	 * @since   1.7.0
	 * @access  public
	 */
	public function render_css( $block ) {
		$css = new CSS_Utility( $block );

		$css->add_item(
			array(
				'selector'   => ' .otter-popup__modal_content',
				'properties' => array(
					array(
						'property' => 'min-width',
						'value'    => 'minWidth',
						'unit'     => 'px',
					),
					array(
						'property' => 'background',
						'value'    => 'backgroundColor',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .otter-popup__modal_header button',
				'properties' => array(
					array(
						'property' => 'color',
						'value'    => 'closeColor',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .otter-popup__modal_wrap_overlay',
				'properties' => array(
					array(
						'property' => 'background',
						'value'    => 'overlayColor',
					),
					array(
						'property' => 'opacity',
						'value'    => 'overlayOpacity',
						'format'   => function( $value ) {
							return $value / 100;
						},
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
