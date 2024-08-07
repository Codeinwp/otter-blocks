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
 * Class Timeline_CSS
 */
class Timeline_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'timeline';

	/**
	 * Generate Timeline CSS
	 *
	 * @param mixed $block Block data.
	 * @return string
	 * @since   2.7.0
	 * @access  public
	 */
	public function render_css( $block ) {
		$css = new CSS_Utility( $block );

		$css->add_item(
			array(
				'properties' => array(
					array(
						'property' => '--o-timeline-cnt-bg',
						'value'    => 'containerBackgroundColor',
					),
					array(
						'property' => '--o-timeline-cnt-br-c',
						'value'    => 'containerBorderColor',
					),
					array(
						'property' => '--o-timeline-i-font-size',
						'value'    => 'iconSize',
					),
					array(
						'property' => '--o-timeline-i-color',
						'value'    => 'iconColor',
					),
					array(
						'property' => '--o-timeline-v-color',
						'value'    => 'verticalLineColor',
					),
					array(
						'property' => '--o-timeline-v-width',
						'value'    => 'verticalLineWidth',
					),
					array(
						'property' => '--o-timeline-cnt-br-w',
						'value'    => 'containerBorder',
						'format'   => function( $value, $attrs ) {
							return CSS_Utility::box_values(
								$value,
								array(
									'left'   => '8px',
									'right'  => '8px',
									'top'    => '8px',
									'bottom' => '8px',
								)
							);
						},
					),
					array(
						'property' => '--o-timeline-cnt-br-r',
						'value'    => 'containerRadius',
						'format'   => function( $value, $attrs ) {
							return CSS_Utility::box_values(
								$value,
								array(
									'left'   => '8px',
									'right'  => '8px',
									'top'    => '8px',
									'bottom' => '8px',
								)
							);
						},
					),
					array(
						'property' => '--o-timeline-cnt-pd',
						'value'    => 'containerPadding',
						'format'   => function( $value, $attrs ) {
							return CSS_Utility::box_values(
								$value,
								array(
									'left'   => '20px',
									'right'  => '20px',
									'top'    => '20px',
									'bottom' => '20px',
								)
							);
						},
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
