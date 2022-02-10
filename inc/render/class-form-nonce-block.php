<?php
/**
 * Form_Nonce_Block
 *
 * @package ThemeIsle\GutenbergBlocks\Render
 */

namespace ThemeIsle\GutenbergBlocks\Render;

/**
 * Class Form_Nonce_Block
 */
class Form_Nonce_Block {

	/**
	 * Block render function for server-side.
	 *
	 * This method will pe passed to the render_callback parameter and it will output
	 * the server side output of the block.
	 *
	 * @param array $attributes Block attrs.
	 * @return mixed|string
	 */
	public function render( $attributes ) {
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
