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
 * Class Button_Group_CSS
 */
class Button_Group_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'button-group';

	/**
	 * Generate Button Group CSS
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
						'property' => 'gap',
						'value'    => 'spacing',
						'default'  => 20,
						'unit'     => 'px',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-button .wp-block-button__link',
				'properties' => array(
					array(
						'property' => 'padding-top',
						'value'    => 'paddingTopBottom',
						'unit'     => 'px',
					),
					array(
						'property' => 'padding-bottom',
						'value'    => 'paddingTopBottom',
						'unit'     => 'px',
					),
					array(
						'property' => 'padding-left',
						'value'    => 'paddingLeftRight',
						'unit'     => 'px',
					),
					array(
						'property' => 'padding-right',
						'value'    => 'paddingLeftRight',
						'unit'     => 'px',
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
						'property' => 'text-transform',
						'value'    => 'textTransform',
					),
					array(
						'property' => 'font-style',
						'value'    => 'fontStyle',
						'default'  => 'normal',
					),
					array(
						'property' => 'line-height',
						'value'    => 'lineHeight',
						'unit'     => 'px',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-button .wp-block-button__link svg',
				'properties' => array(
					array(
						'property' => 'width',
						'value'    => 'fontSize',
						'unit'     => 'px',
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
