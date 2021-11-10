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
						'property' => 'text-align',
						'value'    => 'align',
						'default'  => 'unset',
					),
					array(
						'property' => 'color',
						'value'    => 'headingColor',
					),
					array(
						'property' => 'font-size',
						'value'    => 'fontSize',
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
						'property' => 'font-style',
						'value'    => 'fontStyle',
					),
					array(
						'property' => 'text-transform',
						'value'    => 'textTransform',
					),
					array(
						'property' => 'line-height',
						'value'    => 'lineHeight',
						'format'   => function( $value, $attrs ) {
							return 3 < $value ? $value . 'px' : $value;
						},
					),
					array(
						'property' => 'letter-spacing',
						'value'    => 'letterSpacing',
						'unit'     => 'px',
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
									return $this->hex2rgba( $value, $opacity );
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
							return ! ( isset( $attrs['paddingType'] ) && 'unlinked' === $attrs['paddingType'] );
						},
					),
					array(
						'property'  => 'padding-top',
						'value'     => 'paddingTop',
						'unit'      => 'px',
						'default'   => 0,
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingType'] ) && 'unlinked' === $attrs['paddingType'];
						},
					),
					array(
						'property'  => 'padding-right',
						'value'     => 'paddingRight',
						'unit'      => 'px',
						'default'   => 0,
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingType'] ) && 'unlinked' === $attrs['paddingType'];
						},
					),
					array(
						'property'  => 'padding-bottom',
						'value'     => 'paddingBottom',
						'unit'      => 'px',
						'default'   => 0,
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingType'] ) && 'unlinked' === $attrs['paddingType'];
						},
					),
					array(
						'property'  => 'padding-left',
						'value'     => 'paddingLeft',
						'unit'      => 'px',
						'default'   => 0,
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingType'] ) && 'unlinked' === $attrs['paddingType'];
						},
					),
					array(
						'property'  => 'margin-top',
						'value'     => 'margin',
						'unit'      => 'px',
						'default'   => 0,
						'condition' => function( $attrs ) {
							return isset( $attrs['marginType'] ) && 'linked' === $attrs['marginType'];
						},
					),
					array(
						'property'  => 'margin-bottom',
						'value'     => 'margin',
						'unit'      => 'px',
						'default'   => 0,
						'condition' => function( $attrs ) {
							return isset( $attrs['marginType'] ) && 'linked' === $attrs['marginType'];
						},
					),
					array(
						'property'  => 'margin-top',
						'value'     => 'marginTop',
						'unit'      => 'px',
						'default'   => 0,
						'condition' => function( $attrs ) {
							return ! ( isset( $attrs['marginType'] ) && 'linked' === $attrs['marginType'] );
						},
					),
					array(
						'property'  => 'margin-bottom',
						'value'     => 'marginBottom',
						'unit'      => 'px',
						'default'   => 20,
						'condition' => function( $attrs ) {
							return ! ( isset( $attrs['marginType'] ) && 'linked' === $attrs['marginType'] );
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
				'query'      => '@media ( min-width: 600px ) and ( max-width: 960px )',
				'properties' => array(
					array(
						'property' => 'text-align',
						'value'    => 'alignTablet',
					),
					array(
						'property' => 'font-size',
						'value'    => 'fontSizeTablet',
						'unit'     => 'px',
					),
					array(
						'property'  => 'padding',
						'value'     => 'paddingTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ! ( isset( $attrs['paddingTypeTablet'] ) && 'unlinked' === $attrs['paddingTypeTablet'] );
						},
					),
					array(
						'property'  => 'padding-top',
						'value'     => 'paddingTopTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingTypeTablet'] ) && 'unlinked' === $attrs['paddingTypeTablet'];
						},
					),
					array(
						'property'  => 'padding-right',
						'value'     => 'paddingRightTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingTypeTablet'] ) && 'unlinked' === $attrs['paddingTypeTablet'];
						},
					),
					array(
						'property'  => 'padding-bottom',
						'value'     => 'paddingBottomTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingTypeTablet'] ) && 'unlinked' === $attrs['paddingTypeTablet'];
						},
					),
					array(
						'property'  => 'padding-left',
						'value'     => 'paddingLeftTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingTypeTablet'] ) && 'unlinked' === $attrs['paddingTypeTablet'];
						},
					),
					array(
						'property'  => 'margin-top',
						'value'     => 'marginTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['marginTypeTablet'] ) && 'linked' === $attrs['marginTypeTablet'];
						},
					),
					array(
						'property'  => 'margin-bottom',
						'value'     => 'marginTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['marginTypeTablet'] ) && 'linked' === $attrs['marginTypeTablet'];
						},
					),
					array(
						'property'  => 'margin-top',
						'value'     => 'marginTopTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ! ( isset( $attrs['marginTypeTablet'] ) && 'linked' === $attrs['marginTypeTablet'] );
						},
					),
					array(
						'property'  => 'margin-bottom',
						'value'     => 'marginBottomTablet',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ! ( isset( $attrs['marginTypeTablet'] ) && 'linked' === $attrs['marginTypeTablet'] );
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
						'property' => 'text-align',
						'value'    => 'alignMobile',
					),
					array(
						'property' => 'font-size',
						'value'    => 'fontSizeMobile',
						'unit'     => 'px',
					),
					array(
						'property'  => 'padding',
						'value'     => 'paddingMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ! ( isset( $attrs['paddingTypeMobile'] ) && 'unlinked' === $attrs['paddingTypeMobile'] );
						},
					),
					array(
						'property'  => 'padding-top',
						'value'     => 'paddingTopMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingTypeMobile'] ) && 'unlinked' === $attrs['paddingTypeMobile'];
						},
					),
					array(
						'property'  => 'padding-right',
						'value'     => 'paddingRightMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingTypeMobile'] ) && 'unlinked' === $attrs['paddingTypeMobile'];
						},
					),
					array(
						'property'  => 'padding-bottom',
						'value'     => 'paddingBottomMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingTypeMobile'] ) && 'unlinked' === $attrs['paddingTypeMobile'];
						},
					),
					array(
						'property'  => 'padding-left',
						'value'     => 'paddingLeftMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['paddingTypeMobile'] ) && 'unlinked' === $attrs['paddingTypeMobile'];
						},
					),
					array(
						'property'  => 'margin-top',
						'value'     => 'marginMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['marginTypeMobile'] ) && 'linked' === $attrs['marginTypeMobile'];
						},
					),
					array(
						'property'  => 'margin-bottom',
						'value'     => 'marginMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['marginTypeMobile'] ) && 'linked' === $attrs['marginTypeMobile'];
						},
					),
					array(
						'property'  => 'margin-top',
						'value'     => 'marginTopMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ! ( isset( $attrs['marginTypeMobile'] ) && 'linked' === $attrs['marginTypeMobile'] );
						},
					),
					array(
						'property'  => 'margin-bottom',
						'value'     => 'marginBottomMobile',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ! ( isset( $attrs['marginTypeMobile'] ) && 'linked' === $attrs['marginTypeMobile'] );
						},
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
