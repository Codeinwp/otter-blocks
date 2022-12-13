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
 * Class Icon_List_CSS
 */
class Icon_List_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'icon-list';

	/**
	 * Generate Icon List CSS
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
						'property' => '--icon-align',
						'value'    => 'horizontalAlign',
					),
					array(
						'property' => '--icon-align-tablet',
						'value'    => 'alignmentTablet',
					),
					array(
						'property' => '--icon-align-mobile',
						'value'    => 'alignmentMobile',
					),
					array(
						'property'  => '--gap',
						'value'     => 'gap',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['gap'] ) && is_numeric( $attrs['gap'] );
						},
					),
					array(
						'property'  => '--gap',
						'value'     => 'gap',
						'condition' => function( $attrs ) {
							return isset( $attrs['gap'] ) && is_string( $attrs['gap'] );
						},
					),
					array(
						'property' => '--gap-icon-label',
						'value'    => 'gapIconLabel',
					),
					array(
						'property' => '--content-color',
						'value'    => 'defaultContentColor',
					),
					array(
						'property' => '--icon-color',
						'value'    => 'defaultIconColor',
					),
					array(
						'property'  => '--font-size',
						'value'     => 'defaultSize',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['defaultSize'] ) && is_numeric( $attrs['defaultSize'] );
						},
					),
					array(
						'property'  => '--font-size',
						'value'     => 'defaultSize',
						'condition' => function( $attrs ) {
							return isset( $attrs['defaultSize'] ) && is_string( $attrs['defaultSize'] );
						},
					),
					array(
						'property' => '--icon-size',
						'value'    => 'defaultIconSize',
					),
					array(
						'property' => '--label-visibility',
						'value'    => 'hideLabels',
						'format'   => function( $value ) {
							return $value ? 'none' : '';
						},
					),
					array(
						'property' => '--divider-width',
						'value'    => 'dividerWidth',
					),
					array(
						'property' => '--divider-color',
						'value'    => 'dividerColor',
					),
					array(
						'property' => '--divider-length',
						'value'    => 'dividerLength',
					),
					array(
						'property' => '--divider-margin-left',
						'value'    => 'horizontalAlign',
						'format'   => function( $value ) {
							return 'auto';
						},
					),
					array(
						'property' => '--divider-margin-left-tablet',
						'value'    => 'alignmentTablet',
						'format'   => function( $value ) {
							return 'auto';
						},
					),
					array(
						'property' => '--divider-margin-left-mobile',
						'value'    => 'alignmentMobile',
						'format'   => function( $value ) {
							return 'auto';
						},
					),
					array(
						'property'  => '--divider-margin-right',
						'value'     => 'horizontalAlign',
						'condition' => function( $attrs ) {
							return isset( $attrs['horizontalAlign'] ) && 'flex-end' === $attrs['horizontalAlign'];
						},
						'format'    => function( $value ) {
							return '0';
						},
					),
					array(
						'property'  => '--divider-margin-right-tablet',
						'value'     => 'alignmentTablet',
						'condition' => function( $attrs ) {
							return isset( $attrs['alignmentTablet'] ) && 'flex-end' === $attrs['alignmentTablet'];
						},
						'format'    => function( $value ) {
							return '0';
						},
					),
					array(
						'property'  => '--divider-margin-right-mobile',
						'value'     => 'alignmentMobile',
						'condition' => function( $attrs ) {
							return isset( $attrs['alignmentMobile'] ) && 'flex-end' === $attrs['alignmentMobile'];
						},
						'format'    => function( $value ) {
							return '0';
						},
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
