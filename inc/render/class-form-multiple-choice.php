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

		$class_names            = 'wp-block-themeisle-blocks-form-multiple-choice ' . ( isset( $attributes['className'] ) ? $attributes['className'] : '' );
		$id                     = isset( $attributes['id'] ) ? $attributes['id'] : '';
		$options                = isset( $attributes['options'] ) ? $attributes['options'] : '';
		$field_type             = isset( $attributes['type'] ) ? $attributes['type'] : 'checkbox';
		$label                  = isset( $attributes['label'] ) ? $attributes['label'] : __( 'Select option', 'otter-blocks' );
		$help_text              = isset( $attributes['helpText'] ) ? $attributes['helpText'] : '';
		$options_array          = explode( "\n", $options );
		$is_required            = isset( $attributes['isRequired'] ) ? boolval( $attributes['isRequired'] ) : false;
		$has_multiple_selection = isset( $attributes['multipleSelection'] ) ? boolval( $attributes['multipleSelection'] ) : false;

		$output = '<div class="' . $class_names . '" id="' . $id . '">';

		if ( 'select' === $field_type ) {
			$output .= $this->render_select_field( $label, $options_array, $id, $has_multiple_selection, $is_required );
		} else {
			$output .= '<label class="otter-form-input-label" >' . $label . $this->render_required_sign( $is_required ) . '</label>';

			$output .= '<div class="o-form-choices">';

			foreach ( $options_array as $field_label ) {
				if ( empty( $field_label ) ) {
					continue;
				}

				$field_value = implode( '_', explode( ' ', sanitize_title( $field_label ) ) );
				$field_id    = 'field-' . $field_value;

				$output .= $this->render_field( $field_type, $field_label, $field_value, $id, $field_id, $is_required );
			}

			$output .= '</div>';
		}

		$output .= '<span class="o-form-help">' . $help_text . '</span>';

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
	 * @param bool   $is_required The required status of the field.
	 * @return string
	 */
	public function render_field( $type, $label, $value, $name, $id, $is_required = false ) {
		$output = '<div class="o-form-multiple-choice-field">';

		$output .= '<input type="' . $type . '" name="' . $name . '" id="' . $id . '" value="' . $value . '" ' . ( $is_required ? 'required' : '' ) . ' />';
		$output .= '<label for="' . $id . '" class="o-form-choice-label">' . $label . '</label>';

		$output .= '</div>';

		return $output;
	}

	/**
	 * Render a select field.
	 *
	 * @param string $label The label of the field.
	 * @param array  $options_array The options of the field.
	 * @param string $id The id of the field.
	 * @param bool   $is_multiple The multiple status of the field.
	 * @param bool   $is_required The required status of the field.
	 * @return string
	 */
	public function render_select_field( $label, $options_array, $id, $is_multiple, $is_required ) {
		$output  = '<label class="otter-form-input-label" for="' . $id . '" >' . $label . $this->render_required_sign( $is_required ) . '</label>';
		$output .= '<select id="' . $id . '" ' . ( $is_multiple ? ' multiple ' : '' ) . ( $is_required ? ' required ' : '' ) . '>';

		foreach ( $options_array as $field_label ) {

			if ( empty( $field_label ) ) {
				continue;
			}

			$field_value = implode( '_', explode( ' ', sanitize_title( $field_label ) ) );
			$output     .= '<option value="' . $field_value . '">' . $field_label . '</option>';
		}

		$output .= '</select>';
		return $output;
	}

	/**
	 * Render the required sign.
	 * 
	 * @param bool $is_required The required status of the field.
	 * @return string
	 */
	public function render_required_sign( $is_required ) {
		return $is_required ? '<span class="required">*</span>' : '';
	}
}
