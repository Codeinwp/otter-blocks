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
 * Class Circular_Counter_CSS
 */
class Circle_Counter_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'circle-counter';

	/**
	 * Generate degree from percentage.
	 *
	 * @param int $percentage Percentage.
	 * @return int
	 * @since   1.6.5
	 * @access  public
	 */
	public function degree( $percentage ) {
		$angle = ( intval( $percentage ) / 100 ) * 360;
		return $angle;
	}

	/**
	 * Generate Circle Counter CSS
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
				'selector'   => ' .wp-block-themeisle-blocks-circle-counter-title__area .wp-block-themeisle-blocks-circle-counter-title__value',
				'properties' => array(
					array(
						'property' => 'color',
						'value'    => 'titleColor',
					),
					array(
						'property' => 'font-size',
						'value'    => 'fontSizeTitle',
						'unit'     => 'px',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => 'html[amp] [id] .wp-block-themeisle-blocks-circle-counter__bar .wp-block-themeisle-blocks-circle-counter-container',
				'properties' => array(
					array(
						'property' => 'width',
						'value'    => 'height',
						'unit'     => 'px',
					),
					array(
						'property' => 'height',
						'value'    => 'height',
						'unit'     => 'px',
					),
					array(
						'property' => 'line-height',
						'value'    => 'height',
						'unit'     => 'px',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => 'html[amp] [id] .wp-block-themeisle-blocks-circle-counter__bar .wp-block-themeisle-blocks-circle-counter-text',
				'properties' => array(
					array(
						'property' => 'color',
						'value'    => 'progressColor',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => 'html[amp] [id] .wp-block-themeisle-blocks-circle-counter__bar .wp-block-themeisle-blocks-circle-counter-overlay',
				'properties' => array(
					array(
						'property' => 'border-color',
						'value'    => 'backgroundColor',
						'format'   => function( $value, $attrs ) {
							$percentage = isset( $attrs['percentage'] ) ? $attrs['percentage'] : 50;

							if ( 50 > $percentage ) {
								return isset( $attrs['progressColor'] ) ? $attrs['progressColor'] : '#3878ff';
							}

							return $value;
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => 'html[amp] [id] .wp-block-themeisle-blocks-circle-counter__bar .wp-block-themeisle-blocks-circle-counter-status',
				'properties' => array(
					array(
						'property'       => 'border-radius',
						'pattern'        => 'radius 0 0 radius',
						'pattern_values' => array(
							'radius' => array(
								'value'   => 'height',
								'unit'    => 'px',
								'default' => 50,
							),
						),
					),
					array(
						'property' => 'border-color',
						'value'    => 'progressColor',
						'format'   => function( $value, $attrs ) {
							$percentage = isset( $attrs['percentage'] ) ? $attrs['percentage'] : 50;

							if ( 50 > $percentage ) {
								return isset( $attrs['backgroundColor'] ) ? $attrs['backgroundColor'] : '#4682b426';
							}

							return $value;
						},
					),
					array(
						'property' => 'transform',
						'value'    => 'percentage',
						'default'  => 50,
						'format'   => function( $value, $attrs ) {
							if ( 50 > $value ) {
								return 'rotate( ' . ( $this->degree( $value ) + 180 ) . 'deg )';
							}

							return 'rotate( 180deg )';
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => 'html[amp] [id] .wp-block-themeisle-blocks-circle-counter__bar .wp-block-themeisle-blocks-circle-counter-status:last-of-type',
				'properties' => array(
					array(
						'property' => 'transform',
						'value'    => 'percentage',
						'default'  => 50,
						'format'   => function( $value, $attrs ) {
							if ( 50 > $value ) {
								return 'rotate( 360deg )';
							}

							return 'rotate( ' . $this->degree( $value ) . 'deg )';
						},
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
