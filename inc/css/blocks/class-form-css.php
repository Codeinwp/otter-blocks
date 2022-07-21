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
 * Class Form_CSS
 */
class Form_CSS extends Base_CSS {
	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'form';

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
						'property' => '--label-color',
						'value'    => 'labelColor',
					),
					array(
						'property' => '--border-radius',
						'value'    => 'inputBorderRadius',
						'unit'     => 'px',
					),
					array(
						'property' => '--border-color',
						'value'    => 'inputBorderColor',
					),
					array(
						'property' => '--border-width',
						'value'    => 'inputBorderWidth',
						'unit'     => 'px',
					),
					array(
						'property'  => '--padding',
						'value'     => 'inputPadding',
						'format'    => function( $value, $attrs ) {
							return $value['top'] . ' ' . $value['right'] . ' ' . $value['bottom'] . ' ' . $value['left'];
						},
						'condition' => function( $attrs ) {
							return ( isset( $attrs['inputPadding'] ) && isset( $attrs['inputPadding']['top'] )
							&& isset( $attrs['inputPadding'] ) && isset( $attrs['inputPadding']['right'] )
							&& isset( $attrs['inputPadding'] ) && isset( $attrs['inputPadding']['bottom'] )
							&& isset( $attrs['inputPadding'] ) && isset( $attrs['inputPadding']['left'] ) );
						},
					),
					array(
						'property' => '--input-width',
						'value'    => 'inputWidth',
						'unit'     => '%',
					),
					array(
						'property' => '--submit-color',
						'value'    => 'submitColor',
					),
					array(
						'property' => '--help-label-color',
						'value'    => 'helpLabelColor',
					),
					array(
						'property' => '--submit-msg-color',
						'value'    => 'submitMessageColor',
					),
					array(
						'property' => '--submit-error-color',
						'value'    => 'submitMessageErrorColor',
					),
					array(
						'property' => '--inputs-gap',
						'value'    => 'inputsGap',
						'unit'     => 'px',
					),
					array(
						'property' => '--input-gap',
						'value'    => 'inputGap',
						'unit'     => 'px',
					),
					array(
						'property' => '--label-font-size',
						'value'    => 'labelFontSize',
					),
					array(
						'property' => '--submit-font-size',
						'value'    => 'submitFontSize',
					),
					array(
						'property' => '--message-font-size',
						'value'    => 'messageFontSize',
					),
					array(
						'property' => '--input-font-size',
						'value'    => 'inputFontSize',
					),
					array(
						'property' => '--help-font-size',
						'value'    => 'helpFontSize',
					),
					array(
						'property' => '--input-color',
						'value'    => 'inputColor',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-button__link',
				'properties' => array(
					array(
						'property' => 'background-color',
						'value'    => 'submitBackgroundColor',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-button__link:hover',
				'properties' => array(
					array(
						'property' => 'background-color',
						'value'    => 'submitBackgroundColorHover',
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}

}
