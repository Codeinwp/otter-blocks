<?php
/**
 * Form_Multiple_Choice_Block
 *
 * @package ThemeIsle\GutenbergBlocks\Render
 */

namespace ThemeIsle\GutenbergBlocks\Render;

/**
 * Form_Multiple_Choice_Block
 */
class Form_Multiple_Choice_Block {

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

		$class_names = 'wp-block-themeisle-blocks-form-multiple-choice ' . ( isset( $attributes['className'] ) ? $attributes['className'] : '' );
		$id          = isset( $attributes['id'] ) ? $attributes['id'] : '';
		$options     = isset( $attributes['options'] ) ? $attributes['options'] : '';
		$field_type  = isset( $attributes['type'] ) ? $attributes['type'] : 'checkbox';

		$output  = '<div class="' . $class_names . '" id="' . $id . '">';
		$output .= '<label class="otter-form-input-label" >' . $attributes['label'] . '</label>';

		$options_array = explode( "\n", $options );

		foreach ( $options_array as $field_label ) {
			$field_value = implode( '_', explode( ' ', sanitize_title( $field_label ) ) );
			$field_id    = 'field-' . $field_value;

			$output .= $this->render_field( $field_type, $field_label, $field_value, $id, $field_id );
		}

		$output .= '</div>';
		return $output;
	}

	/**
	 * Render an input field.
	 *
	 * @param string $type The type of the field (checkbox, radio).
	 * @param string $label The label of the field.
	 * @param string $value The value of the field.
	 * @param string $name The name of the field.
	 * @param string $id The id of the field.
	 * @return string
	 */
	public function render_field( $type, $label, $value, $name, $id ) {
		$output = '<div class="o-form-multiple-choice-field">';

		$output .= '<input type="' . $type . '" name="' . $name . '" id="' . $id . '" value="' . $value . '" />';
		$output .= '<label for="' . $id . '" class="o-form-choice-label__label">' . $label . '</label>';

		$output .= '</div>';

		return $output;
	}
}
