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
 * Class Progress_Bar_CSS
 */
class Tabs_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'tabs';

	/**
	 * Generate Progress Bar CSS
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
						'property'  => '--border-width',
						'value'     => 'borderWidth',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['borderWidth'] ) && is_numeric( $attrs['borderWidth'] );
						},
					),
					array(
						'property' => '--font-size',
						'value'    => 'titleFontSize',
					),
					array(
						'property' => '--border-color',
						'value'    => 'borderColor',
						'hasSync'  => 'tabs-border-color',
					),
					array(
						'property' => '--active-title-color',
						'value'    => 'activeTitleColor',
						'hasSync'  => 'tabs-active-title-color',
					),
					array(
						'property' => '--active-title-background',
						'value'    => 'activeTitleBackgroundColor',
						'hasSync'  => 'tabs-active-title-background-color',
					),
					array(
						'property' => '--active-title-border-color',
						'value'    => 'activeBorderColor',
						'hasSync'  => 'tabs-active-border-color',
					),
					array(
						'property' => '--tab-color',
						'value'    => 'tabColor',
						'hasSync'  => 'tabs-tab-color',
					),
					array(
						'property' => '--content-text-color',
						'value'    => 'contentTextColor',
						'hasSync'  => 'tabs-content-text-color',
					),
					array(
						'property' => '--title-color',
						'value'    => 'titleColor',
						'hasSync'  => 'tabs-title-color',
					),
					array(
						'property' => '--title-background',
						'value'    => 'titleBackgroundColor',
						'hasSync'  => 'tabs-background-color',
					),
					array(
						'property' => '--title-border-width',
						'value'    => 'titleBorderWidth',
						'format'   => function( $value, $attrs ) {
							return CSS_Utility::box_values(
								$value,
								array(
									'left'   => '3px',
									'right'  => '3px',
									'top'    => '3px',
									'bottom' => '3px',
								)
							);
						},
						'hasSync'  => 'tabs-title-border-width',
					),
					array(
						'property'  => '--border-width',
						'value'     => 'borderWidth',
						'format'    => function( $value, $attrs ) {
							return CSS_Utility::box_values(
								$value,
								array(
									'left'   => '3px',
									'right'  => '3px',
									'top'    => '3px',
									'bottom' => '3px',
								)
							);
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['borderWidth'] ) && is_array( $attrs['borderWidth'] );
						},
						'hasSync'   => 'tabs-border-width',
					),
					array(
						'property' => '--title-padding',
						'value'    => 'titlePadding',
						'format'   => function( $value, $attrs ) {
							return CSS_Utility::box_values(
								$value,
								array(
									'left'   => '10px',
									'right'  => '10px',
									'top'    => '5px',
									'bottom' => '5px',
								)
							);
						},
						'hasSync'  => 'tabs-title-padding',
					),
					array(
						'property' => '--content-padding',
						'value'    => 'contentPadding',
						'format'   => function( $value, $attrs ) {
							return CSS_Utility::box_values(
								$value,
								array(
									'left'   => '0px',
									'right'  => '0px',
									'top'    => '0px',
									'bottom' => '0px',
								)
							);
						},
						'hasSync'  => 'tabs-content-padding',
					),
					array(
						'property' => '--border-side-width',
						'value'    => 'borderWidth',
						'format'   => function( $value, $attrs ) {

							if ( isset( $attrs['tabsPosition'] ) ) {
								if ( 'left' === $attrs['tabsPosition'] ) {
									if ( isset( $value['left'] ) ) {
										return $value['left'];
									}
								}
							}

							if ( isset( $value['top'] ) ) {
								return $value['top'];
							}

							if ( is_numeric( $value ) ) {
								return $value . 'px';
							}

							return '3px';
						},
						'hasSync'  => 'tabs-border-side-width',
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
	 * @since 2.2.2
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
				'selector'   => '.wp-block-themeisle-blocks-tabs',
				'properties' => array(
					array(
						'property' => '--tabs-border-color',
						'value'    => 'borderColor',
					),
					array(
						'property' => '--tabs-active-title-color',
						'value'    => 'activeTitleColor',
					),
					array(
						'property' => '--tabs-active-title-background-color',
						'value'    => 'tabColor', // Inheritance.
					),
					array(
						'property' => '--tabs-active-title-background-color',
						'value'    => 'activeTitleBackgroundColor',
					),
					array(
						'property' => '--tabs-active-border-color',
						'value'    => 'activeBorderColor',
					),
					array(
						'property' => '--tabs-tab-color',
						'value'    => 'tabColor',
					),
					array(
						'property' => '--tabs-content-text-color',
						'value'    => 'contentTextColor',
					),
					array(
						'property' => '--tabs-title-color',
						'value'    => 'titleColor',

					),
					array(
						'property' => '--tabs-background-color',
						'value'    => 'titleBackgroundColor',
					),
					array(
						'property' => '--tabs-title-border-width',
						'value'    => 'titleBorderWidth',
						'format'   => function( $value, $attrs ) {
							return CSS_Utility::box_values(
								$value,
								array(
									'left'   => '3px',
									'right'  => '3px',
									'top'    => '3px',
									'bottom' => '3px',
								)
							);
						},
					),
					array(
						'property' => '--tabs-border-width',
						'value'    => 'borderWidth',
						'format'   => function( $value, $attrs ) {
							return CSS_Utility::box_values(
								$value,
								array(
									'left'   => '3px',
									'right'  => '3px',
									'top'    => '3px',
									'bottom' => '3px',
								)
							);
						},
					),
					array(
						'property' => '--tabs-title-padding',
						'value'    => 'titlePadding',
						'format'   => function( $value, $attrs ) {
							return CSS_Utility::box_values(
								$value,
								array(
									'left'   => '10px',
									'right'  => '10px',
									'top'    => '5px',
									'bottom' => '5px',
								)
							);
						},
					),
					array(
						'property' => '--tabs-content-padding',
						'value'    => 'contentPadding',
						'format'   => function( $value, $attrs ) {
							return CSS_Utility::box_values(
								$value,
								array(
									'left'   => '0px',
									'right'  => '0px',
									'top'    => '0px',
									'bottom' => '0px',
								)
							);
						},
					),
					array(
						'property' => '--tabs-border-side-width',
						'value'    => 'borderWidth',
						'format'   => function( $value, $attrs ) {

							if ( isset( $attrs['tabsPosition'] ) ) {
								if ( 'left' === $attrs['tabsPosition'] ) {
									if ( isset( $value['left'] ) ) {
										return $value['left'];
									}
								}
							}

							if ( isset( $value['top'] ) ) {
								return $value['top'];
							}

							if ( is_numeric( $value ) ) {
								return $value . 'px';
							}

							return '3px';
						},
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
