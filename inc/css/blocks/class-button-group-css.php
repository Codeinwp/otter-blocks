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
						'property'  => '--spacing',
						'value'     => 'spacing',
						'default'   => 20,
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['spacing'] ) && is_numeric( $attrs['spacing'] );
						},
						'hasSync'   => 'gr-btn-spacing',
					),
					array(
						'property'  => '--spacing',
						'value'     => 'spacing',
						'condition' => function( $attrs ) {
							return isset( $attrs['spacing'] ) && is_string( $attrs['spacing'] );
						},
						'hasSync'   => 'gr-btn-spacing',
					),
					array(
						'property'  => '--font-size',
						'value'     => 'fontSize',
						'default'   => 20,
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['spacing'] ) && is_numeric( $attrs['spacing'] );
						},
						'hasSync'   => 'gr-btn-font-size',
					),
					array(
						'property'  => '--font-size',
						'value'     => 'fontSize',
						'condition' => function( $attrs ) {
							return isset( $attrs['spacing'] ) && is_string( $attrs['spacing'] );
						},
						'hasSync'   => 'gr-btn-font-size',
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
						'unit'     => 'px',
					),
					array(
						'property' => 'padding-bottom',
						'value'    => 'paddingTopBottom',
						'unit'     => 'px',
					),
					array(
						'property' => 'padding-left',
						'value'    => 'paddingLeftRight',
						'unit'     => 'px',
					),
					array(
						'property' => 'padding-right',
						'value'    => 'paddingLeftRight',
						'unit'     => 'px',
					),
					array(
						'property' => 'font-family',
						'value'    => 'fontFamily',
					),
					array(
						'property' => 'font-weight',
						'value'    => 'fontVariant',
						'format'   => function( $value, $attrs ) {
							return 'regular' === $value ? 'normal' : $value;
						},
					),
					array(
						'property' => 'text-transform',
						'value'    => 'textTransform',
					),
					array(
						'property' => 'font-style',
						'value'    => 'fontStyle',
						'default'  => 'normal',
					),
					array(
						'property'  => 'line-height',
						'value'     => 'lineHeight',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['lineHeight'] ) && is_numeric( $attrs['lineHeight'] );
						},
					),
					array(
						'property'  => 'line-height',
						'value'     => 'lineHeight',
						'condition' => function( $attrs ) {
							return isset( $attrs['lineHeight'] ) && is_string( $attrs['lineHeight'] );
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-button .wp-block-button__link svg',
				'properties' => array(
					array(
						'property'  => 'width',
						'value'     => 'fontSize',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['fontSize'] ) && is_numeric( $attrs['fontSize'] );
						},
					),
					array(
						'property'  => 'width',
						'value'     => 'fontSize',
						'condition' => function( $attrs ) {
							return isset( $attrs['fontSize'] ) && is_string( $attrs['fontSize'] );
						},
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
	 * @since 2.2.0
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
						'property'  => '--gr-btn-spacing',
						'value'     => 'spacing',
						'default'   => 20,
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['spacing'] ) && is_numeric( $attrs['spacing'] );
						},
					),
					array(
						'property'  => '--gr-btn-spacing',
						'value'     => 'spacing',
						'condition' => function( $attrs ) {
							return isset( $attrs['spacing'] ) && is_string( $attrs['spacing'] );
						},
					),
					array(
						'property'  => '--gr-btn-font-size',
						'value'     => 'fontSize',
						'default'   => 20,
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['spacing'] ) && is_numeric( $attrs['spacing'] );
						},
					),
					array(
						'property'  => '--gr-btn-font-size',
						'value'     => 'fontSize',
						'condition' => function( $attrs ) {
							return isset( $attrs['spacing'] ) && is_string( $attrs['spacing'] );
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
						'property' => 'padding-top',
						'value'    => 'paddingTopBottom',
						'unit'     => 'px',
					),
					array(
						'property' => 'padding-bottom',
						'value'    => 'paddingTopBottom',
						'unit'     => 'px',
					),
					array(
						'property' => 'padding-left',
						'value'    => 'paddingLeftRight',
						'unit'     => 'px',
					),
					array(
						'property' => 'padding-right',
						'value'    => 'paddingLeftRight',
						'unit'     => 'px',
					),
					array(
						'property' => 'font-family',
						'value'    => 'fontFamily',
					),
					array(
						'property' => 'font-weight',
						'value'    => 'fontVariant',
						'format'   => function( $value, $attrs ) {
							return 'regular' === $value ? 'normal' : $value;
						},
					),
					array(
						'property' => 'text-transform',
						'value'    => 'textTransform',
					),
					array(
						'property' => 'font-style',
						'value'    => 'fontStyle',
						'default'  => 'normal',
					),
					array(
						'property'  => 'line-height',
						'value'     => 'lineHeight',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['lineHeight'] ) && is_numeric( $attrs['lineHeight'] );
						},
					),
					array(
						'property'  => 'line-height',
						'value'     => 'lineHeight',
						'condition' => function( $attrs ) {
							return isset( $attrs['lineHeight'] ) && is_string( $attrs['lineHeight'] );
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-button .wp-block-button__link svg',
				'properties' => array(
					array(
						'property'  => 'width',
						'value'     => 'fontSize',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['fontSize'] ) && is_numeric( $attrs['fontSize'] );
						},
					),
					array(
						'property'  => 'width',
						'value'     => 'fontSize',
						'condition' => function( $attrs ) {
							return isset( $attrs['fontSize'] ) && is_string( $attrs['fontSize'] );
						},
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
