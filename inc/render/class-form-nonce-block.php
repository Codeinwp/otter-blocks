<?php
/**
 * Form_Nonce_Block
 *
 * @package ThemeIsle\GutenbergBlocks\Render
 */

namespace ThemeIsle\GutenbergBlocks\Render;

use ThemeIsle\GutenbergBlocks\Base_Block;

/**
 * Class Form_Nonce_Block
 */
class Form_Nonce_Block extends Base_Block {

	/**
	 * Every block needs a slug, so we need to define one and assign it to the `$this->block_slug` property
	 *
	 * @return mixed
	 */
	protected function set_block_slug() {
		$this->block_slug = 'form-nonce';
	}

	/**
	 * Set the attributes required on the server side.
	 *
	 * @return mixed
	 */
	protected function set_attributes() {
		$this->attributes = array();
	}

	/**
	 * Block render function for server-side.
	 *
	 * This method will pe passed to the render_callback parameter and it will output
	 * the server side output of the block.
	 *
	 * @param array $attributes Block attrs.
	 * @return mixed|string
	 */
	protected function render( $attributes ) {
		$output = '<div class="protection">';
		if ( isset( $attributes['formId'] ) ) {
			$output .= wp_nonce_field( 'form-verification', $attributes['formId'] . '_nonce_field', true, false );
		} else {
			$output .= wp_nonce_field( 'form-verification', '_nonce_field', true, false );
		}
		$output .= '</div>';
		return $output;
	}
}
