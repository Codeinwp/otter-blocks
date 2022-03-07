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
						'property' => '--textAlign',
						'value'    => 'textAlign',
					),
					array(
						'property' => '--vertAlign',
						'value'    => 'verticalAlign',
						'format'   => function( $value, $attrs ) use ( $vertical_value_mapping ) {
							return $vertical_value_mapping[ $value ];
						},
					),
					array(
						'property' => '--imgWidth',
						'value'    => 'imageWidth',
						'unit'     => 'px',
					),
					array(
						'property' => '--imgBorderRadius',
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
						'property' => '--titleTextSize',
						'value'    => 'customTitleFontSize',
						'unit'     => 'px',
					),
					array(
						'property' => '--descriptionTextSize',
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
						'property' => '--titleTextSize',
						'value'    => 'customTitleFontSizeTablet',
						'unit'     => 'px',
					),
					array(
						'property' => '--descriptionTextSize',
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
						'property' => '--titleTextSize',
						'value'    => 'customTitleFontSizeMobile',
						'unit'     => 'px',
					),
					array(
						'property' => '--descriptionTextSize',
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
