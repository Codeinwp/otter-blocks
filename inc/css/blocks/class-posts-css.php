<?php
/**
 * Css handling logic for group.
 *
 * @package ThemeIsle\GutenbergBlocks\CSS\Blocks
 */

namespace ThemeIsle\GutenbergBlocks\CSS\Blocks;

use ThemeIsle\GutenbergBlocks\Base_CSS;

use ThemeIsle\GutenbergBlocks\CSS\CSS_Utility;

/**
 * Class Button_CSS
 */
class Posts_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'posts-grid';

	/**
	 * Generate Button CSS
	 *
	 * @param mixed $block Block data.
	 * @return string
	 * @since   1.3.0
	 * @access  public
	 */
	public function render_css( $block ) {
		$css = new CSS_Utility( $block );

		$vertical_value_mapping = array(
			'top'    => 'flex-start',
			'center' => 'center',
			'bottom' => 'flex-end',
		);

		$css->add_item(
			array(
				'properties' => array(
					array(
						'property' => '--text-align',
						'value'    => 'textAlign',
					),
					array(
						'property' => '--vert-align',
						'value'    => 'verticalAlign',
						'format'   => function( $value, $attrs ) use ( $vertical_value_mapping ) {
							return $vertical_value_mapping[ $value ];
						},
					),
					array(
						'property' => '--img-width',
						'value'    => 'imageWidth',
						'unit'     => 'px',
					),
					array(
						'property' => '--img-border-radius',
						'value'    => 'borderRadius',
						'unit'     => 'px',
					),
				),
			)
		);

		$css->add_item(
			array(
				'query'      => '@media ( min-width: 960px )',
				'properties' => array(
					array(
						'property' => '--title-text-size',
						'value'    => 'customTitleFontSize',
						'unit'     => 'px',
					),
					array(
						'property' => '--description-text-size',
						'value'    => 'customDescriptionFontSize',
						'unit'     => 'px',
					),
				),
			)
		);

		$css->add_item(
			array(
				'query'      => '@media ( min-width: 600px ) and ( max-width: 960px )',
				'properties' => array(
					array(
						'property' => '--title-text-size',
						'value'    => 'customTitleFontSizeTablet',
						'unit'     => 'px',
					),
					array(
						'property' => '--description-text-size',
						'value'    => 'customDescriptionFontSizeTablet',
						'unit'     => 'px',
					),
				),
			)
		);

		$css->add_item(
			array(
				'query'      => '@media ( max-width: 600px )',
				'properties' => array(
					array(
						'property' => '--title-text-size',
						'value'    => 'customTitleFontSizeMobile',
						'unit'     => 'px',
					),
					array(
						'property' => '--description-text-size',
						'value'    => 'customDescriptionFontSizeMobile',
						'unit'     => 'px',
					),
				),
			)
		);


		$style = $css->generate();

		return $style;
	}
}
