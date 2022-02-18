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
				'properties' => array(
					array(
						'property' => '--percentage',
						'value'    => 'percentage',
						'unit'     => '%',
					),
					array(
						'property' => '--titleColor',
						'value'    => 'titleColor',
					),
					array(
						'property'  => '--percentageColor',
						'value'     => 'percentageColor',
						'condition' => function( $attrs ) {
							return ! isset( $attrs['percentagePosition'] );
						},
					),
					array(
						'property'  => '--percentageColorOuter',
						'value'     => 'percentageColor',
						'condition' => function( $attrs ) {
							return isset( $attrs['percentagePosition'] ) && 'outer' === $attrs['percentagePosition'];
						},
					),
					array(
						'property'  => '--percentageColorTooltip',
						'value'     => 'percentageColor',
						'condition' => function( $attrs ) {
							return isset( $attrs['percentagePosition'] ) && 'tooltip' === $attrs['percentagePosition'];
						},
					),
					array(
						'property'  => '--percentageColorAppend',
						'value'     => 'percentageColor',
						'condition' => function( $attrs ) {
							return isset( $attrs['percentagePosition'] ) && 'append' === $attrs['percentagePosition'];
						},
					),
					array(
						'property' => '--backgroundColor',
						'value'    => 'backgroundColor',
					),
					array(
						'property' => '--borderRadius',
						'value'    => 'borderRadius',
						'unit'     => 'px',
					),
					array(
						'property' => '--height',
						'value'    => 'height',
						'unit'     => 'px',
					),
					array(
						'property' => '--barBackground',
						'value'    => 'barBackgroundColor',
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
