<?php
/**
 * Css handling logic for blocks.
 *
 * @package ThemeIsle\OtterPro\CSS\Blocks
 */

namespace ThemeIsle\OtterPro\CSS\Blocks;

use ThemeIsle\GutenbergBlocks\Base_CSS;

use ThemeIsle\GutenbergBlocks\CSS\CSS_Utility;

/**
 * Class Form_Stripe_Field_CSS
 */
class Form_Stripe_Field_CSS extends Base_CSS {
	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'form-stripe-field';

	/**
	 * Generate Form Field CSS
	 *
	 * @param mixed $block Block data.
	 * @return string
	 * @since   2.3.0
	 * @access  public
	 */
	public function render_css( $block ) {
		$css = new CSS_Utility( $block );

		$css->add_item(
			array(
				'properties' => array(
					array(
						'property' => '--label-color',
						'value'    => 'labelColor',
					),
					array(
						'property' => '--stripe-border-color',
						'value'    => 'borderColor',
					),
					array(
						'property' => '--stripe-border-radius',
						'value'    => 'borderRadius',
						'format'   => function ( $value ) {
							return CSS_Utility::render_box( $value );
						},
					),
					array(
						'property' => '--stripe-border-width',
						'value'    => 'borderWidth',
						'format'   => function ( $value ) {
							return CSS_Utility::render_box( $value );
						},
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
