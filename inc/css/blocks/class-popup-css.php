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
		$css = new CSS_Utility(
			$block,
			array(
				'tablet' => '@media ( min-width: 600px ) and ( max-width: 960px )',
				'mobile' => '@media ( max-width: 600px )',
			)
		);

		$css->add_item(
			array(
				'properties' => array(
					array(
						'property' => '--min-width',
						'value'    => 'minWidth',
						'unit'     => 'px',
					),
					array(
						'property' => '--max-width',
						'value'    => 'maxWidth',
						'unit'     => 'px',
					),
					array(
						'property' => '--background-color',
						'value'    => 'backgroundColor',
					),
					array(
						'property' => '--close-color',
						'value'    => 'closeColor',
					),
					array(
						'property' => '--overlay-color',
						'value'    => 'overlayColor',
					),
					array(
						'property' => '--overlay-opacity',
						'value'    => 'overlayOpacity',
						'format'   => function( $value ) {
							return $value / 100;
						},
					),
					array(
						'property' => '--brd-width',
						'value'    => 'borderWidth',
						'format'   => function( $value ) {
							return CSS_Utility::box_values( $value );
						},
					),
					array(
						'property' => '--brd-radius',
						'value'    => 'borderRadius',
						'format'   => function( $value ) {
							return CSS_Utility::box_values( $value );
						},
					),
					array(
						'property' => '--brd-color',
						'value'    => 'borderColor',
					),
					array(
						'property' => '--brd-style',
						'value'    => 'borderStyle',
					),
					array(
						'property' => '--width',
						'value'    => 'width',
					),
					array(
						'property' => '--width-tablet',
						'value'    => 'widthTablet',
					),
					array(
						'property' => '--width-mobile',
						'value'    => 'widthMobile',
					),
					array(
						'property'  => '--height',
						'value'     => 'height',
						'condition' => function ( $attrs ) {
							return isset( $attrs['heightMode'] ) && 'custom' === $attrs['heightMode'];
						},
					),
					array(
						'property'  => '--height-tablet',
						'value'     => 'heightTablet',
						'condition' => function ( $attrs ) {
							return isset( $attrs['heightMode'] ) && 'custom' === $attrs['heightMode'];
						},
					),
					array(
						'property'  => '--height-mobile',
						'value'     => 'heightMobile',
						'condition' => function ( $attrs ) {
							return isset( $attrs['heightMode'] ) && 'custom' === $attrs['heightMode'];
						},
					),
					array(
						'property' => '--padding',
						'value'    => 'padding',
						'format'   => function( $value ) {
							return CSS_Utility::box_values( $value );
						},
					),
					array(
						'property' => '--padding-tablet',
						'value'    => 'paddingTablet',
						'format'   => function( $value ) {
							return CSS_Utility::box_values( $value );
						},
					),
					array(
						'property' => '--padding-mobile',
						'value'    => 'paddingMobile',
						'format'   => function( $value ) {
							return CSS_Utility::box_values( $value );
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .otter-popup__modal_content',
				'properties' => array(
					array(
						'property'  => 'top',
						'value'     => 'verticalPosition',
						'condition' => function( $attrs ) {
							return isset( $attrs['verticalPosition'] ) && 'top' === $attrs['verticalPosition'];
						},
						'format'    => function( $value ) {
							return '30px';
						},
					),
					array(
						'property'  => 'bottom',
						'value'     => 'verticalPosition',
						'condition' => function( $attrs ) {
							return isset( $attrs['verticalPosition'] ) && 'bottom' === $attrs['verticalPosition'];
						},
						'format'    => function( $value ) {
							return '30px';
						},
					),
					array(
						'property'  => 'right',
						'value'     => 'horizontalPosition',
						'condition' => function( $attrs ) {
							return isset( $attrs['horizontalPosition'] ) && 'right' === $attrs['horizontalPosition'];
						},
						'format'    => function( $value ) {
							return '30px';
						},
					),
					array(
						'property'  => 'left',
						'value'     => 'horizontalPosition',
						'condition' => function( $attrs ) {
							return isset( $attrs['horizontalPosition'] ) && 'left' === $attrs['horizontalPosition'];
						},
						'format'    => function( $value ) {
							return '30px';
						},
					),
					array(
						'property'  => 'top',
						'value'     => 'verticalPositionTablet',
						'condition' => function( $attrs ) {
							return isset( $attrs['verticalPositionTablet'] ) && 'top' === $attrs['verticalPositionTablet'];
						},
						'format'    => function( $value ) {
							return '15px';
						},
						'media'     => 'tablet',
					),
					array(
						'property'  => 'bottom',
						'value'     => 'verticalPositionTablet',
						'condition' => function( $attrs ) {
							return isset( $attrs['verticalPositionTablet'] ) && 'bottom' === $attrs['verticalPositionTablet'];
						},
						'format'    => function( $value ) {
							return '15px';
						},
						'media'     => 'tablet',
					),
					array(
						'property'  => 'right',
						'value'     => 'horizontalPositionTablet',
						'condition' => function( $attrs ) {
							return isset( $attrs['horizontalPositionTablet'] ) && 'right' === $attrs['horizontalPositionTablet'];
						},
						'format'    => function( $value ) {
							return '15px';
						},
						'media'     => 'tablet',
					),
					array(
						'property'  => 'left',
						'value'     => 'horizontalPositionTablet',
						'condition' => function( $attrs ) {
							return isset( $attrs['horizontalPositionTablet'] ) && 'left' === $attrs['horizontalPositionTablet'];
						},
						'format'    => function( $value ) {
							return '15px';
						},
						'media'     => 'tablet',
					),
					array(
						'property'  => 'top',
						'value'     => 'verticalPositionMobile',
						'condition' => function( $attrs ) {
							return isset( $attrs['verticalPositionMobile'] ) && 'top' === $attrs['verticalPositionMobile'];
						},
						'format'    => function( $value ) {
							return '10px';
						},
						'media'     => 'mobile',
					),
					array(
						'property'  => 'bottom',
						'value'     => 'verticalPositionMobile',
						'condition' => function( $attrs ) {
							return isset( $attrs['verticalPositionMobile'] ) && 'bottom' === $attrs['verticalPositionMobile'];
						},
						'format'    => function( $value ) {
							return '10px';
						},
						'media'     => 'mobile',
					),
					array(
						'property'  => 'right',
						'value'     => 'horizontalPositionMobile',
						'condition' => function( $attrs ) {
							return isset( $attrs['horizontalPositionMobile'] ) && 'right' === $attrs['horizontalPositionMobile'];
						},
						'format'    => function( $value ) {
							return '10px';
						},
						'media'     => 'mobile',
					),
					array(
						'property'  => 'left',
						'value'     => 'horizontalPositionMobile',
						'condition' => function( $attrs ) {
							return isset( $attrs['horizontalPositionMobile'] ) && 'left' === $attrs['horizontalPositionMobile'];
						},
						'format'    => function( $value ) {
							return '10px';
						},
						'media'     => 'mobile',
					),
					array(
						'property'       => '--box-shadow',
						'pattern'        => 'horizontal vertical blur spread color',
						'pattern_values' => array(
							'horizontal' => array(
								'value'   => 'boxShadow',
								'unit'    => 'px',
								'default' => 0,
								'format'  => function( $value ) {
									return $value['horizontal'];
								},
							),
							'vertical'   => array(
								'value'   => 'boxShadow',
								'unit'    => 'px',
								'default' => 0,
								'format'  => function( $value ) {
									return $value['vertical'];
								},
							),
							'blur'       => array(
								'value'   => 'boxShadow',
								'unit'    => 'px',
								'default' => 5,
								'format'  => function( $value ) {
									return $value['blur'];
								},
							),
							'spread'     => array(
								'value'   => 'boxShadow',
								'unit'    => 'px',
								'default' => 1,
								'format'  => function( $value ) {
									return $value['spread'];
								},
							),
							'color'      => array(
								'value'   => 'boxShadow',
								'default' => '#000',
								'format'  => function( $value ) {
									$opacity = $value['colorOpacity'];
									$color   = isset( $value['color'] ) ? $value['color'] : '#000000';
									return ( strpos( $color, '#' ) !== false && $opacity < 100 ) ? Base_CSS::hex2rgba( $color, $opacity / 100 ) : $color;
								},
							),
						),
						'condition'      => function( $attrs ) {
							return isset( $attrs['boxShadow'] ) && true === $attrs['boxShadow']['active'];
						},
					),
				),
			)
		);

		// TODO: Add responsive values when #1259 is merged.
		$style = $css->generate();

		return $style;
	}
}
