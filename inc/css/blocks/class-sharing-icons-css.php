<?php
/**
 * Css handling logic for blocks.
 *
 * @package ThemeIsle\GutenbergBlocks\CSS\Blocks
 */

namespace ThemeIsle\GutenbergBlocks\CSS\Blocks;

use ThemeIsle\GutenbergBlocks\Base_CSS;
use ThemeIsle\GutenbergBlocks\CSS\CSS_Utility;
use ThemeIsle\GutenbergBlocks\Render\Sharing_Icons_Block;

/**
 * Class Sharing_Icons_CSS
 */
class Sharing_Icons_CSS extends Base_CSS {

	/**
	 * The namespace under which the blocks are registered.
	 *
	 * @var string
	 */
	public $block_prefix = 'sharing-icons';

	/**
	 * Generate Sharing Icons CSS
	 *
	 * @param mixed $block Block data.
	 * @return string
	 * @access  public
	 */
	public function render_css( $block ) {
		$css             = new CSS_Utility( $block );
		$social_profiles = Sharing_Icons_Block::get_social_profiles();

		foreach ( $social_profiles as $icon => $attrs ) {
			$css->add_item(
				array(
					'selector'   => ' .is-' . $icon,
					'properties' => array(
						array(
							'property'  => '--icon-bg-color',
							'value'     => $icon,
							'format'    => function( $value, $attrs ) {
								return $value['backgroundColor'];
							},
							'condition' => function( $attrs ) use ( $icon ) {
								return isset( $attrs[ $icon ]['backgroundColor'] );
							},
						),
						array(
							'property'  => '--text-color',
							'value'     => $icon,
							'format'    => function( $value, $attrs ) {
								return $value['textColor'];
							},
							'condition' => function( $attrs ) use ( $icon ) {
								return isset( $attrs[ $icon ]['textColor'] );
							},
						),
					),
				)
			);
		}

		$css->add_item(
			array(
				'properties' => array(
					array(
						'property' => '--icons-gap',
						'value'    => 'gap',
						'unit'     => 'px',
					),
					array(
						'property' => '--border-radius',
						'value'    => 'borderRadius',
						'unit'     => 'px',
					),
				),
			)
		);

		return $css->generate();
	}
}
