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
		$id         = isset( $attributes['id'] ) ? esc_attr( $attributes['id'] ) : '';
		$options    = isset( $attributes['options'] ) ? $attributes['options'] : array();
		$field_type = isset( $attributes['type'] ) ? esc_attr( $attributes['type'] ) : 'checkbox';
		$label      = isset( $attributes['label'] ) ? esc_html( $attributes['label'] ) : __( 'Select option', 'otter-blocks' );
		$help_text  = isset( $attributes['helpText'] ) ? esc_html( $attributes['helpText'] ) : '';

		$is_required            = isset( $attributes['isRequired'] ) ? boolval( $attributes['isRequired'] ) : false;
		$has_multiple_selection = isset( $attributes['multipleSelection'] ) ? boolval( $attributes['multipleSelection'] ) : false;
		$mapped_name            = isset( $attributes['mappedName'] ) ? esc_attr( $attributes['mappedName'] ) : $id;

		$wrapper_attributes = get_block_wrapper_attributes(
			array(
				'id' => $id,
			)
		);

		$output = '<div ' . $wrapper_attributes . '>';

		// Compatibility with the old version of the block.
		if ( ! empty( $options ) && is_string( $options ) ) {
			$options = explode( "\n", $options );
		}

		if ( 'select' === $field_type ) {
			$output .= $this->render_select_field( $label, $options, $id, $mapped_name, $has_multiple_selection, $is_required );
		} else {
			$output .= '<label class="otter-form-input-label" >' . $label . $this->render_required_sign( $is_required ) . '</label>';

			$output .= '<div class="o-form-choices">';

			foreach ( $options as $choice ) {
				if ( empty( $choice['content'] ) ) {
					continue;
				}

				$field_value = implode( '_', explode( ' ', esc_attr( $choice['content'] ) ) );
				$field_id    = 'field-' . esc_attr( $field_value );
				$checked     = isset( $choice['isDefault'] ) && $choice['isDefault'];

				$output .= $this->render_field( $field_type, $choice['content'], $field_value, $mapped_name, $field_id, $checked, $is_required );
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
	 * @param bool   $checked The checked status of the field.
	 * @param bool   $is_required The required status of the field.
	 * @return string
	 */
	public function render_field( $type, $label, $value, $name, $id, $checked = false, $is_required = false ) {
		$output = '<div class="o-form-multiple-choice-field">';

		$output .= '<input type="' . esc_attr( $type ) . '" name="' . esc_attr( $name ) . '" id="' . esc_attr( $id ) . '" value="' . esc_attr( $value ) . '" ' . ( $is_required ? 'required' : '' ) . ( $checked ? ' checked' : '' ) . ' />';
		
		$allowed_tags = array(
			'a'      => array(
				'href'   => true,
				'target' => true,
			),
			'img'    => array(
				'src'    => true,
				'alt'    => true,
				'width'  => true,
				'height' => true,
			),
			'span'   => array(),
			'em'     => array(),
			'strong' => array(),
			'i'      => array(),
			'b'      => array(),
		);
		
		$label = wp_kses( $label, $allowed_tags );

		$output .= '<label for="' . esc_attr( $id ) . '" class="o-form-choice-label">' . $label . '</label>';

		$output .= '</div>';

		return $output;
	}

	/**
	 * Render a select field.
	 *
	 * @param string $label The label of the field.
	 * @param array  $options_array The options of the field.
	 * @param string $id The id of the field.
	 * @param string $name The name of the field.
	 * @param bool   $is_multiple The multiple status of the field.
	 * @param bool   $is_required The required status of the field.
	 * @return string
	 */
	public function render_select_field( $label, $options_array, $id, $name, $is_multiple, $is_required ) {
		$output  = '<label class="otter-form-input-label" for="' . esc_attr( $id ) . '" >' . $label . $this->render_required_sign( $is_required ) . '</label>';
		$output .= '<select id="' . esc_attr( $id ) . '" ' . ( $is_multiple ? ' multiple ' : '' ) . ( $is_required ? ' required ' : '' ) . ' name="' . esc_attr( $name ) . '">';

		foreach ( $options_array as $option ) {

			if ( empty( $option['content'] ) ) {
				continue;
			}

			$is_selected = isset( $option['isDefault'] ) && $option['isDefault'];

			$field_value = implode( '_', explode( ' ', sanitize_title( $option['content'] ) ) );
			$output     .= '<option value="' . esc_attr( $field_value ) . '"' . ( $is_selected ? 'selected' : '' ) . '>' . esc_html( $option['content'] ) . '</option>';
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
