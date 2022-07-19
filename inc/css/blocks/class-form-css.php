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
						'property' => '--labelColor',
						'value'    => 'labelColor',
					),
					array(
						'property' => '--borderRadius',
						'value'    => 'inputBorderRadius',
						'unit'     => 'px',
					),
					array(
						'property' => '--borderColor',
						'value'    => 'inputBorderColor',
					),
					array(
						'property' => '--borderWidth',
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
						'property' => '--inputWidth',
						'value'    => 'inputWidth',
						'unit'     => '%',
					),
					array(
						'property' => '--submitBackground',
						'value'    => 'submitBackgroundColor',
					),
					array(
						'property' => '--submitBackgroundHover',
						'value'    => 'submitBackgroundColorHover',
					),
					array(
						'property' => '--submitColor',
						'value'    => 'submitColor',
					),
					array(
						'property' => '--helpLabelColor',
						'value'    => 'helpLabelColor',
					),
					array(
						'property' => '--submitMsgColor',
						'value'    => 'submitMessageColor',
					),
					array(
						'property' => '--submitErrorColor',
						'value'    => 'submitMessageErrorColor',
					),
					array(
						'property' => '--inputsGap',
						'value'    => 'inputsGap',
						'unit'     => 'px',
					),
					array(
						'property' => '--inputGap',
						'value'    => 'inputGap',
						'unit'     => 'px',
					),
					array(
						'property' => '--labelFontSize',
						'value'    => 'labelFontSize',
					),
					array(
						'property' => '--submitFontSize',
						'value'    => 'submitFontSize',
					),
					array(
						'property' => '--messageFontSize',
						'value'    => 'messageFontSize',
					),
					array(
						'property' => '--inputFontSize',
						'value'    => 'inputFontSize',
					),
					array(
						'property' => '--helpFontSize',
						'value'    => 'helpFontSize',
					),
					array(
						'property' => '--inputColor',
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
