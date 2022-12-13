<?php
/**
 * Css handling logic for heading.
 *
 * @package ThemeIsle\GutenbergBlocks\CSS\Blocks
 */

namespace ThemeIsle\GutenbergBlocks\CSS\Blocks;

use ThemeIsle\GutenbergBlocks\Base_CSS;

use ThemeIsle\GutenbergBlocks\CSS\CSS_Utility;

/**
 * Class Advanced_Heading_CSS
 */
class Advanced_Heading_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'advanced-heading';

	/**
	 * Generate Advanced Heading CSS
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
						'property' => 'color',
						'value'    => 'headingColor',
					),
					array(
						'property' => 'background',
						'value'    => 'backgroundColor',
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
						'property' => 'font-style',
						'value'    => 'fontStyle',
					),
					array(
						'property' => 'text-transform',
						'value'    => 'textTransform',
					),
					array(
						'property'  => 'line-height',
						'value'     => 'lineHeight',
						'condition' => function( $attrs ) {
							return isset( $attrs['lineHeight'] ) && is_numeric( $attrs['lineHeight'] );
						},
						'format'    => function( $value ) {
							return 3 < $value ? $value . 'px' : $value;
						},
					),
					array(
						'property'  => 'line-height',
						'value'     => 'lineHeight',
						'condition' => function( $attrs ) {
							return isset( $attrs['lineHeight'] ) && is_string( $attrs['lineHeight'] );
						},
					),
					array(
						'property'  => 'letter-spacing',
						'value'     => 'letterSpacing',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['letterSpacing'] ) && is_numeric( $attrs['letterSpacing'] );
						},
					),
					array(
						'property'  => 'letter-spacing',
						'value'     => 'letterSpacing',
						'condition' => function( $attrs ) {
							return isset( $attrs['letterSpacing'] ) && is_string( $attrs['letterSpacing'] );
						},
					),
					array(
						'property'       => 'text-shadow',
						'pattern'        => 'horizontal vertical blur color',
						'pattern_values' => array(
							'horizontal' => array(
								'value'   => 'textShadowHorizontal',
								'unit'    => 'px',
								'default' => 0,
							),
							'vertical'   => array(
								'value'   => 'textShadowVertical',
								'unit'    => 'px',
								'default' => 0,
							),
							'blur'       => array(
								'value'   => 'textShadowBlur',
								'unit'    => 'px',
								'default' => 5,
							),
							'color'      => array(
								'value'   => 'textShadowColor',
								'default' => '#000',
								'format'  => function( $value, $attrs ) {
									$opacity = ( isset( $attrs['textShadowColorOpacity'] ) ? $attrs['textShadowColorOpacity'] : 50 ) / 100;
									return Base_CSS::hex2rgba( $value, $opacity );
								},
							),
						),
						'condition'      => function( $attrs ) {
							return isset( $attrs['textShadow'] );
						},
					),
					array(
						'property'  => 'padding',
						'value'     => 'padding',
						'unit'      => 'px',
						'default'   => 0,
						'condition' => function( $attrs ) {
							return ( isset( $attrs['padding'] ) && ! is_array( $attrs['padding'] ) ) && ! ( isset( $attrs['paddingType'] ) && is_numeric( $attrs['padding'] ) && 'unlinked' === $attrs['paddingType'] );
						},
					),
					array(
						'property'  => 'padding-top',
						'value'     => 'paddingTop',
						'unit'      => 'px',
						'default'   => 0,
						'condition' => function( $attrs ) {
							return ( isset( $attrs['padding'] ) && ! is_array( $attrs['padding'] ) ) && isset( $attrs['paddingType'] ) && 'unlinked' === $attrs['paddingType'];
						},
					),
					array(
						'property'  => 'padding-right',
						'value'     => 'paddingRight',
						'unit'      => 'px',
						'default'   => 0,
						'condition' => function( $attrs ) {
							return ( isset( $attrs['padding'] ) && ! is_array( $attrs['padding'] ) ) && isset( $attrs['paddingType'] ) && 'unlinked' === $attrs['paddingType'];
						},
					),
					array(
						'property'  => 'padding-bottom',
						'value'     => 'paddingBottom',
						'unit'      => 'px',
						'default'   => 0,
						'condition' => function( $attrs ) {
							return ( isset( $attrs['padding'] ) && ! is_array( $attrs['padding'] ) ) && isset( $attrs['paddingType'] ) && 'unlinked' === $attrs['paddingType'];
						},
					),
					array(
						'property'  => 'padding-left',
						'value'     => 'paddingLeft',
						'unit'      => 'px',
						'default'   => 0,
						'condition' => function( $attrs ) {
							return ( isset( $attrs['padding'] ) && ! is_array( $attrs['padding'] ) ) && isset( $attrs['paddingType'] ) && 'unlinked' === $attrs['paddingType'];
						},
					),
					array(
						'property'  => 'margin-top',
						'value'     => 'margin',
						'unit'      => 'px',
						'default'   => 0,
						'condition' => function( $attrs ) {
							return ( isset( $attrs['margin'] ) && ! is_array( $attrs['margin'] ) ) && isset( $attrs['marginType'] ) && 'linked' === $attrs['marginType'];
						},
					),
					array(
						'property'  => 'margin-bottom',
						'value'     => 'margin',
						'unit'      => 'px',
						'default'   => 0,
						'condition' => function( $attrs ) {
							return ( isset( $attrs['margin'] ) && ! is_array( $attrs['margin'] ) ) && isset( $attrs['marginType'] ) && 'linked' === $attrs['marginType'];
						},
					),
					array(
						'property'  => 'margin-top',
						'value'     => 'marginTop',
						'unit'      => 'px',
						'default'   => 0,
						'condition' => function( $attrs ) {
							return ( isset( $attrs['margin'] ) && ! is_array( $attrs['margin'] ) ) && ! ( isset( $attrs['marginType'] ) && 'linked' === $attrs['marginType'] );
						},
					),
					array(
						'property'  => 'margin-bottom',
						'value'     => 'marginBottom',
						'unit'      => 'px',
						'default'   => 20,
						'condition' => function( $attrs ) {
							return ( isset( $attrs['margin'] ) && ! is_array( $attrs['margin'] ) ) && ! ( isset( $attrs['marginType'] ) && 'linked' === $attrs['marginType'] );
						},
					),
				),
			)
		);

		$highlight = array(
			array(
				'property' => 'color',
				'value'    => 'highlightColor',
			),
			array(
				'property' => 'background',
				'value'    => 'highlightBackground',
			),
		);

		$css->add_item(
			array(
				'selector'   => ' mark',
				'properties' => $highlight,
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .highlight',
				'properties' => $highlight,
			)
		);

		$css->add_item(
			array(
				'query'      => '@media ( max-width: 960px )',
				'properties' => array(
					array(
						'property'  => 'padding',
						'value'     => 'paddingTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ( isset( $attrs['paddingTablet'] ) && ! is_array( $attrs['paddingTablet'] ) ) && ! ( isset( $attrs['paddingTypeTablet'] ) && is_numeric( $attrs['paddingTablet'] ) && 'unlinked' === $attrs['paddingTypeTablet'] );
						},
					),
					array(
						'property'  => 'padding-top',
						'value'     => 'paddingTopTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ( isset( $attrs['paddingTablet'] ) && ! is_array( $attrs['paddingTablet'] ) ) && isset( $attrs['paddingTypeTablet'] ) && 'unlinked' === $attrs['paddingTypeTablet'];
						},
					),
					array(
						'property'  => 'padding-right',
						'value'     => 'paddingRightTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ( isset( $attrs['paddingTablet'] ) && ! is_array( $attrs['paddingTablet'] ) ) && isset( $attrs['paddingTypeTablet'] ) && 'unlinked' === $attrs['paddingTypeTablet'];
						},
					),
					array(
						'property'  => 'padding-bottom',
						'value'     => 'paddingBottomTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ( isset( $attrs['paddingTablet'] ) && ! is_array( $attrs['paddingTablet'] ) ) && isset( $attrs['paddingTypeTablet'] ) && 'unlinked' === $attrs['paddingTypeTablet'];
						},
					),
					array(
						'property'  => 'padding-left',
						'value'     => 'paddingLeftTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ( isset( $attrs['paddingTablet'] ) && ! is_array( $attrs['paddingTablet'] ) ) && isset( $attrs['paddingTypeTablet'] ) && 'unlinked' === $attrs['paddingTypeTablet'];
						},
					),
					array(
						'property'  => 'margin-top',
						'value'     => 'marginTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ( isset( $attrs['marginTablet'] ) && ! is_array( $attrs['marginTablet'] ) ) && isset( $attrs['marginTypeTablet'] ) && 'linked' === $attrs['marginTypeTablet'];
						},
					),
					array(
						'property'  => 'margin-bottom',
						'value'     => 'marginTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ( isset( $attrs['marginTablet'] ) && ! is_array( $attrs['marginTablet'] ) ) && isset( $attrs['marginTypeTablet'] ) && 'linked' === $attrs['marginTypeTablet'];
						},
					),
					array(
						'property'  => 'margin-top',
						'value'     => 'marginTopTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ( isset( $attrs['marginTablet'] ) && ! is_array( $attrs['marginTablet'] ) ) && ! ( isset( $attrs['marginTypeTablet'] ) && 'linked' === $attrs['marginTypeTablet'] );
						},
					),
					array(
						'property'  => 'margin-bottom',
						'value'     => 'marginBottomTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ( isset( $attrs['marginTablet'] ) && ! is_array( $attrs['marginTablet'] ) ) && ! ( isset( $attrs['marginTypeTablet'] ) && 'linked' === $attrs['marginTypeTablet'] );
						},
					),
					array(
						'property'  => 'font-size',
						'value'     => 'fontSizeTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['fontSizeTablet'] ) && is_numeric( $attrs['fontSizeTablet'] );
						},
					),
					array(
						'property'  => 'font-size',
						'value'     => 'fontSizeTablet',
						'condition' => function( $attrs ) {
							return isset( $attrs['fontSizeTablet'] ) && is_string( $attrs['fontSizeTablet'] );
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'query'      => '@media ( max-width: 600px )',
				'properties' => array(
					array(
						'property'  => 'padding',
						'value'     => 'paddingMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ( isset( $attrs['paddingMobile'] ) && ! is_array( $attrs['paddingMobile'] ) ) && ! ( isset( $attrs['paddingTypeMobile'] ) && is_numeric( $attrs['paddingMobile'] ) && 'unlinked' === $attrs['paddingTypeMobile'] );
						},
					),
					array(
						'property'  => 'padding-top',
						'value'     => 'paddingTopMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ( isset( $attrs['paddingMobile'] ) && ! is_array( $attrs['paddingMobile'] ) ) && isset( $attrs['paddingTypeMobile'] ) && 'unlinked' === $attrs['paddingTypeMobile'];
						},
					),
					array(
						'property'  => 'padding-right',
						'value'     => 'paddingRightMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ( isset( $attrs['paddingMobile'] ) && ! is_array( $attrs['paddingMobile'] ) ) && isset( $attrs['paddingTypeMobile'] ) && 'unlinked' === $attrs['paddingTypeMobile'];
						},
					),
					array(
						'property'  => 'padding-bottom',
						'value'     => 'paddingBottomMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ( isset( $attrs['paddingMobile'] ) && ! is_array( $attrs['paddingMobile'] ) ) && isset( $attrs['paddingTypeMobile'] ) && 'unlinked' === $attrs['paddingTypeMobile'];
						},
					),
					array(
						'property'  => 'padding-left',
						'value'     => 'paddingLeftMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ( isset( $attrs['paddingMobile'] ) && ! is_array( $attrs['paddingMobile'] ) ) && isset( $attrs['paddingTypeMobile'] ) && 'unlinked' === $attrs['paddingTypeMobile'];
						},
					),
					array(
						'property'  => 'margin-top',
						'value'     => 'marginMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ( isset( $attrs['marginMobile'] ) && ! is_array( $attrs['marginMobile'] ) ) && isset( $attrs['marginTypeMobile'] ) && 'linked' === $attrs['marginTypeMobile'];
						},
					),
					array(
						'property'  => 'margin-bottom',
						'value'     => 'marginMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ( isset( $attrs['marginMobile'] ) && ! is_array( $attrs['marginMobile'] ) ) && isset( $attrs['marginTypeMobile'] ) && 'linked' === $attrs['marginTypeMobile'];
						},
					),
					array(
						'property'  => 'margin-top',
						'value'     => 'marginTopMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ( isset( $attrs['marginMobile'] ) && ! is_array( $attrs['marginMobile'] ) ) && ! ( isset( $attrs['marginTypeMobile'] ) && 'linked' === $attrs['marginTypeMobile'] );
						},
					),
					array(
						'property'  => 'margin-bottom',
						'value'     => 'marginBottomMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ( isset( $attrs['marginMobile'] ) && ! is_array( $attrs['marginMobile'] ) ) && ! ( isset( $attrs['marginTypeMobile'] ) && 'linked' === $attrs['marginTypeMobile'] );
						},
					),
					array(
						'property'  => 'font-size',
						'value'     => 'fontSizeMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['fontSizeMobile'] ) && is_numeric( $attrs['fontSizeMobile'] );
						},
					),
					array(
						'property'  => 'font-size',
						'value'     => 'fontSizeMobile',
						'condition' => function( $attrs ) {
							return isset( $attrs['fontSizeMobile'] ) && is_string( $attrs['fontSizeMobile'] );
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'properties' => array(
					array(
						'property'  => 'font-size',
						'value'     => 'fontSize',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['fontSize'] ) && is_numeric( $attrs['fontSize'] );
						},
					),
					array(
						'property'  => 'font-size',
						'value'     => 'fontSize',
						'condition' => function( $attrs ) {
							return isset( $attrs['fontSize'] ) && is_string( $attrs['fontSize'] );
						},
					),
					array(
						'property' => '--text-align',
						'value'    => 'align',
					),
					array(
						'property' => '--text-align-tablet',
						'value'    => 'alignTablet',
					),
					array(
						'property' => '--text-align-mobile',
						'value'    => 'alignMobile',
					),
					array(
						'property'  => '--padding',
						'value'     => 'padding',
						'condition' => function( $attrs ) {
							return isset( $attrs['padding'] ) && is_array( $attrs['padding'] );
						},
						'format'    => function( $value ) {
							return CSS_Utility::render_box( $value );
						},
					),
					array(
						'property'  => '--padding-tablet',
						'value'     => 'paddingTablet',
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingTablet'] ) && is_array( $attrs['paddingTablet'] );
						},
						'format'    => function( $value ) {
							return CSS_Utility::render_box( $value );
						},
					),
					array(
						'property'  => '--padding-mobile',
						'value'     => 'paddingMobile',
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingTablet'] ) && is_array( $attrs['paddingTablet'] );
						},
						'format'    => function( $value ) {
							return CSS_Utility::render_box( $value );
						},
					),
					array(
						'property'  => '--margin',
						'value'     => 'margin',
						'condition' => function( $attrs ) {
							return isset( $attrs['margin'] ) && is_array( $attrs['margin'] );
						},
						'format'    => function( $value ) {
							return CSS_Utility::render_box( $value );
						},
					),
					array(
						'property'  => '--margin-tablet',
						'value'     => 'marginTablet',
						'condition' => function( $attrs ) {
							return isset( $attrs['marginTablet'] ) && is_array( $attrs['marginTablet'] );
						},
						'format'    => function( $value ) {
							return CSS_Utility::render_box( $value );
						},
					),
					array(
						'property'  => '--margin-mobile',
						'value'     => 'marginMobile',
						'condition' => function( $attrs ) {
							return isset( $attrs['marginMobile'] ) && is_array( $attrs['marginMobile'] );
						},
						'format'    => function( $value ) {
							return CSS_Utility::render_box( $value );
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' a',
				'properties' => array(
					array(
						'property' => 'color',
						'value'    => 'linkColor',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' a:hover',
				'properties' => array(
					array(
						'property' => 'color',
						'value'    => 'linkHoverColor',
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
