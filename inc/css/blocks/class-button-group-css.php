<?php
/**
 * Css handling logic for group.
 *
 * @package ThemeIsle\GutenbergBlocks\CSS\Blocks
 */

namespace ThemeIsle\GutenbergBlocks\CSS\Blocks;

use ThemeIsle\GutenbergBlocks\Base_CSS;

use ThemeIsle\GutenbergBlocks\CSS\CSS_Utility;

/**
 * Class Button_Group_CSS
 */
class Button_Group_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'button-group';

	/**
	 * Generate Button Group CSS
	 *
	 * @param mixed $block Block data.
	 * @return string
	 * @since   1.3.0
	 * @access  public
	 */
	public function render_css( $block ) {
		if ( isset( $block['attrs']['id'] ) ) {
			$this->get_google_fonts( $block['attrs'] );
		}

		$css = new CSS_Utility( $block );

		$css->add_item(
			array(
				'properties' => array(
					array(
						'property' => '--spacing',
						'value'    => 'spacing',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
						'hasSync'  => 'gr-btn-spacing',
					),
					array(
						'property' => '--font-size',
						'value'    => 'fontSize',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
						'hasSync'  => 'gr-btn-font-size',
					),
					array(
						'property' => '--padding-tablet',
						'value'    => 'paddingTablet',
						'format'   => function( $value, $attrs ) {
							return CSS_Utility::box_values(
								$value,
								array(
									'left'   => '30px',
									'right'  => '30px',
									'top'    => '15px',
									'bottom' => '15px',
								)
							);
						},
						'hasSync'  => 'gr-btn-padding-tablet',
					),
					array(
						'property' => '--padding-mobile',
						'value'    => 'paddingMobile',
						'format'   => function( $value, $attrs ) {
							return CSS_Utility::box_values(
								$value,
								array(
									'left'   => '30px',
									'right'  => '30px',
									'top'    => '15px',
									'bottom' => '15px',
								)
							);
						},
						'hasSync'  => 'gr-btn-padding-mobile',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-button .wp-block-button__link',
				'properties' => array(
					array(
						'property' => 'padding-top',
						'value'    => 'paddingTopBottom',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
						'hasSync'  => 'gr-btn-padding-vertical',
					),
					array(
						'property' => 'padding-bottom',
						'value'    => 'paddingTopBottom',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
						'hasSync'  => 'gr-btn-padding-vertical',
					),
					array(
						'property' => 'padding-left',
						'value'    => 'paddingLeftRight',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
						'hasSync'  => 'gr-btn-padding-horizontal',
					),
					array(
						'property' => 'padding-right',
						'value'    => 'paddingLeftRight',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
						'hasSync'  => 'gr-btn-padding-horizontal',
					),
					array(
						'property' => 'font-family',
						'value'    => 'fontFamily',
						'hasSync'  => 'gr-btn-font-family',
					),
					array(
						'property' => 'font-weight',
						'value'    => 'fontVariant',
						'format'   => function( $value, $attrs ) {
							return 'regular' === $value ? 'normal' : $value;
						},
						'hasSync'  => 'gr-btn-font-variant',
					),
					array(
						'property' => 'text-transform',
						'value'    => 'textTransform',
						'hasSync'  => 'gr-btn-font-transform',
					),
					array(
						'property' => 'font-style',
						'value'    => 'fontStyle',
						'default'  => 'normal',
						'hasSync'  => 'gr-btn-font-style',
					),
					array(
						'property' => 'line-height',
						'value'    => 'lineHeight',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
						'hasSync'  => 'gr-btn-font-height',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-button .wp-block-button__link svg',
				'properties' => array(
					array(
						'property' => 'width',
						'value'    => 'fontSize',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
						'hasSync'  => 'gr-btn-font-size',
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}

	/**
	 * Generate Button Group Global CSS
	 * 
	 * @return string
	 * @since 2.2.3
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
				'selector'   => ' .wp-block-themeisle-blocks-button-group',
				'properties' => array(
					array(
						'property' => '--gr-btn-spacing',
						'value'    => 'spacing',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
					),
					array(
						'property' => '--gr-btn-font-size',
						'value'    => 'fontSize',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
					),
					array(
						'property' => '--gr-btn-padding-tablet',
						'value'    => 'paddingTablet',
						'format'   => function( $value, $attrs ) {
							return CSS_Utility::box_values(
								$value,
								array(
									'left'   => '30px',
									'right'  => '30px',
									'top'    => '15px',
									'bottom' => '15px',
								)
							);
						},
					),
					array(
						'property' => '--gr-btn-padding-mobile',
						'value'    => 'paddingMobile',
						'format'   => function( $value, $attrs ) {
							return CSS_Utility::box_values(
								$value,
								array(
									'left'   => '30px',
									'right'  => '30px',
									'top'    => '15px',
									'bottom' => '15px',
								)
							);
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-button .wp-block-button__link',
				'properties' => array(
					array(
						'property' => '--gr-btn-padding-vertical',
						'value'    => 'paddingTopBottom',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
					),
					array(
						'property' => '--gr-btn-padding-horizontal',
						'value'    => 'paddingLeftRight',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
					),
					array(
						'property' => '--gr-btn-font-family',
						'value'    => 'fontFamily',
					),
					array(
						'property' => '--gr-btn-font-variant',
						'value'    => 'fontVariant',
						'format'   => function( $value, $attrs ) {
							return 'regular' === $value ? 'normal' : $value;
						},
					),
					array(
						'property' => '--gr-btn-font-transform',
						'value'    => 'textTransform',
					),
					array(
						'property' => '--gr-btn-font-style',
						'value'    => 'fontStyle',
						'default'  => 'normal',
					),
					array(
						'property' => '--gr-btn-font-height',
						'value'    => 'lineHeight',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
