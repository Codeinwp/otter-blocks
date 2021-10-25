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
class Progress_Bar_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'progress-bar';

	/**
	 * Generate Progress Bar CSS
	 *
	 * @param mixed $block Block data.
	 * @return string
	 * @since   1.3.0
	 * @access  public
	 */
	public function render_css( $block ) {
		$ratio = 0.65;

		$css = new CSS_Utility( $block );

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-progress-bar__outer .wp-block-themeisle-blocks-progress-bar__outer__title',
				'properties' => array(
					array(
						'property'  => 'color',
						'value'     => 'titleColor',
						'condition' => function( $attrs ) {
							return isset( $attrs['titleStyle'] ) && 'outer' === $attrs['titleStyle'];
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-progress-bar__outer .wp-block-themeisle-blocks-progress-bar__outer__value',
				'properties' => array(
					array(
						'property'  => 'color',
						'value'     => 'percentageColor',
						'condition' => function( $attrs ) {
							return isset( $attrs['percentagePosition'] ) && 'outer' === $attrs['percentagePosition'];
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-progress-bar__area',
				'properties' => array(
					array(
						'property' => 'background',
						'value'    => 'backgroundColor',
					),
					array(
						'property' => 'border-radius',
						'value'    => 'borderRadius',
						'unit'     => 'px',
					),
					array(
						'property' => 'height',
						'value'    => 'height',
						'unit'     => 'px',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-progress-bar__area .wp-block-themeisle-blocks-progress-bar__area__title',
				'properties' => array(
					array(
						'property' => 'font-size',
						'value'    => 'height',
						'unit'     => 'px',
						'format'   => function( $value ) use ( $ratio ) {
							return $value * $ratio;
						},
					),
					array(
						'property' => 'height',
						'value'    => 'height',
						'unit'     => 'px',
					),
					array(
						'property'       => 'border-radius',
						'pattern'        => 'borderRadius 0 0 borderRadius',
						'pattern_values' => array(
							'borderRadius' => array(
								'value' => 'borderRadius',
								'unit'  => 'px',
							),
						),
						'condition'      => function( $attrs ) {
							return isset( $attrs['borderRadius'] );
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-progress-bar__area .wp-block-themeisle-blocks-progress-bar__area__title.highlight',
				'properties' => array(
					array(
						'property' => 'background',
						'value'    => 'barBackgroundColor',
						'unit'     => 'px',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-progress-bar__area .wp-block-themeisle-blocks-progress-bar__area__title span',
				'properties' => array(
					array(
						'property' => 'height',
						'value'    => 'height',
						'unit'     => 'px',
					),
					array(
						'property'  => 'color',
						'value'     => 'titleColor',
						'condition' => function( $attrs ) {
							if ( ! isset( $attrs['titleStyle'] ) ) {
								return true;
							}

							return isset( $attrs['titleStyle'] ) && 'outer' !== $attrs['titleStyle'];
						},
					),
					array(
						'property'       => 'border-radius',
						'pattern'        => 'borderRadius 0 0 borderRadius',
						'pattern_values' => array(
							'borderRadius' => array(
								'value' => 'borderRadius',
								'unit'  => 'px',
							),
						),
						'condition'      => function( $attrs ) {
							return isset( $attrs['borderRadius'] );
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-progress-bar__area .wp-block-themeisle-blocks-progress-bar__area__bar',
				'properties' => array(
					array(
						'property' => 'background',
						'value'    => 'barBackgroundColor',
					),
					array(
						'property' => 'height',
						'value'    => 'height',
						'unit'     => 'px',
					),
					array(
						'property' => 'border-radius',
						'value'    => 'borderRadius',
						'unit'     => 'px',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-progress-bar__area .wp-block-themeisle-blocks-progress-bar__area__bar .wp-block-themeisle-blocks-progress-bar__area__tooltip',
				'properties' => array(
					array(
						'property'  => 'color',
						'value'     => 'percentageColor',
						'condition' => function( $attrs ) {
							return isset( $attrs['percentagePosition'] ) && 'tooltip' === $attrs['percentagePosition'];
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-progress-bar__area .wp-block-themeisle-blocks-progress-bar__progress',
				'properties' => array(
					array(
						'property'  => 'font-size',
						'value'     => 'height',
						'unit'      => 'px',
						'format'    => function( $value ) use ( $ratio ) {
							return $value * $ratio;
						},
						'condition' => function( $attrs ) {
							return ! isset( $attrs['percentagePosition'] );
						},
					),
					array(
						'property'  => 'color',
						'value'     => 'percentageColor',
						'condition' => function( $attrs ) {
							return ! isset( $attrs['percentagePosition'] );
						},
					),
					array(
						'property'  => 'height',
						'value'     => 'height',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return ! isset( $attrs['percentagePosition'] );
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-progress-bar__area .wp-block-themeisle-blocks-progress-bar__area__bar .wp-block-themeisle-blocks-progress-bar__progress__append',
				'properties' => array(
					array(
						'property'  => 'font-size',
						'value'     => 'height',
						'unit'      => 'px',
						'format'    => function( $value ) use ( $ratio ) {
							return $value * $ratio;
						},
						'condition' => function( $attrs ) {
							return isset( $attrs['percentagePosition'] ) && 'append' === $attrs['percentagePosition'];
						},
					),
					array(
						'property'  => 'color',
						'value'     => 'percentageColor',
						'condition' => function( $attrs ) {
							return isset( $attrs['percentagePosition'] ) && 'append' === $attrs['percentagePosition'];
						},
					),
					array(
						'property'  => 'height',
						'value'     => 'height',
						'unit'      => 'px',
						'condition' => function( $attrs ) {
							return isset( $attrs['percentagePosition'] ) && 'append' === $attrs['percentagePosition'];
						},
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => 'html[amp] [id] .wp-block-themeisle-blocks-progress-bar__area .wp-block-themeisle-blocks-progress-bar__area__bar',
				'properties' => array(
					array(
						'property' => 'width',
						'value'    => 'percentage',
						'unit'     => '%',
						'default'  => 50,
					),
					array(
						'property' => 'opacity',
						'default'  => '1',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => 'html[amp] [id] .wp-block-themeisle-blocks-progress-bar__area .wp-block-themeisle-blocks-progress-bar__area__bar .wp-block-themeisle-blocks-progress-bar__area__tooltip',
				'properties' => array(
					array(
						'property' => 'opacity',
						'default'  => '1',
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
