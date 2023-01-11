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
						'hasSync'  => 'form-label-color',
					),
					array(
						'property'  => '--border-radius',
						'value'     => 'inputBorderRadius',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['inputBorderRadius'] ) && is_numeric( $attrs['inputBorderRadius'] );
						},
						'hasSync'   => 'form-border-radius',
					),
					array(
						'property'  => '--border-radius',
						'value'     => 'inputBorderRadius',
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
							return isset( $attrs['inputBorderRadius'] ) && is_array( $attrs['inputBorderRadius'] );
						},
						'hasSync'   => 'form-border-radius',
					),
					array(
						'property' => '--border-color',
						'value'    => 'inputBorderColor',
						'hasSync'  => 'form-border-color',
					),
					array(
						'property'  => '--border-width',
						'value'     => 'inputBorderWidth',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['inputBorderWidth'] ) && is_numeric( $attrs['inputBorderWidth'] );
						},
						'hasSync'   => 'form-border-width',
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
						'hasSync'   => 'form-border-width',
					),
					array(
						'property'  => '--padding',
						'value'     => 'inputPadding',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['inputPadding'] ) && is_numeric( $attrs['inputPadding'] );
						},
						'hasSync'   => 'form-padding',
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
						'hasSync'   => 'form-padding',
					),
					array(
						'property' => '--input-width',
						'value'    => 'inputWidth',
						'unit'     => '%',
						'hasSync'  => 'form-input-width',
					),
					array(
						'property' => '--help-label-color',
						'value'    => 'helpLabelColor',
						'hasSync'  => 'form-label-color',
					),
					array(
						'property' => '--submit-msg-color',
						'value'    => 'submitMessageColor',
						'hasSync'  => 'form-msg-color',
					),
					array(
						'property' => '--submit-error-color',
						'value'    => 'submitMessageErrorColor',
						'hasSync'  => 'form-submit-error-color',
					),
					array(
						'property' => '--inputs-gap',
						'value'    => 'inputsGap',
						'unit'     => 'px',
						'hasSync'  => 'form-inputs-gap',
					),
					array(
						'property' => '--input-gap',
						'value'    => 'inputGap',
						'unit'     => 'px',
						'hasSync'  => 'form-input-gap',
					),
					array(
						'property' => '--label-font-size',
						'value'    => 'labelFontSize',
						'hasSync'  => 'form-label-font-size',
					),
					array(
						'property' => '--submit-font-size',
						'value'    => 'submitFontSize',
						'hasSync'  => 'form-font-size',
					),
					array(
						'property' => '--message-font-size',
						'value'    => 'messageFontSize',
						'hasSync'  => 'form-border-width',
					),
					array(
						'property' => '--input-font-size',
						'value'    => 'inputFontSize',
						'hasSync'  => 'form-input-font-size',
					),
					array(
						'property' => '--help-font-size',
						'value'    => 'helpFontSize',
						'hasSync'  => 'form-help-font-size',
					),
					array(
						'property' => '--input-color',
						'value'    => 'inputColor',
						'hasSync'  => 'form-input-color',
					),
					array(
						'property' => '--input-bg-color',
						'value'    => 'inputBackgroundColor',
						'hasSync'  => 'form-input-bg-color',
					),
					array(
						'property' => '--required-color',
						'value'    => 'inputRequiredColor',
						'hasSync'  => 'form-required-color',
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
						'hasSync'  => 'form-padding-tablet',
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
						'hasSync'  => 'form-padding-mobile',
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
						'hasSync'  => 'form-btn-pad',
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
						'hasSync'  => 'form-btn-tablet',
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
					'hasSync' => 'form-btn-pad-mobile',
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-button .wp-block-button__link:not(:hover)',
				'properties' => array(
					array(
						'property' => 'color',
						'value'    => 'submitColor',
					),
					array(
						'property' => 'background-color',
						'value'    => 'submitBackgroundColor',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-button .wp-block-button__link:hover',
				'properties' => array(
					array(
						'property' => 'color',
						'value'    => 'submitColorHover',
					),
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

	/**
	 * Generate Form Global CSS
	 * 
	 * @return string
	 * @since 2.1.7
	 * @access public
	 */
	public function render_global_css() {
		$defaults = get_option( 'themeisle_blocks_settings_global_defaults' );
		$block    = $this->library_prefix . '/' . $this->block_prefix;

		if ( empty( $defaults ) ) {
			return;
		}

		$defaults = json_decode( $defaults, true );

		if ( ! isset( $defaults[ $block ] ) ) {
			return;
		}

		$block = array(
			'attrs' => $defaults[ $block ],
		);

		$css = new CSS_Utility( $block );

		$css->add_item(
			array(
				'selector'   => '.wp-block-themeisle-blocks-form',
				'properties' => array(
					array(
						'property' => '--form-label-color',
						'value'    => 'labelColor',
					),
					array(
						'property'  => '--form-border-radius',
						'value'     => 'inputBorderRadius',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['inputBorderRadius'] ) && is_numeric( $attrs['inputBorderRadius'] );
						},
					),
					array(
						'property'  => '--form-border-radius',
						'value'     => 'inputBorderRadius',
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
							return isset( $attrs['inputBorderRadius'] ) && is_array( $attrs['inputBorderRadius'] );
						},
					),
					array(
						'property' => '--form-border-color',
						'value'    => 'inputBorderColor',
					),
					array(
						'property'  => '--form-border-width',
						'value'     => 'inputBorderWidth',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['inputBorderWidth'] ) && is_numeric( $attrs['inputBorderWidth'] );
						},
					),
					array(
						'property'  => '--form-border-width',
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
						'property'  => '--form-padding',
						'value'     => 'inputPadding',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['inputPadding'] ) && is_numeric( $attrs['inputPadding'] );
						},
					),
					array(
						'property'  => '--form-padding',
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
						'property' => '--form-input-width',
						'value'    => 'inputWidth',
						'unit'     => '%',
					),
					array(
						'property' => '--form-help-label-color',
						'value'    => 'helpLabelColor',
					),
					array(
						'property' => '--form-submit-msg-color',
						'value'    => 'submitMessageColor',
					),
					array(
						'property' => '--form-submit-error-color',
						'value'    => 'submitMessageErrorColor',
					),
					array(
						'property' => '--form-inputs-gap',
						'value'    => 'inputsGap',
						'unit'     => 'px',
					),
					array(
						'property' => '--form-input-gap',
						'value'    => 'inputGap',
						'unit'     => 'px',
					),
					array(
						'property' => '--form-label-font-size',
						'value'    => 'labelFontSize',
					),
					array(
						'property' => '--form-submit-font-size',
						'value'    => 'submitFontSize',
					),
					array(
						'property' => '--form-message-font-size',
						'value'    => 'messageFontSize',
					),
					array(
						'property' => '--form-input-font-size',
						'value'    => 'inputFontSize',
					),
					array(
						'property' => '--form-help-font-size',
						'value'    => 'helpFontSize',
					),
					array(
						'property' => '--form-input-color',
						'value'    => 'inputColor',
					),
					array(
						'property' => '--form-input-bg-color',
						'value'    => 'inputBackgroundColor',
					),
					array(
						'property' => '--form-required-color',
						'value'    => 'inputRequiredColor',
					),
					array(
						'property' => '--form-padding-tablet',
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
						'property' => '--form-padding-mobile',
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
						'property' => '--form-btn-pad',
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
						'property' => '--form-btn-pad-tablet',
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
						'property' => '--form-btn-pad-mobile',
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
				'selector'   => '.wp-block-themeisle-blocks-form .wp-block-button__link:not(:hover)',
				'properties' => array(
					array(
						'property' => 'color',
						'value'    => 'submitColor',
					),
					array(
						'property' => 'background-color',
						'value'    => 'submitBackgroundColor',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => '.wp-block-themeisle-blocks-form .wp-block-button__link:hover',
				'properties' => array(
					array(
						'property' => 'color',
						'value'    => 'submitColorHover',
					),
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
