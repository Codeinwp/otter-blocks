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
						'property'  => '--border-width',
						'value'     => 'inputBorderWidth',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['inputBorderWidth'] ) && is_numeric( $attrs['inputBorderWidth'] );
						},
					),
					array(
						'property'  => '--border-width',
						'value'     => 'inputBorderWidth',
						'format'    => function( $value, $attrs ) {
							return CSS_Utility::box_values(
								$value,
								array(
									'left'   => '8px',
									'right'  => '8px',
									'top'    => '8px',
									'bottom' => '8px',
								)
							);
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['inputBorderWidth'] ) && is_array( $attrs['inputBorderWidth'] );
						},
					),
					array(
						'property'  => '--padding',
						'value'     => 'inputPadding',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['inputPadding'] ) && is_numeric( $attrs['inputPadding'] );
						},
					),
					array(
						'property'  => '--padding',
						'value'     => 'inputPadding',
						'format'    => function( $value, $attrs ) {
							return CSS_Utility::box_values(
								$value,
								array(
									'left'   => '8px',
									'right'  => '8px',
									'top'    => '8px',
									'bottom' => '8px',
								)
							);
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['inputPadding'] ) && is_array( $attrs['inputPadding'] );
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
					array(
						'property' => '--input-bg-color',
						'value'    => 'inputBackgroundColor',
					),
					array(
						'property' => '--required-color',
						'value'    => 'inputRequiredColor',
					),
					array(
						'property' => '--padding-tablet',
						'value'    => 'paddingTablet',
						'format'   => function( $value, $attrs ) {
							return CSS_Utility::box_values(
								$value,
								array(
									'left'   => '8px',
									'right'  => '8px',
									'top'    => '8px',
									'bottom' => '8px',
								)
							);
						},
					),
					array(
						'property' => '--padding-mobile',
						'value'    => 'paddingMobile',
						'format'   => function( $value, $attrs ) {
							return CSS_Utility::box_values(
								$value,
								array(
									'left'   => '8px',
									'right'  => '8px',
									'top'    => '8px',
									'bottom' => '8px',
								)
							);
						},
					),
					array(
						'property' => '--btn-pad',
						'value'    => 'buttonPadding',
						'format'   => function( $value, $attrs ) {
							return CSS_Utility::box_values(
								$value,
								array(
									'left'   => '20px',
									'right'  => '20px',
									'top'    => '10px',
									'bottom' => '10px',
								)
							);
						},
					),
					array(
						'property' => '--btn-pad-tablet',
						'value'    => 'buttonPaddingTablet',
						'format'   => function( $value, $attrs ) {
							return CSS_Utility::box_values(
								$value,
								array(
									'left'   => '20px',
									'right'  => '20px',
									'top'    => '10px',
									'bottom' => '10px',
								)
							);
						},
					),
					array(
						'property' => '--btn-pad-mobile',
						'value'    => 'buttonPaddingMobile',
						'format'   => function( $value, $attrs ) {
							return CSS_Utility::box_values(
								$value,
								array(
									'left'   => '20px',
									'right'  => '20px',
									'top'    => '10px',
									'bottom' => '10px',
								)
							);
						},
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
