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

		$class_names   = 'wp-block-themeisle-blocks-form-hidden-field ' . ( isset( $attributes['className'] ) ? $attributes['className'] : '' );
		$id            = isset( $attributes['id'] ) ? $attributes['id'] : '';
		$label         = isset( $attributes['label'] ) ? $attributes['label'] : __( 'Hidden Field', 'otter-blocks' );
		$param_name    = isset( $attributes['paramName'] ) ? $attributes['paramName'] : '';
		$mapped_name   = isset( $attributes['mappedName'] ) ? $attributes['mappedName'] : 'field-' . $id;
		$default_value = isset( $attributes['defaultValue'] ) ? $attributes['defaultValue'] : '';


		$output = '<div style="display: none;" class="' . $class_names . '" id="' . $id . '">';

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
