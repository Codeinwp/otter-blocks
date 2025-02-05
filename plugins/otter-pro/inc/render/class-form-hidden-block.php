<?php
/**
 * Form_Hidden_Block
 *
 * @package ThemeIsle\OtterPro\Render
 */

namespace ThemeIsle\OtterPro\Render;

use ThemeIsle\OtterPro\Plugins\License;

/**
 * Form_Hidden_Block
 */
class Form_Hidden_Block {

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

		if ( ! License::has_active_license() ) {
			return '';
		}

		$id            = isset( $attributes['id'] ) ? esc_attr( $attributes['id'] ) : '';
		$label         = isset( $attributes['label'] ) ? esc_html( $attributes['label'] ) : __( 'Hidden Field', 'otter-pro' );
		$param_name    = isset( $attributes['paramName'] ) ? esc_attr( $attributes['paramName'] ) : '';
		$mapped_name   = isset( $attributes['mappedName'] ) ? esc_attr( $attributes['mappedName'] ) : 'field-' . $id;
		$default_value = isset( $attributes['defaultValue'] ) ? esc_attr( $attributes['defaultValue'] ) : '';

		$wrapper_attributes = get_block_wrapper_attributes(
			array(
				'id' => $id,
			)
		);

		$output = '<div style="display: none;" ' . $wrapper_attributes . '>';

		$output .= '<label class="otter-form-input-label" for="' . $mapped_name . '">' . $label . '</label>';

		$output .= '<input type="hidden" class="otter-form-input" name="'
			. $mapped_name . '" '
			. ( ! empty( $param_name ) ? 'data-param-name="' . $param_name . '"' : '' )
			. ( ! empty( $default_value ) ? 'value="' . $default_value . '"' : '' )
			. ' />';

		$output .= '</div>';


		return $output;
	}
}
