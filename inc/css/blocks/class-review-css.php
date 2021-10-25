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
 * Class Review_CSS
 */
class Review_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'review';

	/**
	 * Generate Review CSS
	 *
	 * @param mixed $block Block data.
	 * @return string
	 * @since   1.3.0
	 * @access  public
	 */
	public function render_css( $block ) {
		$css = new CSS_Utility( $block );

		$selectors = array(
			' .wp-block-themeisle-blocks-review__header h3',
			' .wp-block-themeisle-blocks-review__header .wp-block-themeisle-blocks-review__header_meta .wp-block-themeisle-blocks-review__header_ratings span',
			' .wp-block-themeisle-blocks-review__header .wp-block-themeisle-blocks-review__header_meta .wp-block-themeisle-blocks-review__header_price',
			' .wp-block-themeisle-blocks-review__left .wp-block-themeisle-blocks-review__left_details p',
			' .wp-block-themeisle-blocks-review__left .wp-block-themeisle-blocks-review__left_features .wp-block-themeisle-blocks-review__left_feature span',
			' .wp-block-themeisle-blocks-review__right .wp-block-themeisle-blocks-review__right_pros h4',
			' .wp-block-themeisle-blocks-review__right .wp-block-themeisle-blocks-review__right_pros .wp-block-themeisle-blocks-review__right_pros_item p',
			' .wp-block-themeisle-blocks-review__right .wp-block-themeisle-blocks-review__right_cons h4',
			' .wp-block-themeisle-blocks-review__right .wp-block-themeisle-blocks-review__right_cons .wp-block-themeisle-blocks-review__right_cons_item p',
			' .wp-block-themeisle-blocks-review__footer .wp-block-themeisle-blocks-review__footer_label',
		);

		$css->add_item(
			array(
				'properties' => array(
					array(
						'property' => 'background-color',
						'value'    => 'backgroundColor',
					),
				),
			)
		);

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-review__header',
				'properties' => array(
					array(
						'property' => 'border-color',
						'value'    => 'primaryColor',
					),
				),
			)
		);

		foreach ( $selectors as $selector ) {
			$css->add_item(
				array(
					'selector'   => $selector,
					'properties' => array(
						array(
							'property' => 'color',
							'value'    => 'textColor',
						),
					),
				)
			);
		}

		$css->add_item(
			array(
				'selector'   => ' .wp-block-themeisle-blocks-review__footer .wp-block-themeisle-blocks-review__footer_buttons a',
				'properties' => array(
					array(
						'property' => 'color',
						'value'    => 'buttonTextColor',
					),
					array(
						'property' => 'background-color',
						'value'    => 'primaryColor',
					),
				),
			)
		);

		$style = $css->generate();

		return $style;
	}
}
