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
 * Class Font_Awesome_Icons_CSS
 */
class Font_Awesome_Icons_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'font-awesome-icons';

	/**
	 * Generate Font Awesome Icons CSS
	 *
	 * @param mixed $block Block data.
	 * @return string
	 * @since   1.3.0
	 * @access  public
	 */
	public function render_css( $block ) {
		$css = new CSS_Utility( $block );

		$align_map = array(
			'left'   => 'flex-start',
			'center' => 'center',
			'right'  => 'flex-end',
		);

		$css->add_item(
			array(
				'properties' => array(
					array(
						'property'  => '--align',
						'value'     => 'align',
						'condition' => function( $attrs ) {
							return isset( $attrs['align'] ) && is_string( $attrs['align'] );
						},
						'format'    => function( $value, $attrs ) use ( $align_map ) {
							return $align_map[ $value ];
						},
					),
					array(
						'property'  => '--align',
						'value'     => 'align',
						'condition' => function( $attrs ) {
							return isset( $attrs['align'] ) && isset( $attrs['align']['desktop'] );
						},
						'format'    => function( $value, $attrs ) {
							return $value['desktop'];
						},
					),
					array(
						'property'  => '--align-tablet',
						'value'     => 'align',
						'condition' => function( $attrs ) {
							return isset( $attrs['align'] ) && isset( $attrs['align']['tablet'] );
						},
						'format'    => function( $value, $attrs ) {
							return $value['tablet'];
						},
					),
					array(
						'property'  => '--align-mobile',
						'value'     => 'align',
						'condition' => function( $attrs ) {
							return isset( $attrs['align'] ) && isset( $attrs['align']['mobile'] );
						},
						'format'    => function( $value, $attrs ) {
							return $value['mobile'];
						},
					),
					array(
						'property' => '--border-color',
						'value'    => 'borderColor',
					),
					array(
						'property' => '--border-size',
						'value'    => 'borderSize',
						'unit'     => 'px',
					),
					array(
						'property' => '--border-radius',
						'value'    => 'borderRadius',
						'unit'     => '%',
					),
					array(
						'property' => '--margin',
						'value'    => 'margin',
						'format'   => function( $value ) {
							if ( is_numeric( $value ) ) {
								return $value . 'px';
							}

							return CSS_Utility::box_values(
								$value,
								array(
									'top'    => '5px',
									'right'  => '5px',
									'bottom' => '5px',
									'left'   => '5px',
								)
							);
						},
						'hasSync'  => 'icon-margin',
					),
					array(
						'property' => '--padding',
						'value'    => 'padding',
						'format'   => function( $value ) {
							if ( is_numeric( $value ) ) {
								return $value . 'px';
							}

							return CSS_Utility::box_values(
								$value,
								array(
									'top'    => '5px',
									'right'  => '5px',
									'bottom' => '5px',
									'left'   => '5px',
								)
							);
						},
						'hasSync'  => 'icon-padding',
					),
					array(
						'property' => '--font-size',
						'value'    => 'fontSize',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
						'hasSync'  => 'icon-font-size',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-font-awesome-icons-container',
				'properties' => array(
					array(
						'property' => 'color',
						'value'    => 'textColor',
						'hasSync'  => 'icon-text-color',
					),
					array(
						'property' => 'background',
						'value'    => 'backgroundColor',
						'hasSync'  => 'icon-background-color',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-font-awesome-icons-container:hover',
				'properties' => array(
					array(
						'property'  => 'color',
						'value'     => 'textColorHover',
						'condition' => function( $attrs ) {
							return ! ( isset( $attrs['library'] ) && 'themeisle-icons' === $this->get_attr_value( $attrs['library'], 'fontawesome' ) );
						},
						'hasSync'   => 'icon-text-color-hover',
					),
					array(
						'property' => 'background',
						'value'    => 'backgroundColorHover',
						'hasSync'  => 'icon-background-color-hover',
					),
					array(
						'property' => 'border-color',
						'value'    => 'borderColorHover',
						'hasSync'  => 'iconBorderColorHover',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-font-awesome-icons-container a',
				'properties' => array(
					array(
						'property'  => 'color',
						'value'     => 'textColor',
						'condition' => function( $attrs ) {
							return ! ( isset( $attrs['library'] ) && 'themeisle-icons' === $this->get_attr_value( $attrs['library'], 'fontawesome' ) );
						},
						'hasSync'   => 'icon-text-color',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-font-awesome-icons-container svg',
				'properties' => array(
					array(
						'property'  => 'fill',
						'value'     => 'textColor',
						'condition' => function( $attrs ) {
							return isset( $attrs['library'] ) && 'themeisle-icons' === $this->get_attr_value( $attrs['library'], 'fontawesome' );
						},
						'hasSync'   => 'icon-text-color',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-font-awesome-icons-container:hover svg',
				'properties' => array(
					array(
						'property'  => 'fill',
						'value'     => 'textColorHover',
						'condition' => function( $attrs ) {
							return isset( $attrs['library'] ) && 'themeisle-icons' === $this->get_attr_value( $attrs['library'], 'fontawesome' );
						},
						'hasSync'   => 'icon-text-color-hover',
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}

	/**
	 * Generate Accordion Global CSS
	 *
	 * @return string
	 * @since   2.0.0
	 * @access  public
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
				'selector'   => '.wp-block-themeisle-blocks-font-awesome-icons',
				'properties' => array(
					array(
						'property' => '--icon-font-size',
						'value'    => 'fontSize',
						'format'   => function( $value, $attrs ) {
							return is_numeric( $value ) ? $value . 'px' : $value;
						},
					),
					array(
						'property' => '--icon-margin',
						'value'    => 'margin',
						'unit'     => 'px',
					),
					array(
						'property' => '--icon-padding',
						'value'    => 'padding',
						'unit'     => 'px',
					),
					array(
						'property' => '--icon-text-color-hover',
						'value'    => 'textColorHover',
					),
					array(
						'property' => '--icon-background-color-hover',
						'value'    => 'backgroundColorHover',
					),
					array(
						'property' => '--icon-text-color',
						'value'    => 'textColor',
					),
					array(
						'property' => '--icon-background-color',
						'value'    => 'backgroundColor',
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
